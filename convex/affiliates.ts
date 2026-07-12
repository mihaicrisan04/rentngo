import { v } from "convex/values";
import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { getCurrentUser, requireAdmin } from "./users";
import {
  computeReferredDiscount,
  computeReferrerReward,
  conversionTransition,
  isValidAffiliateSlug,
  nextTier,
  normalizeAffiliateSlug,
  normalizeCustomerEmail,
  resolveTierRewardPercent,
  validateAffiliateSettings,
  DEFAULT_AFFILIATE_SETTINGS,
  type AffiliateSettingsData,
} from "../lib/pricing";

const DAY_MS = 24 * 60 * 60 * 1000;

const tierValidator = v.object({
  minConversions: v.number(),
  rewardPercent: v.number(),
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
});

const conversionStatusValidator = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("voided"),
);

/** Settings doc or the seeded defaults when no admin has saved one yet. */
async function loadSettings(
  ctx: QueryCtx | MutationCtx,
): Promise<AffiliateSettingsData> {
  const doc = await ctx.db.query("affiliateSettings").first();
  return doc ?? DEFAULT_AFFILIATE_SETTINGS;
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
    const settings = await loadSettings(ctx);
    return {
      enabled: settings.enabled,
      attributionWindowDays: settings.attributionWindowDays,
      referredDiscountType: settings.referredDiscountType,
      referredDiscountValue: settings.referredDiscountValue,
      tiers: settings.tiers,
    };
  },
});

export const updateSettings = mutation({
  args: {
    enabled: v.boolean(),
    attributionWindowDays: v.number(),
    referredDiscountType: v.union(v.literal("percentage"), v.literal("fixed")),
    referredDiscountValue: v.number(),
    tiers: v.array(tierValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const error = validateAffiliateSettings(args);
    if (error) {
      throw new Error(error);
    }

    const tiers = [...args.tiers].sort(
      (a, b) => a.minConversions - b.minConversions,
    );
    const existing = await ctx.db.query("affiliateSettings").first();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, tiers, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("affiliateSettings", {
        ...args,
        tiers,
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
          confirmedConversions: affiliate.confirmedConversions,
          rewardPercentOverride: affiliate.rewardPercentOverride,
          referredDiscountOverride: affiliate.referredDiscountOverride,
          createdAt: affiliate.createdAt,
          currentRewardPercent: resolveTierRewardPercent(
            settings.tiers,
            affiliate.confirmedConversions,
            affiliate.rewardPercentOverride,
          ),
          userName: user?.name ?? "(deleted user)",
          userEmail: user?.email ?? "",
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
      .withIndex("by_email", (q) =>
        q.eq("email", args.userEmail.trim()),
      )
      .first();
    if (!user) {
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
      confirmedConversions: 0,
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
    if (conversion.status === "voided") {
      throw new Error("Conversion is already voided.");
    }

    await ctx.db.patch(conversion._id, {
      status: "voided",
      voidedAt: Date.now(),
    });
    const affiliate = await ctx.db.get(conversion.affiliateId);
    if (affiliate && conversion.status === "confirmed") {
      await ctx.db.patch(affiliate._id, {
        confirmedConversions: Math.max(0, affiliate.confirmedConversions - 1),
      });
    }
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
    // booking time covers the rest.
    const currentUser = await getCurrentUser(ctx);
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

export interface OwnRewardCandidate {
  affiliateId: Id<"affiliates">;
  slug: string;
  discountAmount: number;
  rewardPercent: number;
}

/**
 * Resolve both automatic (affiliate-source) discount candidates from server
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
): Promise<{
  referred: ReferredDiscountCandidate | null;
  ownReward: OwnRewardCandidate | null;
}> {
  const settings = await loadSettings(ctx);
  if (!settings.enabled) {
    return { referred: null, ownReward: null };
  }

  const email = normalizeCustomerEmail(args.customerEmail);
  let referred: ReferredDiscountCandidate | null = null;

  if (args.referral) {
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
      const affiliateUser = await ctx.db.get(affiliate.userId);
      const isSelfReferral =
        (args.currentUser && args.currentUser._id === affiliate.userId) ||
        (affiliateUser && normalizeCustomerEmail(affiliateUser.email) === email);

      // One referred discount/conversion per customer per affiliate: a live
      // (non-voided) prior conversion blocks a repeat; a voided one (the
      // earlier booking was cancelled) allows another try.
      const prior = await ctx.db
        .query("referralConversions")
        .withIndex("by_affiliate_email", (q) =>
          q.eq("affiliateId", affiliate._id).eq("referredEmail", email),
        )
        .take(100);
      const hasLivePrior = prior.some((c) => c.status !== "voided");

      if (!isSelfReferral && !hasLivePrior) {
        referred = {
          affiliateId: affiliate._id,
          slug: affiliate.slug,
          discountAmount: computeReferredDiscount(
            args.subtotal,
            referredDiscountConfig(settings, affiliate),
          ),
          rewardPercentSnapshot: resolveTierRewardPercent(
            settings.tiers,
            affiliate.confirmedConversions,
            affiliate.rewardPercentOverride,
          ),
        };
      }
    }
  }

  let ownReward: OwnRewardCandidate | null = null;
  if (args.currentUser) {
    const ownAffiliate = await ctx.db
      .query("affiliates")
      .withIndex("by_user", (q) => q.eq("userId", args.currentUser!._id))
      .first();
    if (ownAffiliate && ownAffiliate.isActive) {
      const rewardPercent = resolveTierRewardPercent(
        settings.tiers,
        ownAffiliate.confirmedConversions,
        ownAffiliate.rewardPercentOverride,
      );
      const discountAmount = computeReferrerReward(
        args.subtotal,
        rewardPercent,
      );
      if (discountAmount > 0) {
        ownReward = {
          affiliateId: ownAffiliate._id,
          slug: ownAffiliate.slug,
          discountAmount,
          rewardPercent,
        };
      }
    }
  }

  return { referred, ownReward };
}

/**
 * Advisory checkout preview of the automatic (affiliate) discount — the
 * booking mutation recomputes everything from server data. Mirrors the
 * booking-time precedence: referred discount before own tier reward; the
 * client-side pickDiscount still lets an explicit coupon win over either.
 */
export const previewAffiliateDiscount = query({
  args: {
    referral: v.optional(referralArgValidator),
    subtotal: v.number(),
    email: v.optional(v.string()),
  },
  returns: v.union(
    v.object({
      kind: v.union(v.literal("referred"), v.literal("reward")),
      slug: v.string(),
      discountAmount: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    if (args.subtotal <= 0) return null;
    const currentUser = await getCurrentUser(ctx);
    const { referred, ownReward } = await resolveAffiliateCandidates(ctx, {
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
    if (ownReward) {
      return {
        kind: "reward" as const,
        slug: ownReward.slug,
        discountAmount: ownReward.discountAmount,
      };
    }
    return null;
  },
});

// --- Conversion lifecycle (called inside booking mutations) ---

/**
 * Record a conversion for a referred booking and credit the referrer.
 * Owner decision: a conversion is confirmed the moment the booking is
 * created, and voided if the booking is later cancelled (see
 * syncConversionForBooking).
 *
 * Concurrency: the counter increment and the conversion insert happen in the
 * booking mutation's transaction. Two bookings racing on the same affiliate
 * both patch the affiliate doc, so Convex OCC commits one and retries the
 * other against the incremented count — the counter can neither skip nor
 * double-count. The per-customer dedupe (resolveAffiliateCandidates) is
 * race-safe the same way: the losing transaction re-runs its index read after
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
  const conversionId = await ctx.db.insert("referralConversions", {
    affiliateId: args.affiliateId,
    bookingType: args.bookingType,
    referredUserId: args.referredUserId,
    referredEmail: normalizeCustomerEmail(args.referredEmail),
    status: "confirmed",
    referredDiscountAmount: args.referredDiscountAmount,
    referrerRewardPercentAtConversion: args.rewardPercentSnapshot,
    createdAt: Date.now(),
    confirmedAt: Date.now(),
  });
  const affiliate = await ctx.db.get(args.affiliateId);
  if (affiliate) {
    await ctx.db.patch(affiliate._id, {
      confirmedConversions: affiliate.confirmedConversions + 1,
    });
  }
  return conversionId;
}

/**
 * Keep the conversion (and the referrer's counter) in sync with its booking's
 * status. Call from EVERY path that changes a booking's status or deletes it:
 * cancelled/deleted -> void + decrement; back to any live status -> re-confirm
 * + increment. Idempotent via conversionTransition, so repeated cancels never
 * double-decrement. Same-transaction as the status change, so the counter and
 * the booking can never disagree (OCC retries a racing admin void).
 */
export async function syncConversionForBooking(
  ctx: MutationCtx,
  args: {
    bookingType: "reservation" | "transfer";
    bookingId: Id<"reservations"> | Id<"transfers">;
    bookingIsLive: boolean;
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

  const transition = conversionTransition(
    conversion.status,
    args.bookingIsLive,
  );
  if (!transition) return;

  await ctx.db.patch(conversion._id, {
    status: transition.nextStatus,
    ...(transition.nextStatus === "voided"
      ? { voidedAt: Date.now() }
      : { confirmedAt: Date.now(), voidedAt: undefined }),
  });
  const affiliate = await ctx.db.get(conversion.affiliateId);
  if (affiliate) {
    await ctx.db.patch(affiliate._id, {
      confirmedConversions: Math.max(
        0,
        affiliate.confirmedConversions + transition.counterDelta,
      ),
    });
  }
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
          bookingType: v.union(
            v.literal("reservation"),
            v.literal("transfer"),
          ),
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
      confirmedConversions: affiliate.confirmedConversions,
      currentRewardPercent: resolveTierRewardPercent(
        settings.tiers,
        affiliate.confirmedConversions,
        affiliate.rewardPercentOverride,
      ),
      nextTier:
        affiliate.rewardPercentOverride !== undefined
          ? null
          : nextTier(settings.tiers, affiliate.confirmedConversions),
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
