import { v } from "convex/values";
import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import {
  internalMutation,
  mutation,
  query,
  MutationCtx,
  QueryCtx,
} from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { getCurrentUser, getOrCreateCurrentUser, requireAdmin } from "./users";
import {
  computeReferredDiscount,
  conversionCreditOutstanding,
  conversionCreditState,
  conversionTransition,
  generateAffiliateSlug,
  hasCouponIdentity,
  isReservedAffiliateSlug,
  isValidAffiliateSlug,
  referredEligibility,
  nextTier,
  normalizeAffiliateSlug,
  normalizeCustomerEmail,
  referralCodeReason,
  resolveConversionCredit,
  resolveReferralSource,
  resolveTierRewardPercent,
  validateAffiliateSettings,
  withSettingsDefaults,
  BLOCKING_CONVERSION_STATUSES,
  PRIOR_RENTAL_BOOKING_STATUSES,
  type AffiliateSettingsData,
  type ConversionBookingStatus,
  type ConversionStatus,
  type ConversionTransition,
  type ReferralCodeReason,
  type ReferralSource,
  type ReferredIneligibilityReason,
  type WalletTransactionData,
} from "../lib/pricing";

const DAY_MS = 24 * 60 * 60 * 1000;

const tierValidator = v.object({
  minConversions: v.number(),
  rewardPercent: v.number(),
  name: v.optional(v.string()),
});

const referredDiscountValidator = v.object({
  type: v.union(v.literal("percentage"), v.literal("fixed")),
  value: v.number(),
});

/** The {slug, visitorKey} pair the checkout reads from the referral cookie. */
export const referralArgValidator = v.object({
  slug: v.string(),
  visitorKey: v.string(),
});

const settingsValidator = v.object({
  enabled: v.boolean(),
  attributionWindowDays: v.number(),
  referredDiscountType: v.union(v.literal("percentage"), v.literal("fixed")),
  referredDiscountValue: v.number(),
  tiers: v.array(tierValidator),
  maxRedemptionPercent: v.number(),
  creditValidityMonths: v.number(),
  autoApproveOnCompletion: v.boolean(),
  referredFirstRentalOnly: v.boolean(),
});

const conversionStatusValidator = v.union(
  v.literal("pending"),
  v.literal("awaitingApproval"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("voided"),
  v.literal("confirmed"),
);

/**
 * Settings doc or the seeded defaults when no admin has saved one yet; a doc
 * saved before the wallet rollout has its missing fields filled with defaults.
 */
async function loadSettings(
  ctx: QueryCtx | MutationCtx,
): Promise<AffiliateSettingsData> {
  return withSettingsDefaults(await ctx.db.query("affiliateSettings").first());
}

/**
 * Approved-conversion count. Reads the v1 counter while the wallet migration
 * widens (convex/migrations/README.md); both are written on every update.
 */
function approvedCount(affiliate: Doc<"affiliates">): number {
  return affiliate.approvedConversions ?? affiliate.confirmedConversions;
}

/** Keeps the v1 and v2 counters identical until the narrow step drops v1. */
function counterPatch(next: number) {
  const value = Math.max(0, next);
  return { confirmedConversions: value, approvedConversions: value };
}

/** Shape + reserved-word gate, shared by the admin and self-service paths. */
function assertUsableSlug(slug: string): void {
  if (!isValidAffiliateSlug(slug)) {
    throw new Error(
      "Slug must be 3-32 characters: lowercase letters, digits and hyphens.",
    );
  }
  if (isReservedAffiliateSlug(slug)) {
    throw new Error(`Slug "${slug}" is reserved.`);
  }
}

async function findBySlug(
  ctx: QueryCtx | MutationCtx,
  slug: string,
): Promise<Doc<"affiliates"> | null> {
  return await ctx.db
    .query("affiliates")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
}

function referredDiscountConfig(
  settings: AffiliateSettingsData,
  affiliate: Doc<"affiliates">,
) {
  return (
    affiliate.referredDiscountOverride ?? {
      type: settings.referredDiscountType,
      value: settings.referredDiscountValue,
    }
  );
}

// --- Settings (admin) ---

export const getSettings = query({
  args: {},
  returns: settingsValidator,
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await loadSettings(ctx);
  },
});

export const updateSettings = mutation({
  args: {
    enabled: v.boolean(),
    attributionWindowDays: v.number(),
    referredDiscountType: v.union(v.literal("percentage"), v.literal("fixed")),
    referredDiscountValue: v.number(),
    tiers: v.array(tierValidator),
    // Wallet fields are optional so a client that predates them keeps the
    // stored values instead of resetting them to the seeded defaults.
    maxRedemptionPercent: v.optional(v.number()),
    creditValidityMonths: v.optional(v.number()),
    autoApproveOnCompletion: v.optional(v.boolean()),
    referredFirstRentalOnly: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.query("affiliateSettings").first();
    const settings: AffiliateSettingsData = {
      ...withSettingsDefaults(existing),
      enabled: args.enabled,
      attributionWindowDays: args.attributionWindowDays,
      referredDiscountType: args.referredDiscountType,
      referredDiscountValue: args.referredDiscountValue,
      tiers: [...args.tiers].sort(
        (a, b) => a.minConversions - b.minConversions,
      ),
      ...(args.maxRedemptionPercent !== undefined && {
        maxRedemptionPercent: args.maxRedemptionPercent,
      }),
      ...(args.creditValidityMonths !== undefined && {
        creditValidityMonths: args.creditValidityMonths,
      }),
      ...(args.autoApproveOnCompletion !== undefined && {
        autoApproveOnCompletion: args.autoApproveOnCompletion,
      }),
      ...(args.referredFirstRentalOnly !== undefined && {
        referredFirstRentalOnly: args.referredFirstRentalOnly,
      }),
    };

    const error = validateAffiliateSettings(settings);
    if (error) {
      throw new Error(error);
    }

    if (existing) {
      await ctx.db.patch(existing._id, { ...settings, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("affiliateSettings", {
        ...settings,
        updatedAt: Date.now(),
      });
    }
    return null;
  },
});

// --- Affiliate management (admin) ---

const affiliateListItemValidator = v.object({
  _id: v.id("affiliates"),
  userId: v.id("users"),
  slug: v.string(),
  isActive: v.boolean(),
  confirmedConversions: v.number(),
  rewardPercentOverride: v.optional(v.number()),
  referredDiscountOverride: v.optional(referredDiscountValidator),
  createdAt: v.number(),
  currentRewardPercent: v.number(),
  userName: v.string(),
  userEmail: v.string(),
});

export const listAffiliates = query({
  args: {},
  returns: v.array(affiliateListItemValidator),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const settings = await loadSettings(ctx);
    const affiliates = await ctx.db.query("affiliates").order("desc").collect();
    return await Promise.all(
      affiliates.map(async (affiliate) => {
        const user = await ctx.db.get(affiliate.userId);
        return {
          _id: affiliate._id,
          userId: affiliate.userId,
          slug: affiliate.slug,
          isActive: affiliate.isActive,
          confirmedConversions: approvedCount(affiliate),
          rewardPercentOverride: affiliate.rewardPercentOverride,
          referredDiscountOverride: affiliate.referredDiscountOverride,
          createdAt: affiliate.createdAt,
          currentRewardPercent: resolveTierRewardPercent(
            settings.tiers,
            approvedCount(affiliate),
            affiliate.rewardPercentOverride,
          ),
          userName:
            user && user.deletedAt === undefined ? user.name : "(deleted user)",
          userEmail: user && user.deletedAt === undefined ? user.email : "",
        };
      }),
    );
  },
});

function assertValidOverrides(args: {
  rewardPercentOverride?: number;
  referredDiscountOverride?: { type: "percentage" | "fixed"; value: number };
}) {
  if (
    args.rewardPercentOverride !== undefined &&
    (args.rewardPercentOverride < 0 || args.rewardPercentOverride > 100)
  ) {
    throw new Error("Reward percent override must be between 0 and 100.");
  }
  if (args.referredDiscountOverride !== undefined) {
    const { type, value } = args.referredDiscountOverride;
    if (value <= 0 || (type === "percentage" && value > 100)) {
      throw new Error("Referred discount override is out of range.");
    }
  }
}

export const createAffiliate = mutation({
  args: {
    userEmail: v.string(),
    slug: v.string(),
  },
  returns: v.id("affiliates"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const slug = normalizeAffiliateSlug(args.slug);
    assertUsableSlug(slug);
    if (await findBySlug(ctx, slug)) {
      throw new Error(`Slug "${slug}" is already taken.`);
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail.trim()))
      .first();
    if (!user || user.deletedAt !== undefined) {
      throw new Error(
        "No user with that email. They must sign in once before becoming an affiliate.",
      );
    }
    const existingForUser = await ctx.db
      .query("affiliates")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    if (existingForUser) {
      throw new Error(
        `That user is already the affiliate "${existingForUser.slug}".`,
      );
    }

    return await ctx.db.insert("affiliates", {
      userId: user._id,
      slug,
      isActive: true,
      ...counterPatch(0),
      createdAt: Date.now(),
    });
  },
});

export const updateAffiliate = mutation({
  args: {
    id: v.id("affiliates"),
    slug: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    // null clears an override; undefined leaves it unchanged
    rewardPercentOverride: v.optional(v.union(v.number(), v.null())),
    referredDiscountOverride: v.optional(
      v.union(referredDiscountValidator, v.null()),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const affiliate = await ctx.db.get(args.id);
    if (!affiliate) {
      throw new Error("Affiliate not found.");
    }

    const patch: Partial<Doc<"affiliates">> = {};
    if (args.slug !== undefined) {
      const slug = normalizeAffiliateSlug(args.slug);
      assertUsableSlug(slug);
      if (slug !== affiliate.slug && (await findBySlug(ctx, slug))) {
        throw new Error(`Slug "${slug}" is already taken.`);
      }
      patch.slug = slug;
    }
    if (args.isActive !== undefined) patch.isActive = args.isActive;
    if (args.rewardPercentOverride !== undefined) {
      patch.rewardPercentOverride = args.rewardPercentOverride ?? undefined;
    }
    if (args.referredDiscountOverride !== undefined) {
      patch.referredDiscountOverride =
        args.referredDiscountOverride ?? undefined;
    }
    assertValidOverrides({
      rewardPercentOverride: patch.rewardPercentOverride,
      referredDiscountOverride: patch.referredDiscountOverride,
    });

    await ctx.db.patch(args.id, patch);
    return null;
  },
});

const conversionListItemValidator = v.object({
  _id: v.id("referralConversions"),
  bookingType: v.union(v.literal("reservation"), v.literal("transfer")),
  reservationId: v.optional(v.id("reservations")),
  transferId: v.optional(v.id("transfers")),
  referredEmail: v.string(),
  status: conversionStatusValidator,
  referredDiscountAmount: v.number(),
  createdAt: v.number(),
  voidedAt: v.optional(v.number()),
});

export const listConversions = query({
  args: {
    affiliateId: v.id("affiliates"),
    status: v.optional(conversionStatusValidator),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(conversionListItemValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const status = args.status;
    const base = ctx.db
      .query("referralConversions")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", args.affiliateId));
    // One affiliate's conversions are already a bounded slice, so the status
    // predicate rides along as a filter rather than earning its own index.
    const result = await (
      status === undefined
        ? base
        : base.filter((q) => q.eq(q.field("status"), status))
    )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: result.page.map((c) => ({
        _id: c._id,
        bookingType: c.bookingType,
        reservationId: c.reservationId,
        transferId: c.transferId,
        referredEmail: c.referredEmail,
        status: c.status,
        referredDiscountAmount: c.referredDiscountAmount,
        createdAt: c.createdAt,
        voidedAt: c.voidedAt,
      })),
    };
  },
});

/**
 * Manual fraud lever: void a conversion without touching the booking. The
 * decrement happens in the same transaction as the status flip, so the
 * counter can never drift (see syncConversionForBooking for the OCC note).
 */
export const voidConversion = mutation({
  args: { conversionId: v.id("referralConversions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const conversion = await ctx.db.get(args.conversionId);
    if (!conversion) {
      throw new Error("Conversion not found.");
    }
    // An admin void is the same transition a cancelled booking triggers, so
    // it goes through the same table and reverses a minted credit too.
    const transition = conversionTransition({
      current: conversion.status,
      bookingStatus: "cancelled",
    });
    if (!transition) {
      throw new Error("Conversion is already voided.");
    }
    await applyConversionTransition(ctx, conversion, transition);
    return null;
  },
});

// --- Referral capture (public) ---

/**
 * Records a consented referral click. Called from the client AFTER the
 * cookie-consent gate grants consent — the server never sees non-consented
 * visitors. Last-click wins: a newer click overwrites the visitor's previous
 * attribution. Returns the attribution window so the client can align the
 * cookie's Max-Age (the server re-checks expiresAt regardless — the cookie is
 * a carrier, not the authority).
 */
export const recordReferralAttribution = mutation({
  args: {
    slug: v.string(),
    visitorKey: v.string(),
  },
  returns: v.union(v.object({ attributionWindowDays: v.number() }), v.null()),
  handler: async (ctx, args) => {
    const slug = normalizeAffiliateSlug(args.slug);
    if (
      !isValidAffiliateSlug(slug) ||
      args.visitorKey.length < 8 ||
      args.visitorKey.length > 64
    ) {
      return null;
    }

    const settings = await loadSettings(ctx);
    if (!settings.enabled) return null;

    const affiliate = await findBySlug(ctx, slug);
    if (!affiliate || !affiliate.isActive) return null;

    // Self-referral guard (where determinable): an affiliate clicking their
    // own link while signed in gets no attribution. The email-based guard at
    // booking time covers the rest. Get-or-create so a signed-in visitor the
    // webhook sync missed still gets their row created here.
    const currentUser = await getOrCreateCurrentUser(ctx);
    if (currentUser && currentUser._id === affiliate.userId) return null;

    const now = Date.now();
    const attribution = {
      affiliateId: affiliate._id,
      slug,
      visitorKey: args.visitorKey,
      createdAt: now,
      expiresAt: now + settings.attributionWindowDays * DAY_MS,
    };
    const existing = await ctx.db
      .query("referralAttributions")
      .withIndex("by_visitor_key", (q) => q.eq("visitorKey", args.visitorKey))
      .first();
    if (existing) {
      await ctx.db.replace(existing._id, attribution);
    } else {
      await ctx.db.insert("referralAttributions", attribution);
    }
    return { attributionWindowDays: settings.attributionWindowDays };
  },
});

// --- Discount resolution (shared by preview query and booking mutations) ---

export interface ReferredDiscountCandidate {
  affiliateId: Id<"affiliates">;
  slug: string;
  discountAmount: number;
  /** Referrer's reward percent at this moment, snapshotted on the conversion. */
  rewardPercentSnapshot: number;
  /**
   * How the referral reached this booking. A typed code has no attribution
   * row yet — the booking mutation mints one (recordTypedCodeAttribution) so
   * both paths leave the same trail behind the identical conversion row.
   */
  attributionSource: "typedCode" | "link";
  /** Set for the link path only; the typed path gets its id at booking time. */
  attributionId?: Id<"referralAttributions">;
}

/**
 * Has this customer rented before? Bounded existence checks only: one indexed
 * `.first()` per (key, live status), never a scan of a customer's history.
 * Matches by account AND by normalized booking email, so signing up with a
 * fresh account does not reset the welcome offer. The booking being created
 * is not in the table yet, so it can never count against itself.
 */
async function hasPriorRental(
  ctx: QueryCtx | MutationCtx,
  identity: { userId?: Id<"users">; email: string },
): Promise<boolean> {
  const { userId, email } = identity;
  for (const status of PRIOR_RENTAL_BOOKING_STATUSES) {
    if (userId) {
      const reservation = await ctx.db
        .query("reservations")
        .withIndex("by_user_and_status", (q) =>
          q.eq("userId", userId).eq("status", status),
        )
        .first();
      if (reservation) return true;
      const transfer = await ctx.db
        .query("transfers")
        .withIndex("by_user_and_status", (q) =>
          q.eq("userId", userId).eq("status", status),
        )
        .first();
      if (transfer) return true;
    }
    if (email) {
      const reservation = await ctx.db
        .query("reservations")
        .withIndex("by_customer_email_and_status", (q) =>
          q.eq("customerEmailNormalized", email).eq("status", status),
        )
        .first();
      if (reservation) return true;
      const transfer = await ctx.db
        .query("transfers")
        .withIndex("by_customer_email_and_status", (q) =>
          q.eq("customerEmailNormalized", email).eq("status", status),
        )
        .first();
      if (transfer) return true;
    }
  }
  return false;
}

/**
 * The affiliate a referral source points at. A typed code is a plain slug
 * lookup (the customer entered it deliberately); a cookie pair is only
 * trusted when it matches a live, unexpired attribution row recorded via
 * recordReferralAttribution, so a fabricated cookie attributes nothing.
 */
async function affiliateForSource(
  ctx: QueryCtx | MutationCtx,
  source: ReferralSource,
): Promise<{
  affiliate: Doc<"affiliates"> | null;
  /** The link path's attribution row; a typed code mints its own at booking. */
  attributionId?: Id<"referralAttributions">;
}> {
  if (source.kind === "typedCode") {
    return { affiliate: await findBySlug(ctx, source.slug) };
  }
  const attribution = await ctx.db
    .query("referralAttributions")
    .withIndex("by_visitor_key", (q) => q.eq("visitorKey", source.visitorKey))
    .first();
  if (
    !attribution ||
    attribution.expiresAt <= Date.now() ||
    attribution.slug !== source.slug
  ) {
    return { affiliate: null };
  }
  return {
    affiliate: await ctx.db.get(attribution.affiliateId),
    attributionId: attribution._id,
  };
}

export type ReferredCandidateResult =
  | { eligible: true; candidate: ReferredDiscountCandidate }
  | { eligible: false; reason: ReferredIneligibilityReason };

/**
 * Everything the referred discount needs once the affiliate is known, shared
 * by the link path, the typed-code path and the typed-code checkout preview.
 */
async function evaluateReferredCandidate(
  ctx: QueryCtx | MutationCtx,
  args: {
    settings: AffiliateSettingsData;
    affiliate: Doc<"affiliates">;
    currentUser: Doc<"users"> | null;
    email: string;
    subtotal: number;
    attributionSource: "typedCode" | "link";
    attributionId?: Id<"referralAttributions">;
  },
): Promise<ReferredCandidateResult> {
  // A soft-deleted owner is treated as missing — eligibility fails closed
  const ownerUserDoc = await ctx.db.get(args.affiliate.userId);
  const ownerUser =
    ownerUserDoc && ownerUserDoc.deletedAt === undefined ? ownerUserDoc : null;

  // One referred discount/conversion per customer per affiliate: any live
  // (non-voided) prior conversion blocks a repeat; voided ones (the earlier
  // booking was cancelled) free the slot. Status is in the index, so each
  // blocking status is a targeted .first() — no amount of voided history can
  // hide an existing live conversion. Race-safe like the coupon checks: a
  // losing OCC transaction re-runs this read after the winner's insert.
  const livePrior = (
    await Promise.all(
      BLOCKING_CONVERSION_STATUSES.map((status) =>
        ctx.db
          .query("referralConversions")
          .withIndex("by_affiliate_email_status", (q) =>
            q
              .eq("affiliateId", args.affiliate._id)
              .eq("referredEmail", args.email)
              .eq("status", status),
          )
          .first(),
      ),
    )
  ).some((row) => row !== null);

  const priorRental = args.settings.referredFirstRentalOnly
    ? await hasPriorRental(ctx, {
        userId: args.currentUser?._id,
        email: args.email,
      })
    : false;

  // Fails closed when the owner user row is missing (orphaned affiliate)
  const eligibility = referredEligibility({
    ownerUser: ownerUser ? { id: ownerUser._id, email: ownerUser.email } : null,
    bookerUserId: args.currentUser?._id,
    customerEmail: args.email,
    hasLiveConversion: livePrior,
    hasPriorRental: priorRental,
    firstRentalOnly: args.settings.referredFirstRentalOnly,
  });
  if (!eligibility.eligible) {
    return { eligible: false, reason: eligibility.reason };
  }

  return {
    eligible: true,
    candidate: {
      affiliateId: args.affiliate._id,
      slug: args.affiliate.slug,
      discountAmount: computeReferredDiscount(
        args.subtotal,
        referredDiscountConfig(args.settings, args.affiliate),
      ),
      rewardPercentSnapshot: resolveTierRewardPercent(
        args.settings.tiers,
        approvedCount(args.affiliate),
        args.affiliate.rewardPercentOverride,
      ),
      attributionSource: args.attributionSource,
      attributionId: args.attributionId,
    },
  };
}

/**
 * Resolve the automatic (affiliate-source) discount candidate from server
 * data only. The client's {slug, visitorKey} pair must match a live,
 * unexpired attribution row recorded via recordReferralAttribution — a
 * fabricated cookie attributes nothing. Amounts always come from the
 * admin-configured settings/overrides applied to the server-recomputed
 * subtotal; nothing money-shaped is client-supplied.
 */
export async function resolveAffiliateCandidates(
  ctx: QueryCtx | MutationCtx,
  args: {
    referral?: { slug: string; visitorKey: string };
    /** Affiliate slug typed into the promo field — no cookie, no consent. */
    typedCode?: string;
    currentUser: Doc<"users"> | null;
    customerEmail: string;
    subtotal: number;
  },
): Promise<{
  referred: ReferredDiscountCandidate | null;
  /**
   * Why a typed code granted nothing. Non-null ONLY for a code the customer
   * entered: the booking mutation turns it into a ConvexError, because
   * checkout showed that discount and silently charging full price would be
   * a bait-and-switch. The cookie path stays silent — it is automatic, and
   * the customer was never shown a promise to break.
   */
  typedCodeRejection: ReferralCodeReason | null;
}> {
  const typedCode = args.typedCode?.trim() ?? "";
  const settings = await loadSettings(ctx);
  if (!settings.enabled) {
    return {
      referred: null,
      typedCodeRejection: typedCode ? "notFound" : null,
    };
  }

  const email = normalizeCustomerEmail(args.customerEmail);
  let referred: ReferredDiscountCandidate | null = null;

  // Same identity rule as coupon redemption (hasCouponIdentity): without a
  // user account or a non-blank email there is nothing to key the
  // per-customer dedupe or the self-referral email check on, so no referred
  // discount and no conversion.
  const hasIdentity = hasCouponIdentity({
    userId: args.currentUser?._id,
    email: args.customerEmail,
  });

  // A code typed into the promo field wins over the cookie (resolveReferralSource)
  const source = resolveReferralSource({
    typedCode,
    cookieReferral: args.referral ?? null,
  });
  // A typed code that did not become the source failed the slug shape check
  let typedCodeRejection: ReferralCodeReason | null =
    typedCode && source?.kind !== "typedCode" ? "notFound" : null;

  if (source && hasIdentity) {
    const { affiliate, attributionId } = await affiliateForSource(ctx, source);
    if (affiliate && affiliate.isActive) {
      const result = await evaluateReferredCandidate(ctx, {
        settings,
        affiliate,
        currentUser: args.currentUser,
        email,
        subtotal: args.subtotal,
        attributionSource: source.kind,
        attributionId,
      });
      if (result.eligible) {
        referred = result.candidate;
      } else if (source.kind === "typedCode") {
        typedCodeRejection = referralCodeReason(result.reason);
      }
    } else if (source.kind === "typedCode") {
      typedCodeRejection = "notFound";
    }
  } else if (source?.kind === "typedCode") {
    typedCodeRejection = "emailRequired";
  }

  return { referred, typedCodeRejection };
}

/**
 * Advisory checkout preview of the automatic (affiliate) discount — the
 * booking mutation recomputes everything from server data. The referrer's own
 * tier reward is no longer a discount: they are paid in wallet credit, which
 * is applied as a payment after the discount (RNGO-53).
 */
export const previewAffiliateDiscount = query({
  args: {
    referral: v.optional(referralArgValidator),
    subtotal: v.number(),
    email: v.optional(v.string()),
  },
  returns: v.union(
    v.object({
      kind: v.literal("referred"),
      slug: v.string(),
      discountAmount: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    if (args.subtotal <= 0) return null;
    const currentUser = await getCurrentUser(ctx);
    const { referred } = await resolveAffiliateCandidates(ctx, {
      referral: args.referral,
      currentUser,
      customerEmail: args.email ?? "",
      subtotal: args.subtotal,
    });
    if (referred && referred.discountAmount > 0) {
      return {
        kind: "referred" as const,
        slug: referred.slug,
        discountAmount: referred.discountAmount,
      };
    }
    return null;
  },
});

/**
 * Live checkout feedback for an affiliate slug typed into the promo field.
 * Called by `coupons.validateCoupon` once no coupon matches the code, so the
 * customer sees one field that understands both kinds of code.
 *
 * Neutrality: a disabled program, an unknown slug, an inactive affiliate and
 * an orphaned owner all collapse to `notFound` — the same answer an unknown
 * coupon gets — so the field never reveals that referral codes exist, nor
 * which ones are switched off. It does NOT hide existence in general: the
 * reasons about the customer's own situation (self-referral, already
 * referred, not a first rental) are only reachable for a live slug, so a
 * determined prober can still tell a live code from a dead one. That is
 * accepted — the alternative is refusing to tell a customer why their code
 * did not work.
 */
export type TypedReferralPreview =
  | {
      valid: true;
      slug: string;
      discountType: "percentage" | "fixed";
      discountValue: number;
      discountAmount: number;
    }
  | {
      valid: false;
      reason:
        | "notFound"
        | "emailRequired"
        | Exclude<ReferredIneligibilityReason, "missingOwner">;
    };

export async function previewTypedReferralCode(
  ctx: QueryCtx,
  args: { code: string; subtotal: number; email?: string },
): Promise<TypedReferralPreview> {
  const notFound = { valid: false as const, reason: "notFound" as const };

  const slug = normalizeAffiliateSlug(args.code);
  if (!isValidAffiliateSlug(slug)) return notFound;

  const settings = await loadSettings(ctx);
  if (!settings.enabled) return notFound;

  const affiliate = await findBySlug(ctx, slug);
  if (!affiliate || !affiliate.isActive) return notFound;

  const currentUser = await getCurrentUser(ctx);
  const email = normalizeCustomerEmail(args.email ?? "");
  if (!hasCouponIdentity({ userId: currentUser?._id, email })) {
    return { valid: false, reason: "emailRequired" };
  }

  const result = await evaluateReferredCandidate(ctx, {
    settings,
    affiliate,
    currentUser,
    email,
    subtotal: args.subtotal,
    attributionSource: "typedCode",
  });
  if (!result.eligible) {
    return result.reason === "missingOwner"
      ? notFound
      : { valid: false, reason: result.reason };
  }
  // Mirrors the booking path, which only treats a positive amount as a
  // discount: never claim a code "applied" for 0 EUR off.
  if (result.candidate.discountAmount <= 0) return notFound;

  const config = referredDiscountConfig(settings, affiliate);
  return {
    valid: true,
    slug: affiliate.slug,
    discountType: config.type,
    discountValue: config.value,
    discountAmount: result.candidate.discountAmount,
  };
}

// --- Conversion lifecycle (called inside booking mutations) ---

/**
 * Record a conversion for a referred booking. A new conversion starts
 * `pending`: nothing is credited until the booking completes and an admin
 * approves it (see syncConversionForBooking and conversionTransition), so the
 * affiliate's counter is not touched here.
 *
 * Concurrency: the conversion insert happens in the booking mutation's
 * transaction, and the per-customer dedupe (resolveAffiliateCandidates) is
 * race-safe against it — the losing transaction re-runs its index read after
 * the winner's conversion insert.
 */
/**
 * Mint the attribution row for a code the customer typed at checkout. The
 * link path gets its row from the consent-gated capture mutation; here the
 * server mints the visitorKey itself, because there is no cookie and no
 * consent to ask for — the customer entered the code deliberately. Recording
 * it keeps the two paths on one shape, so the conversion, the reporting and
 * any later attribution audit read the same regardless of entry point.
 */
export async function recordTypedCodeAttribution(
  ctx: MutationCtx,
  args: { affiliateId: Id<"affiliates">; slug: string },
): Promise<Id<"referralAttributions">> {
  const settings = await loadSettings(ctx);
  const now = Date.now();
  return await ctx.db.insert("referralAttributions", {
    affiliateId: args.affiliateId,
    slug: args.slug,
    visitorKey: `typed:${crypto.randomUUID()}`,
    createdAt: now,
    expiresAt: now + settings.attributionWindowDays * DAY_MS,
  });
}

export async function recordReferralConversion(
  ctx: MutationCtx,
  args: {
    affiliateId: Id<"affiliates">;
    bookingType: "reservation" | "transfer";
    referredUserId?: Id<"users">;
    referredEmail: string;
    referredDiscountAmount: number;
    rewardPercentSnapshot: number;
    /** Link or typed code — either way the conversion joins back to its row. */
    attributionId?: Id<"referralAttributions">;
  },
): Promise<Id<"referralConversions">> {
  return await ctx.db.insert("referralConversions", {
    affiliateId: args.affiliateId,
    bookingType: args.bookingType,
    referredUserId: args.referredUserId,
    referredEmail: normalizeCustomerEmail(args.referredEmail),
    attributionId: args.attributionId,
    status: "pending",
    referredDiscountAmount: args.referredDiscountAmount,
    referrerRewardPercentAtConversion: args.rewardPercentSnapshot,
    createdAt: Date.now(),
  });
}

/**
 * Undo a minted referral credit by appending the compensating negative row,
 * never by deleting: the ledger is append-only and must stay auditable. A
 * conversion that never minted anything (or was already reversed) is a no-op.
 */
async function reverseConversionCredit(
  ctx: MutationCtx,
  conversion: Doc<"referralConversions">,
): Promise<void> {
  const rows = await ctx.db
    .query("walletTransactions")
    .withIndex("by_conversion", (q) => q.eq("conversionId", conversion._id))
    .collect();
  const outstanding = conversionCreditOutstanding(rows);
  if (outstanding <= 0) return;

  const credit = rows.find((row) => row.kind === "referralCredit");
  if (!credit) return;
  await ctx.db.insert("walletTransactions", {
    userId: credit.userId,
    kind: "creditReversal",
    amount: -outstanding,
    conversionId: conversion._id,
    createdAt: Date.now(),
  });
}

/** The booking a conversion was recorded for; null once it is hard-deleted. */
async function conversionBooking(
  ctx: QueryCtx | MutationCtx,
  conversion: Doc<"referralConversions">,
): Promise<Doc<"reservations"> | Doc<"transfers"> | null> {
  if (conversion.reservationId) {
    return await ctx.db.get(conversion.reservationId);
  }
  if (conversion.transferId) {
    return await ctx.db.get(conversion.transferId);
  }
  return null;
}

async function conversionBookingStatus(
  ctx: QueryCtx | MutationCtx,
  conversion: Doc<"referralConversions">,
): Promise<ConversionBookingStatus> {
  const booking = await conversionBooking(ctx, conversion);
  return booking ? booking.status : "deleted";
}

/**
 * Mint the referrer's credit for an approved conversion, in the approving
 * transaction. Returns the snapshot to store on the conversion, or null when
 * the conversion already holds outstanding credit — the ledger-side guard
 * behind conversionTransition's own idempotency, so a double approval can
 * never produce two live credits or two counter increments. A conversion whose
 * credit was reversed (voided, or rejected and later approved again) holds
 * nothing, so it can legitimately mint afresh.
 */
async function mintConversionCredit(
  ctx: MutationCtx,
  conversion: Doc<"referralConversions">,
  approvedAt: number,
): Promise<{ creditAmount: number; bookingTotal: number } | null> {
  // Only credits and their reversals carry a conversionId, so this sum is the
  // conversion's own live credit — redemptions never reach it.
  const existing = await ctx.db
    .query("walletTransactions")
    .withIndex("by_conversion", (q) => q.eq("conversionId", conversion._id))
    .collect();
  if (conversionCreditOutstanding(existing) > 0) return null;

  const affiliate = await ctx.db.get(conversion.affiliateId);
  if (!affiliate) return null;

  const settings = await loadSettings(ctx);
  const booking = await conversionBooking(ctx, conversion);
  if (!booking) {
    throw new Error("Cannot credit a conversion whose booking is gone.");
  }
  // What the referred customer was actually charged
  const bookingTotal = booking.totalPrice;
  const credit = resolveConversionCredit({
    tiers: settings.tiers,
    approvedConversionsBefore: approvedCount(affiliate),
    rewardPercentOverride: affiliate.rewardPercentOverride,
    bookingTotal,
    approvedAt,
    creditValidityMonths: settings.creditValidityMonths,
  });

  if (credit.amount > 0) {
    await ctx.db.insert("walletTransactions", {
      userId: affiliate.userId,
      kind: "referralCredit",
      amount: credit.amount,
      expiresAt: credit.expiresAt,
      conversionId: conversion._id,
      createdAt: approvedAt,
    });
  }
  return { creditAmount: credit.amount, bookingTotal };
}

/**
 * Whether another conversion already occupies this (affiliate, customer) slot.
 * A voided conversion only revives if nothing else does: the booking coming
 * back to life must not give one customer two live conversions with the same
 * referrer, which the booking-time dedupe would never have allowed.
 */
async function hasOtherLiveConversion(
  ctx: MutationCtx,
  conversion: Doc<"referralConversions">,
): Promise<boolean> {
  const rows = await Promise.all(
    BLOCKING_CONVERSION_STATUSES.map((status) =>
      ctx.db
        .query("referralConversions")
        .withIndex("by_affiliate_email_status", (q) =>
          q
            .eq("affiliateId", conversion.affiliateId)
            .eq("referredEmail", conversion.referredEmail)
            .eq("status", status),
        )
        .first(),
    ),
  );
  return rows.some((row) => row !== null && row._id !== conversion._id);
}

/**
 * Persist a transition's status flip and side-effects. Shared by the
 * booking-driven sync, the admin approve/reject and the admin void so they can
 * never disagree. Everything — the credit row, the snapshot and the counter —
 * lands in the caller's transaction.
 */
async function applyConversionTransition(
  ctx: MutationCtx,
  conversion: Doc<"referralConversions">,
  transition: ConversionTransition,
  actor?: { adminUserId?: Id<"users">; rejectionReason?: string },
): Promise<ConversionStatus> {
  const next = transition.nextStatus;
  if (
    conversion.status === "voided" &&
    next !== "voided" &&
    (await hasOtherLiveConversion(ctx, conversion))
  ) {
    return conversion.status;
  }

  const now = Date.now();
  // Every decision field is (re)written on every transition so a conversion
  // that leaves approved or rejected cannot keep a stale snapshot.
  const patch: Partial<Doc<"referralConversions">> = {
    status: next,
    voidedAt: next === "voided" ? now : undefined,
    rejectedAt: next === "rejected" ? now : undefined,
    rejectionReason: next === "rejected" ? actor?.rejectionReason : undefined,
    creditAmount: undefined,
    bookingTotalAtApproval: undefined,
    approvedAt: undefined,
    approvedByUserId: undefined,
  };
  let counterDelta = transition.counterDelta;

  if (transition.mintCredit) {
    const minted = await mintConversionCredit(ctx, conversion, now);
    if (minted === null) {
      counterDelta = 0;
      patch.creditAmount = conversion.creditAmount;
      patch.bookingTotalAtApproval = conversion.bookingTotalAtApproval;
      patch.approvedAt = conversion.approvedAt;
      patch.approvedByUserId = conversion.approvedByUserId;
    } else {
      patch.creditAmount = minted.creditAmount;
      patch.bookingTotalAtApproval = minted.bookingTotal;
      patch.approvedAt = now;
      patch.approvedByUserId = actor?.adminUserId;
    }
  }

  await ctx.db.patch(conversion._id, patch);

  if (transition.reverseCredit) {
    await reverseConversionCredit(ctx, conversion);
  }
  if (counterDelta !== 0) {
    const affiliate = await ctx.db.get(conversion.affiliateId);
    if (affiliate) {
      await ctx.db.patch(
        affiliate._id,
        counterPatch(approvedCount(affiliate) + counterDelta),
      );
    }
  }
  return next;
}

/**
 * Decide a conversion. Approving resolves the tier, mints the credit, bumps
 * the counter and snapshots what was granted, all in one transaction;
 * rejecting reverses a credit already minted. Idempotent — a second approval
 * produces no transition and therefore no second credit. The booking's status
 * is read rather than assumed, so deciding a conversion whose booking was
 * cancelled meanwhile voids it instead of crediting it.
 */
async function decideConversion(
  ctx: MutationCtx,
  args: {
    conversionId: Id<"referralConversions">;
    adminAction: "approve" | "reject";
    adminUserId?: Id<"users">;
    reason?: string;
  },
): Promise<ConversionStatus> {
  const conversion = await ctx.db.get(args.conversionId);
  if (!conversion) {
    throw new Error("Conversion not found.");
  }
  const transition = conversionTransition({
    current: conversion.status,
    bookingStatus: await conversionBookingStatus(ctx, conversion),
    adminAction: args.adminAction,
  });
  // The resulting status, not the requested one: an approve whose booking was
  // cancelled meanwhile comes back `voided`, and a no-op comes back unchanged.
  if (!transition) return conversion.status;
  return await applyConversionTransition(ctx, conversion, transition, {
    adminUserId: args.adminUserId,
    rejectionReason: args.reason?.trim() || undefined,
  });
}

const decisionResultValidator = v.object({ status: conversionStatusValidator });

export const approveConversion = mutation({
  args: { conversionId: v.id("referralConversions") },
  returns: decisionResultValidator,
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const status = await decideConversion(ctx, {
      conversionId: args.conversionId,
      adminAction: "approve",
      adminUserId: admin._id,
    });
    return { status };
  },
});

export const rejectConversion = mutation({
  args: {
    conversionId: v.id("referralConversions"),
    reason: v.optional(v.string()),
  },
  returns: decisionResultValidator,
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const status = await decideConversion(ctx, {
      conversionId: args.conversionId,
      adminAction: "reject",
      adminUserId: admin._id,
      reason: args.reason,
    });
    return { status };
  },
});

/**
 * Same decision, callable from `npx convex run` (which carries no user
 * identity) so the lifecycle can be exercised end to end on the dev
 * deployment before the admin approvals UI exists (RNGO-55). Internal, so it
 * is not reachable from a client.
 */
export const decideConversionAsAdmin = internalMutation({
  args: {
    conversionId: v.id("referralConversions"),
    adminAction: v.union(v.literal("approve"), v.literal("reject")),
    adminUserId: v.optional(v.id("users")),
    reason: v.optional(v.string()),
  },
  returns: decisionResultValidator,
  handler: async (ctx, args) => {
    return { status: await decideConversion(ctx, args) };
  },
});

// --- Admin approvals queue and referral history ---

/** Booking identity the admin recognises: its number and what it cost. */
async function conversionBookingSummary(
  ctx: QueryCtx,
  conversion: Doc<"referralConversions">,
): Promise<{ bookingNumber: number | null; bookingTotal: number | null }> {
  const booking = await conversionBooking(ctx, conversion);
  if (!booking) return { bookingNumber: null, bookingTotal: null };
  // Both numbers are optional fields, so `in` cannot discriminate the union.
  const bookingNumber =
    conversion.bookingType === "reservation"
      ? (booking as Doc<"reservations">).reservationNumber
      : (booking as Doc<"transfers">).transferNumber;
  return {
    bookingNumber: bookingNumber ?? null,
    bookingTotal: booking.totalPrice,
  };
}

/** Per-page memo so several rows sharing a referrer replay one ledger read. */
function ledgerCache(ctx: QueryCtx) {
  const cache = new Map<Id<"users">, Promise<WalletTransactionData[]>>();
  return (userId: Id<"users">) => {
    const cached = cache.get(userId);
    if (cached) return cached;
    const loading = ctx.db
      .query("walletTransactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()
      .then((rows) =>
        rows.map((row) => ({
          id: row._id as string,
          kind: row.kind,
          amount: row.amount,
          expiresAt: row.expiresAt,
          conversionId: row.conversionId as string | undefined,
          createdAt: row.createdAt,
        })),
      );
    cache.set(userId, loading);
    return loading;
  };
}

const pendingApprovalValidator = v.object({
  _id: v.id("referralConversions"),
  createdAt: v.number(),
  referrerName: v.string(),
  referrerSlug: v.string(),
  referredEmail: v.string(),
  bookingType: v.union(v.literal("reservation"), v.literal("transfer")),
  bookingNumber: v.union(v.number(), v.null()),
  bookingTotal: v.union(v.number(), v.null()),
  /** Tier % × total as the mint would resolve it today — not yet granted. */
  projectedCredit: v.number(),
  projectedRewardPercent: v.number(),
});

/** The queue is a manual gate; it is short by design, so a take() bounds it. */
const APPROVALS_LIMIT = 100;

export const listPendingApprovals = query({
  args: {},
  returns: v.array(pendingApprovalValidator),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const settings = await loadSettings(ctx);
    // Oldest first: the queue is worked front to back.
    const conversions = await ctx.db
      .query("referralConversions")
      .withIndex("by_status_createdAt", (q) =>
        q.eq("status", "awaitingApproval"),
      )
      .take(APPROVALS_LIMIT);

    const rows = await Promise.all(
      conversions.map(async (conversion) => {
        const affiliate = await ctx.db.get(conversion.affiliateId);
        const referrer = affiliate ? await ctx.db.get(affiliate.userId) : null;
        const { bookingNumber, bookingTotal } = await conversionBookingSummary(
          ctx,
          conversion,
        );
        // Same resolver the mint uses, so the number shown is the number
        // granted unless the tier or the booking total moves meanwhile.
        const projected = affiliate
          ? resolveConversionCredit({
              tiers: settings.tiers,
              approvedConversionsBefore: approvedCount(affiliate),
              rewardPercentOverride: affiliate.rewardPercentOverride,
              bookingTotal: bookingTotal ?? 0,
              approvedAt: conversion.createdAt,
              creditValidityMonths: settings.creditValidityMonths,
            })
          : null;

        return {
          _id: conversion._id,
          createdAt: conversion.createdAt,
          referrerName: referrer?.name ?? "(deleted user)",
          referrerSlug: affiliate?.slug ?? "",
          referredEmail: conversion.referredEmail,
          bookingType: conversion.bookingType,
          bookingNumber,
          bookingTotal,
          projectedCredit: projected?.amount ?? 0,
          projectedRewardPercent: projected?.rewardPercent ?? 0,
        };
      }),
    );
    return rows;
  },
});

const referralHistoryRowValidator = pendingApprovalValidator.extend({
  status: conversionStatusValidator,
  /** The referrer spent this conversion's credit down to nothing. */
  creditConsumed: v.boolean(),
  creditAmount: v.number(),
  reservationId: v.optional(v.id("reservations")),
  transferId: v.optional(v.id("transfers")),
  rejectionReason: v.optional(v.string()),
});

/**
 * The guide's referral table: who referred whom, off which booking, for how
 * much credit, and where that credit stands. "Consumed" is derived at read
 * time from the referrer's own ledger replay — there is no second allocator
 * and no denormalized flag that could drift.
 */
export const getReferralHistory = query({
  args: {
    status: v.optional(conversionStatusValidator),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(referralHistoryRowValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const settings = await loadSettings(ctx);
    const status = args.status;
    const result = await (
      status === undefined
        ? ctx.db.query("referralConversions")
        : ctx.db
            .query("referralConversions")
            .withIndex("by_status_createdAt", (q) => q.eq("status", status))
    )
      .order("desc")
      .paginate(args.paginationOpts);

    const ledgerFor = ledgerCache(ctx);
    const page = await Promise.all(
      result.page.map(async (conversion) => {
        const affiliate = await ctx.db.get(conversion.affiliateId);
        const referrer = affiliate ? await ctx.db.get(affiliate.userId) : null;
        const { bookingNumber, bookingTotal } = await conversionBookingSummary(
          ctx,
          conversion,
        );
        const creditAmount = conversion.creditAmount ?? 0;
        const projected = affiliate
          ? resolveConversionCredit({
              tiers: settings.tiers,
              approvedConversionsBefore: approvedCount(affiliate),
              rewardPercentOverride: affiliate.rewardPercentOverride,
              bookingTotal: bookingTotal ?? 0,
              approvedAt: conversion.createdAt,
              creditValidityMonths: settings.creditValidityMonths,
            })
          : null;
        const creditConsumed =
          creditAmount > 0 && referrer
            ? conversionCreditState({
                transactions: await ledgerFor(referrer._id),
                conversionId: conversion._id,
              }) === "consumed"
            : false;

        return {
          _id: conversion._id,
          createdAt: conversion.createdAt,
          status: conversion.status,
          creditConsumed,
          creditAmount,
          referrerName: referrer?.name ?? "(deleted user)",
          referrerSlug: affiliate?.slug ?? "",
          referredEmail: conversion.referredEmail,
          bookingType: conversion.bookingType,
          bookingNumber,
          bookingTotal: conversion.bookingTotalAtApproval ?? bookingTotal,
          reservationId: conversion.reservationId,
          transferId: conversion.transferId,
          projectedCredit: projected?.amount ?? 0,
          projectedRewardPercent: projected?.rewardPercent ?? 0,
          rejectionReason: conversion.rejectionReason,
        };
      }),
    );
    return { ...result, page };
  },
});

/**
 * Keep the conversion (its status, the referrer's counter and any minted
 * credit) in sync with its booking's status. Call from EVERY path that changes
 * a booking's status or deletes it. Idempotent via conversionTransition, so
 * repeated cancels never double-decrement. Same-transaction as the status
 * change, so the counter and the booking can never disagree (OCC retries a
 * racing admin void).
 *
 * A completed booking parks the conversion at `awaitingApproval` for an admin,
 * unless `autoApproveOnCompletion` is on. That setting can only ever mint from
 * an admin-driven completion: marking a booking `completed` is admin-only on
 * both booking tables, so a customer cannot complete their own rental into a
 * credit.
 */
export async function syncConversionForBooking(
  ctx: MutationCtx,
  args: {
    bookingType: "reservation" | "transfer";
    bookingId: Id<"reservations"> | Id<"transfers">;
    bookingStatus: ConversionBookingStatus;
  },
): Promise<void> {
  const conversion =
    args.bookingType === "reservation"
      ? await ctx.db
          .query("referralConversions")
          .withIndex("by_reservation", (q) =>
            q.eq("reservationId", args.bookingId as Id<"reservations">),
          )
          .first()
      : await ctx.db
          .query("referralConversions")
          .withIndex("by_transfer", (q) =>
            q.eq("transferId", args.bookingId as Id<"transfers">),
          )
          .first();
  if (!conversion) return;

  // Voiding and reversing stay unconditional — a disabled program must still
  // claw back the credit of a cancelled booking — but it must never mint.
  const settings = await loadSettings(ctx);
  const transition = conversionTransition({
    current: conversion.status,
    bookingStatus: args.bookingStatus,
    autoApproveOnCompletion:
      settings.enabled && settings.autoApproveOnCompletion,
  });
  if (!transition) return;

  await applyConversionTransition(ctx, conversion, transition);
}

// --- Self-service enrolment + affiliate-facing dashboard (owner-scoped) ---

/** Collision retries; generateAffiliateSlug widens the suffix as it climbs. */
const SLUG_GENERATION_ATTEMPTS = 8;

/**
 * What the profile card needs before the visitor is an affiliate: whether the
 * program is open at all, and whether they already have a code. Deliberately
 * free of any other affiliate's data.
 */
export const getMyEnrolment = query({
  args: {},
  returns: v.object({
    programEnabled: v.boolean(),
    isAffiliate: v.boolean(),
  }),
  handler: async (ctx) => {
    const settings = await loadSettings(ctx);
    const user = await getCurrentUser(ctx);
    const affiliate = user
      ? await ctx.db
          .query("affiliates")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first()
      : null;
    return {
      programEnabled: settings.enabled,
      isAffiliate: affiliate !== null,
    };
  },
});

/**
 * Self-service enrolment: a signed-in customer mints their own referral code
 * while the program is open. Gated on `settings.enabled` like every other
 * part of the program, and one code per user. Admins keep `createAffiliate`
 * for provisioning and `updateAffiliate` for renaming.
 */
export const createMyAffiliate = mutation({
  args: {},
  returns: v.object({ slug: v.string() }),
  handler: async (ctx) => {
    const user = await getOrCreateCurrentUser(ctx);
    if (!user || user.deletedAt !== undefined) {
      throw new Error("Sign in to generate your referral code.");
    }

    const settings = await loadSettings(ctx);
    if (!settings.enabled) {
      throw new Error("The referral program is not open yet.");
    }

    // Race-safe: a losing OCC transaction re-runs this read after the
    // winner's insert and then fails here instead of minting a second code.
    const existing = await ctx.db
      .query("affiliates")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    if (existing) {
      throw new Error("You already have a referral code.");
    }

    // generateAffiliateSlug always yields a valid, non-reserved "<base>-<suffix>"
    // (see the slug generation tests), so a collision is the only retry reason.
    for (let attempt = 0; attempt < SLUG_GENERATION_ATTEMPTS; attempt++) {
      const slug = generateAffiliateSlug(user.firstName || user.name, attempt);
      if (await findBySlug(ctx, slug)) continue;

      await ctx.db.insert("affiliates", {
        userId: user._id,
        slug,
        isActive: true,
        ...counterPatch(0),
        createdAt: Date.now(),
      });
      return { slug };
    }
    throw new Error("Could not generate a referral code. Please try again.");
  },
});

export const getMyAffiliate = query({
  args: {},
  returns: v.union(
    v.object({
      slug: v.string(),
      isActive: v.boolean(),
      programEnabled: v.boolean(),
      confirmedConversions: v.number(),
      currentRewardPercent: v.number(),
      nextTier: v.union(tierValidator, v.null()),
      tiers: v.array(tierValidator),
      referredDiscount: referredDiscountValidator,
      conversions: v.array(
        v.object({
          bookingType: v.union(v.literal("reservation"), v.literal("transfer")),
          status: conversionStatusValidator,
          createdAt: v.number(),
        }),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const affiliate = await ctx.db
      .query("affiliates")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    if (!affiliate) return null;

    const settings = await loadSettings(ctx);
    const conversions = await ctx.db
      .query("referralConversions")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", affiliate._id))
      .order("desc")
      .take(50);

    return {
      slug: affiliate.slug,
      isActive: affiliate.isActive,
      programEnabled: settings.enabled,
      confirmedConversions: approvedCount(affiliate),
      currentRewardPercent: resolveTierRewardPercent(
        settings.tiers,
        approvedCount(affiliate),
        affiliate.rewardPercentOverride,
      ),
      nextTier:
        affiliate.rewardPercentOverride !== undefined
          ? null
          : nextTier(settings.tiers, approvedCount(affiliate)),
      tiers: settings.tiers,
      referredDiscount: referredDiscountConfig(settings, affiliate),
      // No referred emails here — the affiliate sees counts and dates only
      conversions: conversions.map((c) => ({
        bookingType: c.bookingType,
        status: c.status,
        createdAt: c.createdAt,
      })),
    };
  },
});
