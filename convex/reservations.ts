import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
  getCurrentUser,
  getCurrentUserOrThrow,
  getOrCreateCurrentUser,
  requireAdmin,
} from "./users";
import { applyAndRedeemCoupon } from "./coupons";
import { nextBookingNumber, reservationNumberCounter } from "./counters";
import {
  getTableStats,
  recordStatsInsert,
  recordStatsRemove,
  recordStatsStatusChange,
} from "./tableStats";
import {
  bucketMonthlyStats,
  calculateGrowth,
  getMonthRange,
  getRecentMonthKeys,
  validateContiguousTimestampRanges,
} from "./lib/stats";
import {
  recordReferralConversion,
  referralArgValidator,
  resolveAffiliateCandidates,
  syncConversionForBooking,
} from "./affiliates";
import {
  applyDiscountToTotal,
  pickDiscount,
  type AppliedDiscount,
  assertValidReservationExtras,
  calculateIncludedKilometers,
  calculateMultiplierForDateRange,
  computeReservationPricing,
  extractLegacyExtras,
  isKnownLocation,
  msToDateString,
  DEFAULT_ADDITIONAL_50KM_PRICE,
} from "../lib/pricing";

// Validator for reservation status, strictly aligned with schema.ts
const reservationStatusValidator = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("cancelled"),
  v.literal("completed"),
);

// Explicit type for ReservationStatus based on the schema
type ReservationStatusType =
  "pending" | "confirmed" | "cancelled" | "completed";

// Validator for additional charges, aligned with schema.ts
const additionalChargeValidator = v.object({
  description: v.string(),
  amount: v.number(),
});

const reservationDocValidator = v.object({
  _id: v.id("reservations"),
  _creationTime: v.number(),
  reservationNumber: v.optional(v.number()),
  userId: v.optional(v.id("users")),
  vehicleId: v.id("vehicles"),
  startDate: v.number(),
  endDate: v.number(),
  pickupTime: v.string(),
  restitutionTime: v.string(),
  pickupLocation: v.string(),
  restitutionLocation: v.string(),
  paymentMethod: v.union(
    v.literal("cash_on_delivery"),
    v.literal("card_on_delivery"),
    v.literal("card_online"),
  ),
  status: reservationStatusValidator,
  totalPrice: v.number(),
  customerInfo: v.object({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    message: v.optional(v.string()),
    flightNumber: v.optional(v.string()),
  }),
  promoCode: v.optional(v.string()),
  couponId: v.optional(v.id("coupons")),
  discountAmount: v.optional(v.number()),
  discountSource: v.optional(
    v.union(v.literal("coupon"), v.literal("affiliate")),
  ),
  affiliateId: v.optional(v.id("affiliates")),
  additionalCharges: v.optional(
    v.array(
      v.object({
        description: v.optional(v.string()),
        code: v.optional(
          v.union(
            v.literal("pickupLocationFee"),
            v.literal("returnLocationFee"),
            v.literal("snowChains"),
            v.literal("childSeat1to4"),
            v.literal("childSeat5to12"),
            v.literal("extraKm"),
          ),
        ),
        params: v.optional(
          v.record(v.string(), v.union(v.string(), v.number())),
        ),
        amount: v.number(),
      }),
    ),
  ),
  isSCDWSelected: v.boolean(),
  deductibleAmount: v.number(),
  protectionCost: v.optional(v.number()),
  seasonId: v.optional(v.id("seasons")),
  seasonalMultiplier: v.optional(v.number()),
  pricePerDay: v.optional(v.number()),
  rentalDays: v.optional(v.number()),
  basePrice: v.optional(v.number()),
});

const reservationListItemValidator = reservationDocValidator.extend({
  vehicle: v.union(
    v.object({
      make: v.string(),
      model: v.string(),
      year: v.optional(v.number()),
    }),
    v.null(),
  ),
});

const successValidator = v.object({ success: v.boolean() });
const successMessageValidator = v.object({
  success: v.boolean(),
  message: v.string(),
});

// --- CREATE ---
export const createReservation = mutation({
  args: {
    userId: v.optional(v.id("users")),
    vehicleId: v.id("vehicles"),
    startDate: v.number(), // Unix timestamp
    endDate: v.number(), // Unix timestamp
    pickupTime: v.string(), // Time in "HH:MM" format
    restitutionTime: v.string(), // Time in "HH:MM" format
    pickupLocation: v.string(), // Name of pickup location
    restitutionLocation: v.string(), // Name of return location
    paymentMethod: v.union(
      v.literal("cash_on_delivery"),
      v.literal("card_on_delivery"),
      v.literal("card_online"),
    ),
    totalPrice: v.number(),
    customerInfo: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      message: v.optional(v.string()),
      flightNumber: v.optional(v.string()),
    }),
    // Coupon code to redeem — validated server-side; an invalid code fails
    // the booking (no longer a free-text pass-through)
    promoCode: v.optional(v.string()),
    // Referral cookie payload — validated against the recorded attribution;
    // an invalid/expired/fabricated pair silently attributes nothing (the
    // referral is automatic, so it never fails the booking)
    referral: v.optional(referralArgValidator),
    additionalCharges: v.optional(v.array(additionalChargeValidator)),
    isSCDWSelected: v.boolean(),
    deductibleAmount: v.number(),
    protectionCost: v.optional(v.number()),
    seasonId: v.optional(v.id("seasons")),
    seasonalMultiplier: v.optional(v.number()),
    // Email data fields
    vehicleInfo: v.optional(
      v.object({
        make: v.string(),
        model: v.string(),
        year: v.optional(v.number()),
        type: v.optional(v.string()),
        seats: v.optional(v.number()),
        transmission: v.optional(v.string()),
        fuelType: v.optional(v.string()),
        features: v.optional(v.array(v.string())),
      }),
    ),
    pricePerDayUsed: v.optional(v.number()),
    locale: v.optional(v.string()),
    // Structured extras (new clients). When present, the server recomputes
    // ALL charges from these; the legacy prose `additionalCharges` are then
    // only used for the email rendering.
    extras: v.optional(
      v.object({
        snowChains: v.boolean(),
        childSeat1to4: v.number(),
        childSeat5to12: v.number(),
        extraKilometers: v.number(),
      }),
    ),
  },
  returns: v.object({
    reservationId: v.id("reservations"),
    reservationNumber: v.number(),
  }),
  handler: async (ctx, args) => {
    // Reject malformed extras (negative/fractional counts) before any money
    // math — v.number() alone puts no lower bound on them
    assertValidReservationExtras(args.extras);

    // Get the current authenticated user (if any) — never trust a
    // client-supplied userId. Creates the row from the JWT when the Clerk
    // webhook sync hasn't landed yet, so a missed webhook can't block or
    // orphan a booking.
    const currentUser = await getOrCreateCurrentUser(ctx);

    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) {
      throw new Error("Vehicle not found.");
    }

    // The picker offers a fixed location list, so an unknown name never
    // comes from an honest client. It prices as fee 0 rather than failing
    // the booking (the list may drift between deploys / stored searches);
    // log it so tampering or drift is visible
    for (const location of [args.pickupLocation, args.restitutionLocation]) {
      if (location && !isKnownLocation(location)) {
        console.warn("[pricing] createReservation unknown location (fee 0)", {
          location,
          vehicleId: args.vehicleId,
        });
      }
    }

    // Resolve the seasonal multiplier from server data (same algorithm the
    // client display uses, fed from the same tables)
    const activeSeasons = await ctx.db
      .query("seasons")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    const currentSeasonRow = await ctx.db.query("currentSeason").first();
    const currentSeasonDoc = currentSeasonRow
      ? await ctx.db.get(currentSeasonRow.seasonId)
      : null;
    const seasonResult = calculateMultiplierForDateRange(
      msToDateString(args.startDate),
      msToDateString(args.endDate),
      activeSeasons,
      currentSeasonDoc
        ? { seasonId: currentSeasonDoc._id, season: currentSeasonDoc }
        : null,
    );

    const vehicleClass = vehicle.classId
      ? await ctx.db.get(vehicle.classId)
      : null;

    // Authoritative recompute — client-submitted money fields are never
    // persisted (SCDW uses the base-tier seasonal rate per the owner
    // decision on RNGO-13, matching the on-screen total)
    const pricing = computeReservationPricing({
      vehicle,
      startDate: new Date(args.startDate),
      endDate: new Date(args.endDate),
      pickupTime: args.pickupTime,
      restitutionTime: args.restitutionTime,
      pickupLocation: args.pickupLocation,
      restitutionLocation: args.restitutionLocation,
      seasonalMultiplier: seasonResult.multiplier,
      isSCDWSelected: args.isSCDWSelected,
      extras: args.extras,
      additional50kmPrice:
        vehicleClass?.additional50kmPrice ?? DEFAULT_ADDITIONAL_50KM_PRICE,
    });

    let totalPrice: number;
    let persistedCharges;
    if (args.extras) {
      totalPrice = pricing.totalPrice;
      persistedCharges =
        pricing.additionalCharges.length > 0
          ? pricing.additionalCharges
          : undefined;
    } else {
      // TRANSITIONAL legacy path — goes away when RNGO-17 ships the
      // structured `extras` arg. Dates, locations and protection are fully
      // recomputed above, but pre-RNGO-17 clients send physical extras only
      // as localized prose line items mixed with the location-fee entries.
      // extractLegacyExtras strips the fee entries (head-first, matching the
      // known client's push order) and sums the rest as the extras total, so
      // the stored total still reconciles with its line items. The prose
      // array is persisted as-is so the confirmation page and email keep
      // rendering labels until RNGO-17/19 switch to coded charges.
      const legacy = extractLegacyExtras(
        args.additionalCharges ?? [],
        pricing.deliveryFee,
        pricing.returnFee,
      );
      if (legacy.ambiguousFeeMatch || legacy.droppedInvalidAmounts) {
        console.warn("[pricing] createReservation ambiguous legacy charges", {
          ambiguousFeeMatch: legacy.ambiguousFeeMatch,
          droppedInvalidAmounts: legacy.droppedInvalidAmounts,
          clientCharges: args.additionalCharges,
          deliveryFee: pricing.deliveryFee,
          returnFee: pricing.returnFee,
          vehicleId: args.vehicleId,
        });
      }
      totalPrice =
        pricing.basePrice +
        pricing.protectionCost +
        pricing.totalLocationFees +
        legacy.extrasTotal;
      persistedCharges = args.additionalCharges;
    }

    // Soft drift telemetry during rollout: the server value always wins, but
    // a mismatch signals a client bug (or tampering) worth investigating
    if (Math.abs(args.totalPrice - totalPrice) > 0.5) {
      console.warn("[pricing] createReservation client/server total mismatch", {
        clientTotal: args.totalPrice,
        serverTotal: totalPrice,
        clientProtectionCost: args.protectionCost,
        serverProtectionCost: pricing.protectionCost,
        vehicleId: args.vehicleId,
        startDate: args.startDate,
        endDate: args.endDate,
        seasonalMultiplier: seasonResult.multiplier,
      });
    }

    // Single-discount seam: gather every candidate against the
    // server-recomputed total, then pickDiscount applies exactly one
    // (explicit coupon > referred discount > own affiliate tier reward).
    //
    // Coupon: validation, the redemption-count increment and the audit row
    // all happen inside this mutation's transaction, so a capped code cannot
    // over-redeem under concurrency and an invalid code rolls the whole
    // booking back. A present coupon always wins the pick, so redeeming it
    // unconditionally is correct.
    const redeemedCoupon = args.promoCode?.trim()
      ? await applyAndRedeemCoupon(ctx, {
          code: args.promoCode,
          bookingType: "rentals",
          subtotal: totalPrice,
          userId: currentUser?._id,
          customerEmail: args.customerInfo.email,
        })
      : null;
    const affiliateCandidates = await resolveAffiliateCandidates(ctx, {
      referral: args.referral,
      currentUser,
      customerEmail: args.customerInfo.email,
      subtotal: totalPrice,
    });

    const couponDiscount: AppliedDiscount | null = redeemedCoupon
      ? {
          source: "coupon",
          code: redeemedCoupon.code,
          amount: redeemedCoupon.discountAmount,
        }
      : null;
    const referredDiscount: AppliedDiscount | null =
      affiliateCandidates.referred &&
      affiliateCandidates.referred.discountAmount > 0
        ? {
            source: "affiliate",
            code: affiliateCandidates.referred.slug,
            amount: affiliateCandidates.referred.discountAmount,
          }
        : null;
    const ownRewardDiscount: AppliedDiscount | null =
      affiliateCandidates.ownReward
        ? {
            source: "affiliate",
            code: affiliateCandidates.ownReward.slug,
            amount: affiliateCandidates.ownReward.discountAmount,
          }
        : null;
    const appliedDiscount = pickDiscount([
      couponDiscount,
      referredDiscount,
      ownRewardDiscount,
    ]);
    if (appliedDiscount) {
      totalPrice = applyDiscountToTotal(totalPrice, appliedDiscount.amount);
    }

    const nextReservationNumber = await nextBookingNumber(
      ctx,
      reservationNumberCounter,
    );

    const newReservationData = {
      reservationNumber: nextReservationNumber,
      userId: currentUser?._id || undefined, // Use the Convex user ID if authenticated
      vehicleId: args.vehicleId,
      startDate: args.startDate,
      endDate: args.endDate,
      pickupTime: args.pickupTime,
      restitutionTime: args.restitutionTime,
      pickupLocation: args.pickupLocation,
      restitutionLocation: args.restitutionLocation,
      paymentMethod: args.paymentMethod,
      status: "pending" as ReservationStatusType, // Initial status
      totalPrice,
      customerInfo: args.customerInfo,
      promoCode: redeemedCoupon?.code,
      couponId: redeemedCoupon?.couponId,
      discountAmount: appliedDiscount?.amount,
      discountSource: appliedDiscount?.source,
      // Referrer credited for this booking (attribution), or the booker's own
      // affiliate when their tier reward was the applied discount
      affiliateId:
        affiliateCandidates.referred?.affiliateId ??
        (appliedDiscount === ownRewardDiscount
          ? affiliateCandidates.ownReward?.affiliateId
          : undefined),
      additionalCharges: persistedCharges,
      isSCDWSelected: args.isSCDWSelected,
      deductibleAmount: pricing.deductibleAmount,
      protectionCost:
        pricing.protectionCost > 0 ? pricing.protectionCost : undefined,
      seasonId: seasonResult.seasonId as Id<"seasons"> | undefined,
      seasonalMultiplier: seasonResult.multiplier,
      pricePerDay: pricing.pricePerDay,
      rentalDays: pricing.rentalDays,
      basePrice: pricing.basePrice,
    };

    const reservationId = await ctx.db.insert(
      "reservations",
      newReservationData,
    );
    await recordStatsInsert(ctx, "reservations", newReservationData.status);

    // Link the redemption audit row to the booking it paid for
    if (redeemedCoupon) {
      await ctx.db.patch(redeemedCoupon.redemptionId, { reservationId });
    }

    // Conversion lifecycle (owner decision): a referred booking confirms a
    // conversion the moment it is created — even when a coupon won the
    // one-discount rule — and is voided if the booking is later cancelled.
    if (affiliateCandidates.referred) {
      const conversionId = await recordReferralConversion(ctx, {
        affiliateId: affiliateCandidates.referred.affiliateId,
        bookingType: "reservation",
        referredUserId: currentUser?._id,
        referredEmail: args.customerInfo.email,
        referredDiscountAmount:
          referredDiscount && appliedDiscount === referredDiscount
            ? referredDiscount.amount
            : 0,
        rewardPercentSnapshot:
          affiliateCandidates.referred.rewardPercentSnapshot,
      });
      await ctx.db.patch(conversionId, { reservationId });
    }

    // Schedule email sending if vehicle info is provided
    if (args.vehicleInfo) {
      // Format dates for email
      const timeZone = "Europe/Bucharest";
      const startDateString = new Date(args.startDate).toLocaleDateString(
        "en-GB",
        { year: "numeric", month: "long", day: "numeric", timeZone },
      );
      const endDateString = new Date(args.endDate).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone,
      });

      await ctx.scheduler.runAfter(
        0,
        internal.emails.sendReservationConfirmationEmail,
        {
          reservationNumber: nextReservationNumber,
          customerInfo: args.customerInfo,
          vehicleInfo: args.vehicleInfo,
          rentalDetails: {
            startDate: startDateString,
            endDate: endDateString,
            pickupTime: args.pickupTime,
            restitutionTime: args.restitutionTime,
            pickupLocation: args.pickupLocation,
            restitutionLocation: args.restitutionLocation,
            numberOfDays: pricing.rentalDays,
            includedKm: calculateIncludedKilometers(pricing.rentalDays),
            // Only structured clients declare extra km; legacy bookings carry
            // it solely as a prose additional-charge line, so the explicit row
            // is omitted for them rather than parsed out of localized text
            extraKilometers:
              args.extras && args.extras.extraKilometers > 0
                ? args.extras.extraKilometers
                : undefined,
          },
          pricingDetails: {
            // Server-computed values so the email matches what was stored.
            pricePerDay: pricing.pricePerDay,
            totalPrice,
            paymentMethod: args.paymentMethod,
            promoCode: appliedDiscount?.code,
            discountAmount: appliedDiscount?.amount,
            isReferralDiscount: appliedDiscount?.source === "affiliate",
            additionalCharges: persistedCharges,
            isSCDWSelected: args.isSCDWSelected,
            deductibleAmount: pricing.deductibleAmount,
            protectionCost:
              pricing.protectionCost > 0 ? pricing.protectionCost : undefined,
          },
          locale: args.locale,
        },
      );
    }

    return { reservationId, reservationNumber: nextReservationNumber };
  },
});

// --- READ ---
export const getReservationById = query({
  args: { reservationId: v.id("reservations") },
  returns: v.union(reservationDocValidator, v.null()),
  handler: async (ctx, args) => {
    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) return null;

    // Check if user is authenticated and authorized to view this reservation
    const currentUser = await getCurrentUser(ctx);

    // Allow access if:
    // 1. User is an admin
    // 2. User is the owner of the reservation
    // 3. Reservation has no userId (guest booking) - you might want to restrict this further
    if (currentUser) {
      if (
        currentUser.role === "admin" ||
        reservation.userId === currentUser._id
      ) {
        return reservation;
      } else {
        throw new Error("User not authorized to view this reservation.");
      }
    } else {
      // For guest bookings, you might want to add additional verification
      // For now, we'll allow access to reservations without userId
      if (!reservation.userId) {
        return reservation;
      } else {
        throw new Error("Authentication required to view this reservation.");
      }
    }
  },
});

export const getCurrentUserReservationsPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(reservationListItemValidator),
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const result = await ctx.db
      .query("reservations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: await Promise.all(
        result.page.map(async (reservation) => {
          const vehicle = await ctx.db.get(reservation.vehicleId);
          return {
            ...reservation,
            vehicle: vehicle
              ? { make: vehicle.make, model: vehicle.model, year: vehicle.year }
              : null,
          };
        }),
      ),
    };
  },
});

export const getReservationsByVehicle = query({
  args: { vehicleId: v.id("vehicles") },
  returns: v.array(reservationDocValidator),
  handler: async (ctx, args) => {
    // Admin-only: reservations include customer PII (name/email/phone)
    await requireAdmin(ctx);

    return await ctx.db
      .query("reservations")
      .withIndex("by_vehicle", (q) => q.eq("vehicleId", args.vehicleId)) // Correct index name
      .collect();
  },
});

export const getReservationsByPickupLocation = query({
  args: { pickupLocation: v.string() },
  returns: v.array(reservationDocValidator),
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    if (user.role !== "admin") {
      throw new Error("User not authorized (admin only).");
    }

    return await ctx.db
      .query("reservations")
      .withIndex("by_pickup_location", (q) =>
        q.eq("pickupLocation", args.pickupLocation),
      )
      .collect();
  },
});

export const getReservationsByPaymentMethod = query({
  args: {
    paymentMethod: v.union(
      v.literal("cash_on_delivery"),
      v.literal("card_on_delivery"),
      v.literal("card_online"),
    ),
  },
  returns: v.array(reservationDocValidator),
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    if (user.role !== "admin") {
      throw new Error("User not authorized (admin only).");
    }

    return await ctx.db
      .query("reservations")
      .withIndex("by_payment_method", (q) =>
        q.eq("paymentMethod", args.paymentMethod),
      )
      .collect();
  },
});

export const getAllReservationsPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(reservationListItemValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const result = await ctx.db
      .query("reservations")
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: await Promise.all(
        result.page.map(async (reservation) => {
          const vehicle = await ctx.db.get(reservation.vehicleId);
          return {
            ...reservation,
            vehicle: vehicle
              ? { make: vehicle.make, model: vehicle.model, year: vehicle.year }
              : null,
          };
        }),
      ),
    };
  },
});

// --- UPDATE ---
export const updateReservationStatus = mutation({
  args: {
    reservationId: v.id("reservations"),
    newStatus: reservationStatusValidator,
  },
  returns: successValidator,
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    if (!user) {
      throw new Error("User not authenticated.");
    }

    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) {
      throw new Error("Reservation not found.");
    }

    if (reservation.userId !== user._id && user.role !== "admin") {
      throw new Error("User not authorized to update this reservation status.");
    }

    await ctx.db.patch(args.reservationId, { status: args.newStatus });
    await recordStatsStatusChange(
      ctx,
      "reservations",
      reservation.status,
      args.newStatus,
    );

    // Void the linked referral conversion on cancel (re-confirm on un-cancel)
    await syncConversionForBooking(ctx, {
      bookingType: "reservation",
      bookingId: args.reservationId,
      bookingIsLive: args.newStatus !== "cancelled",
    });

    return { success: true };
  },
});

export const updateReservationDetails = mutation({
  args: {
    reservationId: v.id("reservations"),
    vehicleId: v.optional(v.id("vehicles")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    pickupTime: v.optional(v.string()),
    restitutionTime: v.optional(v.string()),
    pickupLocation: v.optional(v.string()),
    restitutionLocation: v.optional(v.string()),
    paymentMethod: v.optional(
      v.union(
        v.literal("cash_on_delivery"),
        v.literal("card_on_delivery"),
        v.literal("card_online"),
      ),
    ),
    totalPrice: v.optional(v.number()),
    customerInfo: v.optional(
      v.object({
        name: v.string(),
        email: v.string(),
        phone: v.string(),
        message: v.optional(v.string()),
        flightNumber: v.optional(v.string()),
      }),
    ),
    status: v.optional(reservationStatusValidator),
    additionalCharges: v.optional(v.array(additionalChargeValidator)),
    isSCDWSelected: v.optional(v.boolean()),
    deductibleAmount: v.optional(v.number()),
    protectionCost: v.optional(v.number()),
    seasonId: v.optional(v.id("seasons")),
    seasonalMultiplier: v.optional(v.number()),
  },
  returns: v.union(
    successMessageValidator,
    v.object({
      success: v.boolean(),
      reservationId: v.id("reservations"),
    }),
  ),
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    if (!user) {
      throw new Error("User not authenticated.");
    }
    const { reservationId, ...updatesIn } = args;

    const reservation = await ctx.db.get(reservationId);
    if (!reservation) {
      throw new Error("Reservation not found.");
    }

    if (reservation.userId !== user._id && user.role !== "admin") {
      throw new Error("User not authorized to update this reservation.");
    }

    // Construct the updates object carefully to pass to patch
    const updatesToApply: Partial<typeof reservation> = {};
    if (updatesIn.vehicleId !== undefined)
      updatesToApply.vehicleId = updatesIn.vehicleId;
    if (updatesIn.startDate !== undefined)
      updatesToApply.startDate = updatesIn.startDate;
    if (updatesIn.endDate !== undefined)
      updatesToApply.endDate = updatesIn.endDate;
    if (updatesIn.pickupTime !== undefined)
      updatesToApply.pickupTime = updatesIn.pickupTime;
    if (updatesIn.restitutionTime !== undefined)
      updatesToApply.restitutionTime = updatesIn.restitutionTime;
    if (updatesIn.pickupLocation !== undefined)
      updatesToApply.pickupLocation = updatesIn.pickupLocation;
    if (updatesIn.restitutionLocation !== undefined)
      updatesToApply.restitutionLocation = updatesIn.restitutionLocation;
    if (updatesIn.paymentMethod !== undefined)
      updatesToApply.paymentMethod = updatesIn.paymentMethod;
    if (updatesIn.totalPrice !== undefined)
      updatesToApply.totalPrice = updatesIn.totalPrice;
    if (updatesIn.customerInfo !== undefined)
      updatesToApply.customerInfo = updatesIn.customerInfo;
    if (updatesIn.status !== undefined)
      updatesToApply.status = updatesIn.status; // status is already validated by args
    if (updatesIn.additionalCharges !== undefined)
      updatesToApply.additionalCharges = updatesIn.additionalCharges;
    if (updatesIn.isSCDWSelected !== undefined)
      updatesToApply.isSCDWSelected = updatesIn.isSCDWSelected;
    if (updatesIn.deductibleAmount !== undefined)
      updatesToApply.deductibleAmount = updatesIn.deductibleAmount;
    if (updatesIn.protectionCost !== undefined)
      updatesToApply.protectionCost = updatesIn.protectionCost;
    if (updatesIn.seasonId !== undefined)
      updatesToApply.seasonId = updatesIn.seasonId;
    if (updatesIn.seasonalMultiplier !== undefined)
      updatesToApply.seasonalMultiplier = updatesIn.seasonalMultiplier;

    if (Object.keys(updatesToApply).length === 0) {
      return { success: true, message: "No changes provided." };
    }

    await ctx.db.patch(reservationId, updatesToApply);

    if (updatesToApply.status !== undefined) {
      await recordStatsStatusChange(
        ctx,
        "reservations",
        reservation.status,
        updatesToApply.status,
      );
      await syncConversionForBooking(ctx, {
        bookingType: "reservation",
        bookingId: reservationId,
        bookingIsLive: updatesToApply.status !== "cancelled",
      });
    }

    return { success: true, reservationId };
  },
});

// --- DELETE (Soft Delete) ---
export const cancelReservation = mutation({
  args: { reservationId: v.id("reservations") },
  returns: successMessageValidator,
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    if (!user) {
      throw new Error("User not authenticated.");
    }

    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) {
      throw new Error("Reservation not found.");
    }

    // Only the owner of the reservation or an admin may cancel it
    if (user.role !== "admin" && reservation.userId !== user._id) {
      throw new Error("User not authorized to cancel this reservation.");
    }

    if (
      user.role !== "admin" &&
      (reservation.status === "completed" || reservation.status === "cancelled")
    ) {
      throw new Error(
        `Reservation is already ${reservation.status} and cannot be modified by user.`,
      );
    }

    // If reservation was "pending" or "confirmed", it can be "cancelled".
    // If it was already "completed", only an admin should be able to change it further (e.g. to "cancelled" for a special case refund)

    await ctx.db.patch(args.reservationId, {
      status: "cancelled" as ReservationStatusType,
    });
    await recordStatsStatusChange(
      ctx,
      "reservations",
      reservation.status,
      "cancelled",
    );

    // Owner decision (RNGO-26): a cancelled booking must not keep crediting
    // the referrer — void the conversion and decrement their counter
    await syncConversionForBooking(ctx, {
      bookingType: "reservation",
      bookingId: args.reservationId,
      bookingIsLive: false,
    });

    return { success: true, message: "Reservation cancelled." };
  },
});

// Hard delete (admin-only, use with caution)
export const deleteReservationPermanently = mutation({
  args: { reservationId: v.id("reservations") },
  returns: successMessageValidator,
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    if (!user || user.role !== "admin") {
      throw new Error("User not authorized (admin only).");
    }

    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) {
      return {
        success: true,
        message: "Reservation not found or already deleted.",
      };
    }

    // A hard-deleted booking is not live: void its conversion first
    await syncConversionForBooking(ctx, {
      bookingType: "reservation",
      bookingId: args.reservationId,
      bookingIsLive: false,
    });
    await ctx.db.delete(args.reservationId);
    await recordStatsRemove(ctx, "reservations", reservation.status);

    return { success: true, message: "Reservation permanently deleted." };
  },
});

// Get reservation statistics for admin dashboard
export const getReservationStats = query({
  args: { now: v.number() },
  returns: v.object({
    totalReservations: v.number(),
    confirmedReservations: v.number(),
    activeReservations: v.number(),
    pendingConfirmations: v.number(),
    currentMonthRevenue: v.number(),
    reservationGrowth: v.number(),
    revenueGrowth: v.number(),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const stats = await getTableStats(ctx, "reservations");
    let totalReservations: number;
    let confirmedReservations: number;
    let pendingConfirmations: number;
    if (stats) {
      totalReservations = stats.total;
      confirmedReservations = stats.byStatus.confirmed ?? 0;
      pendingConfirmations = stats.byStatus.pending ?? 0;
    } else {
      // Aggregates not seeded yet (migrations/seedTableStats): keep the
      // exact-but-slow scan until the seed migration has run.
      const allReservations = await ctx.db.query("reservations").collect();
      totalReservations = allReservations.length;
      confirmedReservations = allReservations.filter(
        (reservation) => reservation.status === "confirmed",
      ).length;
      pendingConfirmations = allReservations.filter(
        (reservation) => reservation.status === "pending",
      ).length;
    }

    // Every reservation active now still has endDate >= now, so this range
    // only reads ongoing + future bookings instead of the whole table.
    const notYetEnded = await ctx.db
      .query("reservations")
      .withIndex("by_end_date", (q) => q.gte("endDate", args.now))
      .collect();
    const activeReservations = notYetEnded.filter(
      (reservation) =>
        reservation.status === "confirmed" && reservation.startDate <= args.now,
    ).length;

    const oldestMonth = getRecentMonthKeys(args.now, 2)[0];
    const currentMonth = getRecentMonthKeys(args.now, 1)[0];
    const recentReservations = await ctx.db
      .query("reservations")
      .withIndex("by_creation_time", (q) =>
        q
          .gte("_creationTime", getMonthRange(oldestMonth).start)
          .lt("_creationTime", getMonthRange(currentMonth).end),
      )
      .collect();

    const [previous, current] = bucketMonthlyStats(
      recentReservations.map((reservation) => ({
        timestamp: reservation._creationTime,
        revenue:
          reservation.status === "confirmed" ||
          reservation.status === "completed"
            ? reservation.totalPrice
            : 0,
      })),
      args.now,
      2,
    );

    return {
      totalReservations,
      confirmedReservations,
      activeReservations,
      pendingConfirmations,
      currentMonthRevenue: current.revenue,
      reservationGrowth: calculateGrowth(current.count, previous.count),
      revenueGrowth: calculateGrowth(current.revenue, previous.revenue),
    };
  },
});

// Get monthly data for charts (last 6 months)
export const getMonthlyChartData = query({
  args: { now: v.number() },
  returns: v.array(
    v.object({
      month: v.string(),
      reservations: v.number(),
      revenue: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const oldestMonth = getRecentMonthKeys(args.now, 6)[0];
    const currentMonth = getRecentMonthKeys(args.now, 1)[0];
    const reservations = await ctx.db
      .query("reservations")
      .withIndex("by_creation_time", (q) =>
        q
          .gte("_creationTime", getMonthRange(oldestMonth).start)
          .lt("_creationTime", getMonthRange(currentMonth).end),
      )
      .collect();

    return bucketMonthlyStats(
      reservations.map((reservation) => ({
        timestamp: reservation._creationTime,
        revenue:
          reservation.status === "confirmed" ||
          reservation.status === "completed"
            ? reservation.totalPrice
            : 0,
      })),
      args.now,
      6,
    ).map((month) => ({
      month: month.month,
      reservations: month.count,
      revenue: Math.round(month.revenue),
    }));
  },
});

export const getOverviewMonthlyRevenue = query({
  args: {
    months: v.array(
      v.object({
        month: v.string(),
        start: v.number(),
        end: v.number(),
      }),
    ),
  },
  returns: v.array(
    v.object({
      month: v.string(),
      revenue: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    validateContiguousTimestampRanges(
      args.months,
      6,
      32 * 24 * 60 * 60 * 1000,
      "Month",
    );

    const rangeStart = args.months[0].start;
    const rangeEnd = args.months[args.months.length - 1].end;
    const reservations = await ctx.db
      .query("reservations")
      .withIndex("by_dates", (q) =>
        q.gte("startDate", rangeStart).lt("startDate", rangeEnd),
      )
      .collect();

    return args.months.map((month) => ({
      month: month.month,
      revenue: reservations
        .filter(
          (reservation) =>
            reservation.startDate >= month.start &&
            reservation.startDate < month.end &&
            (reservation.status === "confirmed" ||
              reservation.status === "completed"),
        )
        .reduce((total, reservation) => total + reservation.totalPrice, 0),
    }));
  },
});

export const getWeeklyReservationChartData = query({
  args: {
    days: v.array(
      v.object({
        day: v.string(),
        start: v.number(),
        end: v.number(),
      }),
    ),
  },
  returns: v.array(
    v.object({
      day: v.string(),
      reservations: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    validateContiguousTimestampRanges(args.days, 7, 25 * 60 * 60 * 1000, "Day");

    const rangeStart = args.days[0].start;
    const rangeEnd = args.days[args.days.length - 1].end;
    const reservations = await ctx.db
      .query("reservations")
      .withIndex("by_dates", (q) =>
        q.gte("startDate", rangeStart).lt("startDate", rangeEnd),
      )
      .collect();

    return args.days.map((day) => ({
      day: day.day,
      reservations: reservations.filter(
        (reservation) =>
          reservation.startDate >= day.start && reservation.startDate < day.end,
      ).length,
    }));
  },
});
