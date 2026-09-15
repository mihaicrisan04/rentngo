import { v } from "convex/values";
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
  conversionTransition,
  hasCouponIdentity,
  hasMintedReferralCredit,
  isValidAffiliateSlug,
  referredEligibility,
  nextTier,
  normalizeAffiliateSlug,
  normalizeCustomerEmail,
  resolveConversionCredit,
  resolveTierRewardPercent,
  validateAffiliateSettings,
  withSettingsDefaults,
  BLOCKING_CONVERSION_STATUSES,
  type AffiliateSettingsData,
  type ConversionBookingStatus,
  type ConversionTransition,
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
    if (!isValidAffiliateSlug(slug)) {
      throw new Error(
        "Slug must be 3-32 characters: lowercase letters, digits and hyphens.",
      );
    }
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
      if (!isValidAffiliateSlug(slug)) {
        throw new Error(
          "Slug must be 3-32 characters: lowercase letters, digits and hyphens.",
        );
      }
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
  args: { affiliateId: v.id("affiliates") },
  returns: v.array(conversionListItemValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const conversions = await ctx.db
      .query("referralConversions")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", args.affiliateId))
      .order("desc")
      .take(200);
    return conversions.map((c) => ({
      _id: c._id,
      bookingType: c.bookingType,
      reservationId: c.reservationId,
      transferId: c.transferId,
      referredEmail: c.referredEmail,
      status: c.status,
      referredDiscountAmount: c.referredDiscountAmount,
      createdAt: c.createdAt,
      voidedAt: c.voidedAt,
    }));
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
    currentUser: Doc<"users"> | null;
    customerEmail: string;
    subtotal: number;
  },
): Promise<{ referred: ReferredDiscountCandidate | null }> {
  const settings = await loadSettings(ctx);
  if (!settings.enabled) {
    return { referred: null };
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

  if (args.referral && hasIdentity) {
    const attribution = await ctx.db
      .query("referralAttributions")
      .withIndex("by_visitor_key", (q) =>
        q.eq("visitorKey", args.referral!.visitorKey),
      )
      .first();
    const affiliate =
      attribution &&
      attribution.expiresAt > Date.now() &&
      attribution.slug === normalizeAffiliateSlug(args.referral.slug)
        ? await ctx.db.get(attribution.affiliateId)
        : null;

    if (affiliate && affiliate.isActive) {
      // A soft-deleted owner is treated as missing — eligibility fails closed
      const ownerUserDoc = await ctx.db.get(affiliate.userId);
      const ownerUser =
        ownerUserDoc && ownerUserDoc.deletedAt === undefined
          ? ownerUserDoc
          : null;

      // One referred discount/conversion per customer per affiliate: any
      // live (non-voided) prior conversion blocks a repeat; voided ones (the
      // earlier booking was cancelled) free the slot. Status is in the index,
      // so each blocking status is a targeted .first() — no amount of voided
      // history can hide an existing live conversion. Race-safe like the
      // coupon checks: a losing OCC transaction re-runs this read after the
      // winner's insert.
      const livePrior = (
        await Promise.all(
          BLOCKING_CONVERSION_STATUSES.map((status) =>
            ctx.db
              .query("referralConversions")
              .withIndex("by_affiliate_email_status", (q) =>
                q
                  .eq("affiliateId", affiliate._id)
                  .eq("referredEmail", email)
                  .eq("status", status),
              )
              .first(),
          ),
        )
      ).some((row) => row !== null);

      // Fails closed when the owner user row is missing (orphaned affiliate)
      const eligibility = referredEligibility({
        ownerUser: ownerUser
          ? { id: ownerUser._id, email: ownerUser.email }
          : null,
        bookerUserId: args.currentUser?._id,
        customerEmail: email,
        hasLiveConversion: livePrior,
      });

      if (eligibility.eligible) {
        referred = {
          affiliateId: affiliate._id,
          slug: affiliate.slug,
          discountAmount: computeReferredDiscount(
            args.subtotal,
            referredDiscountConfig(settings, affiliate),
          ),
          rewardPercentSnapshot: resolveTierRewardPercent(
            settings.tiers,
            approvedCount(affiliate),
            affiliate.rewardPercentOverride,
          ),
        };
      }
    }
  }

  return { referred };
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
export async function recordReferralConversion(
  ctx: MutationCtx,
  args: {
    affiliateId: Id<"affiliates">;
    bookingType: "reservation" | "transfer";
    referredUserId?: Id<"users">;
    referredEmail: string;
    referredDiscountAmount: number;
    rewardPercentSnapshot: number;
  },
): Promise<Id<"referralConversions">> {
  return await ctx.db.insert("referralConversions", {
    affiliateId: args.affiliateId,
    bookingType: args.bookingType,
    referredUserId: args.referredUserId,
    referredEmail: normalizeCustomerEmail(args.referredEmail),
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
 * the conversion already carries a credit — the ledger-side guard behind
 * conversionTransition's own idempotency, so a double approval can never
 * produce two credits or two counter increments.
 */
async function mintConversionCredit(
  ctx: MutationCtx,
  conversion: Doc<"referralConversions">,
  approvedAt: number,
): Promise<{ creditAmount: number; bookingTotal: number } | null> {
  const existing = await ctx.db
    .query("walletTransactions")
    .withIndex("by_conversion", (q) => q.eq("conversionId", conversion._id))
    .collect();
  if (hasMintedReferralCredit(existing)) return null;

  const affiliate = await ctx.db.get(conversion.affiliateId);
  if (!affiliate) return null;

  const settings = await loadSettings(ctx);
  // The persisted total, i.e. what the referred customer was actually charged
  const bookingTotal =
    (await conversionBooking(ctx, conversion))?.totalPrice ?? 0;
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
): Promise<void> {
  const now = Date.now();
  const patch: Partial<Doc<"referralConversions">> = {
    status: transition.nextStatus,
    voidedAt: transition.nextStatus === "voided" ? now : undefined,
  };
  let counterDelta = transition.counterDelta;

  if (transition.mintCredit) {
    const minted = await mintConversionCredit(ctx, conversion, now);
    if (minted === null) {
      counterDelta = 0;
    } else {
      patch.creditAmount = minted.creditAmount;
      patch.bookingTotalAtApproval = minted.bookingTotal;
      patch.approvedAt = now;
      patch.approvedByUserId = actor?.adminUserId;
    }
  }
  if (transition.nextStatus === "rejected") {
    patch.rejectedAt = now;
    patch.rejectionReason = actor?.rejectionReason;
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
): Promise<void> {
  const conversion = await ctx.db.get(args.conversionId);
  if (!conversion) {
    throw new Error("Conversion not found.");
  }
  const transition = conversionTransition({
    current: conversion.status,
    bookingStatus: await conversionBookingStatus(ctx, conversion),
    adminAction: args.adminAction,
  });
  if (!transition) return;
  await applyConversionTransition(ctx, conversion, transition, {
    adminUserId: args.adminUserId,
    rejectionReason: args.reason?.trim() || undefined,
  });
}

export const approveConversion = mutation({
  args: { conversionId: v.id("referralConversions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await decideConversion(ctx, {
      conversionId: args.conversionId,
      adminAction: "approve",
      adminUserId: admin._id,
    });
    return null;
  },
});

export const rejectConversion = mutation({
  args: {
    conversionId: v.id("referralConversions"),
    reason: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await decideConversion(ctx, {
      conversionId: args.conversionId,
      adminAction: "reject",
      adminUserId: admin._id,
      reason: args.reason,
    });
    return null;
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
  returns: v.null(),
  handler: async (ctx, args) => {
    await decideConversion(ctx, args);
    return null;
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

  const settings = await loadSettings(ctx);
  const transition = conversionTransition({
    current: conversion.status,
    bookingStatus: args.bookingStatus,
    autoApproveOnCompletion: settings.autoApproveOnCompletion,
  });
  if (!transition) return;

  await applyConversionTransition(ctx, conversion, transition);
}

// --- Affiliate-facing dashboard (owner-scoped) ---

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
