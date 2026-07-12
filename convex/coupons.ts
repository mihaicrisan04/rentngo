import { v, ConvexError } from "convex/values";
import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { requireAdmin } from "./users";
import {
  evaluateCoupon,
  hasCouponIdentity,
  normalizeCouponCode,
  normalizeCustomerEmail,
  type CouponBookingType,
} from "../lib/pricing";

const discountTypeValidator = v.union(
  v.literal("percentage"),
  v.literal("fixed"),
);
const appliesToValidator = v.union(
  v.literal("rentals"),
  v.literal("transfers"),
  v.literal("both"),
);
const bookingTypeValidator = v.union(
  v.literal("rentals"),
  v.literal("transfers"),
);

const couponDocValidator = v.object({
  _id: v.id("coupons"),
  _creationTime: v.number(),
  code: v.string(),
  label: v.optional(v.string()),
  discountType: discountTypeValidator,
  discountValue: v.number(),
  expiresAt: v.optional(v.number()),
  maxRedemptions: v.optional(v.number()),
  redemptionCount: v.number(),
  minOrderValue: v.optional(v.number()),
  appliesTo: appliesToValidator,
  isActive: v.boolean(),
});

function assertValidCouponFields(fields: {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxRedemptions?: number;
  minOrderValue?: number;
}) {
  if (!/^[A-Z0-9_-]{3,32}$/.test(fields.code)) {
    throw new Error(
      "Coupon code must be 3-32 characters (letters, digits, - or _).",
    );
  }
  if (
    fields.discountType === "percentage" &&
    (fields.discountValue <= 0 || fields.discountValue > 100)
  ) {
    throw new Error("Percentage discount must be between 0 and 100.");
  }
  if (fields.discountType === "fixed" && fields.discountValue <= 0) {
    throw new Error("Fixed discount must be greater than 0.");
  }
  if (
    fields.maxRedemptions !== undefined &&
    (!Number.isInteger(fields.maxRedemptions) || fields.maxRedemptions < 1)
  ) {
    throw new Error("Max redemptions must be a positive integer.");
  }
  if (fields.minOrderValue !== undefined && fields.minOrderValue < 0) {
    throw new Error("Minimum order value cannot be negative.");
  }
}

async function findByCode(
  ctx: QueryCtx | MutationCtx,
  normalizedCode: string,
): Promise<Doc<"coupons"> | null> {
  return await ctx.db
    .query("coupons")
    .withIndex("by_code", (q) => q.eq("code", normalizedCode))
    .unique();
}

// --- Admin CRUD ---

export const create = mutation({
  args: {
    code: v.string(),
    label: v.optional(v.string()),
    discountType: discountTypeValidator,
    discountValue: v.number(),
    expiresAt: v.optional(v.number()),
    maxRedemptions: v.optional(v.number()),
    minOrderValue: v.optional(v.number()),
    appliesTo: appliesToValidator,
    isActive: v.boolean(),
  },
  returns: v.id("coupons"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const code = normalizeCouponCode(args.code);
    assertValidCouponFields({ ...args, code });

    if (await findByCode(ctx, code)) {
      throw new Error(`A coupon with code "${code}" already exists.`);
    }

    return await ctx.db.insert("coupons", {
      code,
      label: args.label,
      discountType: args.discountType,
      discountValue: args.discountValue,
      expiresAt: args.expiresAt,
      maxRedemptions: args.maxRedemptions,
      redemptionCount: 0,
      minOrderValue: args.minOrderValue,
      appliesTo: args.appliesTo,
      isActive: args.isActive,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("coupons"),
    code: v.optional(v.string()),
    label: v.optional(v.string()),
    discountType: v.optional(discountTypeValidator),
    discountValue: v.optional(v.number()),
    // null clears the optional constraint; undefined leaves it unchanged
    expiresAt: v.optional(v.union(v.number(), v.null())),
    maxRedemptions: v.optional(v.union(v.number(), v.null())),
    minOrderValue: v.optional(v.union(v.number(), v.null())),
    appliesTo: v.optional(appliesToValidator),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const coupon = await ctx.db.get(args.id);
    if (!coupon) {
      throw new Error("Coupon not found.");
    }

    const code =
      args.code !== undefined ? normalizeCouponCode(args.code) : coupon.code;
    assertValidCouponFields({
      code,
      discountType: args.discountType ?? coupon.discountType,
      discountValue: args.discountValue ?? coupon.discountValue,
      maxRedemptions:
        args.maxRedemptions === null
          ? undefined
          : (args.maxRedemptions ?? coupon.maxRedemptions),
      minOrderValue:
        args.minOrderValue === null
          ? undefined
          : (args.minOrderValue ?? coupon.minOrderValue),
    });

    if (code !== coupon.code && (await findByCode(ctx, code))) {
      throw new Error(`A coupon with code "${code}" already exists.`);
    }

    const patch: Partial<Doc<"coupons">> = { code };
    if (args.label !== undefined) patch.label = args.label;
    if (args.discountType !== undefined) patch.discountType = args.discountType;
    if (args.discountValue !== undefined)
      patch.discountValue = args.discountValue;
    if (args.expiresAt !== undefined)
      patch.expiresAt = args.expiresAt ?? undefined;
    if (args.maxRedemptions !== undefined)
      patch.maxRedemptions = args.maxRedemptions ?? undefined;
    if (args.minOrderValue !== undefined)
      patch.minOrderValue = args.minOrderValue ?? undefined;
    if (args.appliesTo !== undefined) patch.appliesTo = args.appliesTo;
    if (args.isActive !== undefined) patch.isActive = args.isActive;

    await ctx.db.patch(args.id, patch);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("coupons") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // Redemption rows are kept: they carry the denormalized code and the
    // granted amounts, so the audit trail survives deleting the coupon.
    await ctx.db.delete(args.id);
    return null;
  },
});

export const list = query({
  args: {},
  returns: v.array(couponDocValidator),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("coupons").order("desc").collect();
  },
});

// --- Customer-facing validation (advisory preview) ---

const invalidReasonValidator = v.union(
  v.literal("notFound"),
  v.literal("inactive"),
  v.literal("expired"),
  v.literal("exhausted"),
  v.literal("wrongBookingType"),
  v.literal("belowMinimum"),
  v.literal("alreadyUsed"),
  v.literal("emailRequired"),
);

/**
 * Live checkout feedback. Advisory only — the client-sent subtotal is used
 * purely for preview; the redemption path recomputes everything from server
 * data inside the booking mutation.
 */
export const validateCoupon = query({
  args: {
    code: v.string(),
    bookingType: bookingTypeValidator,
    subtotal: v.number(),
    // Guest checkouts pass the entered email so the once-per-user check can
    // run in the preview too; it is re-enforced at redemption regardless.
    email: v.optional(v.string()),
  },
  returns: v.union(
    v.object({
      valid: v.literal(true),
      code: v.string(),
      discountType: discountTypeValidator,
      discountValue: v.number(),
      discountAmount: v.number(),
    }),
    v.object({
      valid: v.literal(false),
      reason: invalidReasonValidator,
    }),
  ),
  handler: async (ctx, args) => {
    const code = normalizeCouponCode(args.code);
    if (!code) {
      return { valid: false as const, reason: "notFound" as const };
    }

    const coupon = await findByCode(ctx, code);
    if (!coupon) {
      return { valid: false as const, reason: "notFound" as const };
    }

    const evaluation = evaluateCoupon(coupon, {
      bookingType: args.bookingType,
      subtotal: args.subtotal,
      now: Date.now(),
    });
    if (!evaluation.valid) {
      return { valid: false as const, reason: evaluation.reason };
    }

    const userId = (await currentUserId(ctx)) ?? undefined;

    // The once-per-user check needs a real identity (account or non-empty
    // email); without one the preview mirrors the redemption path's refusal.
    if (!hasCouponIdentity({ userId, email: args.email })) {
      return { valid: false as const, reason: "emailRequired" as const };
    }

    if (
      await hasPriorRedemption(ctx, coupon._id, {
        userId,
        email: args.email,
      })
    ) {
      return { valid: false as const, reason: "alreadyUsed" as const };
    }

    return {
      valid: true as const,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: evaluation.discountAmount,
    };
  },
});

async function currentUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
  return user?._id ?? null;
}

/** Once per user: match by account when known, and always by booking email. */
async function hasPriorRedemption(
  ctx: QueryCtx | MutationCtx,
  couponId: Id<"coupons">,
  identity: { userId?: Id<"users">; email?: string },
): Promise<boolean> {
  if (identity.userId) {
    const byUser = await ctx.db
      .query("couponRedemptions")
      .withIndex("by_coupon_user", (q) =>
        q.eq("couponId", couponId).eq("userId", identity.userId),
      )
      .first();
    if (byUser) return true;
  }
  if (identity.email?.trim()) {
    const byEmail = await ctx.db
      .query("couponRedemptions")
      .withIndex("by_coupon_email", (q) =>
        q
          .eq("couponId", couponId)
          .eq("customerEmail", normalizeCustomerEmail(identity.email!)),
      )
      .first();
    if (byEmail) return true;
  }
  return false;
}

// --- Atomic redemption (called inside createReservation / createTransfer) ---

export interface RedeemedCoupon {
  couponId: Id<"coupons">;
  code: string;
  discountAmount: number;
  /** Patch this row with the booking id once the booking is inserted. */
  redemptionId: Id<"couponRedemptions">;
}

/**
 * Re-validate and redeem a coupon INSIDE the booking mutation's transaction.
 *
 * Concurrency safety: the exhausted check reads `redemptionCount` and the
 * redemption patches the same coupon document, all in one Convex mutation.
 * Two bookings racing for the last redemption of a capped code therefore
 * write-conflict on the coupon doc; OCC commits one and retries the other,
 * which re-reads the incremented count, fails the exhausted check, and rolls
 * back the whole booking. The once-per-user check is race-safe the same way —
 * the losing transaction re-runs its index read after the winner's insert.
 *
 * Throws ConvexError({ code: "COUPON_INVALID", reason }) so the client can
 * show a translated message even in production (plain Errors are redacted).
 */
export async function applyAndRedeemCoupon(
  ctx: MutationCtx,
  args: {
    code: string;
    bookingType: CouponBookingType;
    /** Server-recomputed pre-discount total — never a client-sent amount. */
    subtotal: number;
    userId?: Id<"users">;
    customerEmail: string;
  },
): Promise<RedeemedCoupon> {
  const invalid = (reason: string) =>
    new ConvexError({ code: "COUPON_INVALID", reason });

  const code = normalizeCouponCode(args.code);
  const coupon = code ? await findByCode(ctx, code) : null;
  if (!coupon) {
    throw invalid("notFound");
  }

  const evaluation = evaluateCoupon(coupon, {
    bookingType: args.bookingType,
    subtotal: args.subtotal,
    now: Date.now(),
  });
  if (!evaluation.valid) {
    throw invalid(evaluation.reason);
  }

  // Refuse redemption without a usable identity: the booking mutations accept
  // any string for customerEmail, so an empty/whitespace email would let a
  // guest bypass the once-per-user rule (hasPriorRedemption skips the email
  // lookup when the email is blank) and redeem the same code repeatedly.
  if (!hasCouponIdentity({ userId: args.userId, email: args.customerEmail })) {
    throw invalid("emailRequired");
  }

  if (
    await hasPriorRedemption(ctx, coupon._id, {
      userId: args.userId,
      email: args.customerEmail,
    })
  ) {
    throw invalid("alreadyUsed");
  }

  await ctx.db.patch(coupon._id, {
    redemptionCount: coupon.redemptionCount + 1,
  });
  const redemptionId = await ctx.db.insert("couponRedemptions", {
    couponId: coupon._id,
    code: coupon.code,
    bookingType: args.bookingType === "rentals" ? "reservation" : "transfer",
    userId: args.userId,
    customerEmail: normalizeCustomerEmail(args.customerEmail),
    amountDiscounted: evaluation.discountAmount,
    redeemedAt: Date.now(),
  });

  return {
    couponId: coupon._id,
    code: coupon.code,
    discountAmount: evaluation.discountAmount,
    redemptionId,
  };
}
