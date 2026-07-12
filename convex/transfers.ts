import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getCurrentUser, getCurrentUserOrThrow, requireAdmin } from "./users";
import { applyAndRedeemCoupon } from "./coupons";
import {
  recordReferralConversion,
  referralArgValidator,
  resolveAffiliateCandidates,
  syncConversionForBooking,
} from "./affiliates";
import {
  applyDiscountToTotal,
  assertValidTransferDistance,
  computeTransferPricing,
  pickDiscount,
  type AppliedDiscount,
} from "../lib/pricing";

const transferStatusValidator = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("cancelled"),
  v.literal("completed"),
);

type TransferStatusType = "pending" | "confirmed" | "cancelled" | "completed";

const locationValidator = v.object({
  address: v.string(),
  coordinates: v.object({
    lng: v.number(),
    lat: v.number(),
  }),
});

const customerInfoValidator = v.object({
  name: v.string(),
  email: v.string(),
  phone: v.string(),
  message: v.optional(v.string()),
  flightNumber: v.optional(v.string()),
});

const paymentMethodValidator = v.union(
  v.literal("cash_on_delivery"),
  v.literal("card_on_delivery"),
  v.literal("card_online"),
);

export const createTransfer = mutation({
  args: {
    userId: v.optional(v.id("users")),
    vehicleId: v.id("vehicles"),
    transferType: v.union(v.literal("one_way"), v.literal("round_trip")),
    pickupLocation: locationValidator,
    pickupDate: v.number(),
    pickupTime: v.string(),
    dropoffLocation: locationValidator,
    returnDate: v.optional(v.number()),
    returnTime: v.optional(v.string()),
    passengers: v.number(),
    distanceKm: v.number(),
    estimatedDurationMinutes: v.number(),
    baseFare: v.number(),
    distancePrice: v.number(),
    totalPrice: v.number(),
    pricePerKm: v.number(),
    customerInfo: customerInfoValidator,
    paymentMethod: paymentMethodValidator,
    luggageCount: v.optional(v.number()),
    // Coupon code to redeem — validated server-side; an invalid code fails
    // the booking
    promoCode: v.optional(v.string()),
    // Referral cookie payload — see createReservation; never fails the booking
    referral: v.optional(referralArgValidator),
    locale: v.optional(v.string()),
  },
  returns: v.object({
    transferId: v.id("transfers"),
    transferNumber: v.number(),
  }),
  handler: async (ctx, args) => {
    // Derive the user from auth — never trust a client-supplied userId
    const currentUser = await getCurrentUser(ctx);

    // Sanity-check the distance before any fare math. The fare FORMULA is
    // server-authoritative, but distanceKm itself still comes from the
    // client's Mapbox route — re-deriving it server-side from the stored
    // coordinates is tracked as RNGO-30. This clamp only blocks the worst
    // abuse (negative/non-finite/absurd values setting a bogus fare).
    assertValidTransferDistance(args.distanceKm);

    // Authoritative fare recompute from server data; client-submitted money
    // fields are never persisted
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) {
      throw new Error("Vehicle not found.");
    }
    const vehicleClass = vehicle.classId
      ? await ctx.db.get(vehicle.classId)
      : null;
    const tiers = await ctx.db.query("transferPricingTiers").collect();

    const fare = computeTransferPricing({
      distanceKm: args.distanceKm,
      transferType: args.transferType,
      vehicleClass,
      tiers,
    });

    // Soft drift telemetry during rollout: the server value always wins
    if (Math.abs(args.totalPrice - fare.totalPrice) > 0.5) {
      console.warn("[pricing] createTransfer client/server total mismatch", {
        clientTotal: args.totalPrice,
        serverTotal: fare.totalPrice,
        vehicleId: args.vehicleId,
        distanceKm: args.distanceKm,
        transferType: args.transferType,
      });
    }

    // Single-discount seam — same shape as createReservation: coupon
    // redemption is transactional (see applyAndRedeemCoupon for the OCC
    // argument) and a present coupon always beats the automatic affiliate
    // candidates in pickDiscount.
    const redeemedCoupon = args.promoCode?.trim()
      ? await applyAndRedeemCoupon(ctx, {
          code: args.promoCode,
          bookingType: "transfers",
          subtotal: fare.totalPrice,
          userId: currentUser?._id,
          customerEmail: args.customerInfo.email,
        })
      : null;
    const affiliateCandidates = await resolveAffiliateCandidates(ctx, {
      referral: args.referral,
      currentUser,
      customerEmail: args.customerInfo.email,
      subtotal: fare.totalPrice,
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
    const totalPrice = appliedDiscount
      ? applyDiscountToTotal(fare.totalPrice, appliedDiscount.amount)
      : fare.totalPrice;

    // Compute next transfer number (highest existing via index)
    const latestNumbered = await ctx.db
      .query("transfers")
      .withIndex("by_number")
      .order("desc")
      .first();
    const nextTransferNumber = (latestNumbered?.transferNumber ?? 0) + 1;

    const newTransferData = {
      transferNumber: nextTransferNumber,
      userId: currentUser?._id ?? undefined,
      vehicleId: args.vehicleId,
      transferType: args.transferType,
      pickupLocation: args.pickupLocation,
      pickupDate: args.pickupDate,
      pickupTime: args.pickupTime,
      dropoffLocation: args.dropoffLocation,
      returnDate: args.returnDate,
      returnTime: args.returnTime,
      passengers: args.passengers,
      distanceKm: args.distanceKm,
      estimatedDurationMinutes: args.estimatedDurationMinutes,
      baseFare: fare.baseFare,
      distancePrice: fare.distanceCharge,
      totalPrice,
      pricePerKm: fare.tierPricePerKm,
      promoCode: redeemedCoupon?.code,
      couponId: redeemedCoupon?.couponId,
      discountAmount: appliedDiscount?.amount,
      discountSource: appliedDiscount?.source,
      affiliateId:
        affiliateCandidates.referred?.affiliateId ??
        (appliedDiscount === ownRewardDiscount
          ? affiliateCandidates.ownReward?.affiliateId
          : undefined),
      customerInfo: args.customerInfo,
      paymentMethod: args.paymentMethod,
      luggageCount: args.luggageCount,
      status: "pending" as const,
    };

    const transferId = await ctx.db.insert("transfers", newTransferData);

    // Link the redemption audit row to the booking it paid for
    if (redeemedCoupon) {
      await ctx.db.patch(redeemedCoupon.redemptionId, { transferId });
    }

    // Conversion lifecycle — see createReservation for the rationale
    if (affiliateCandidates.referred) {
      const conversionId = await recordReferralConversion(ctx, {
        affiliateId: affiliateCandidates.referred.affiliateId,
        bookingType: "transfer",
        referredUserId: currentUser?._id,
        referredEmail: args.customerInfo.email,
        referredDiscountAmount:
          referredDiscount && appliedDiscount === referredDiscount
            ? referredDiscount.amount
            : 0,
        rewardPercentSnapshot:
          affiliateCandidates.referred.rewardPercentSnapshot,
      });
      await ctx.db.patch(conversionId, { transferId });
    }

    // Format pickup date for email
    const pickupDateObj = new Date(args.pickupDate);
    const timeZone = 'Europe/Bucharest';
    const pickupDateString = pickupDateObj.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', timeZone });
    
    let returnDateString: string | undefined;
    if (args.returnDate) {
      const returnDateObj = new Date(args.returnDate);
      returnDateString = returnDateObj.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', timeZone });
    }

    // Schedule email sending
    await ctx.scheduler.runAfter(0, internal.emails.sendTransferConfirmationEmail, {
      transferNumber: nextTransferNumber,
      customerInfo: args.customerInfo,
      vehicleInfo: {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        type: vehicle.type,
        seats: vehicle.transferSeats ?? vehicle.seats,
        transmission: vehicle.transmission,
        fuelType: vehicle.fuelType,
      },
      pickupLocation: {
        address: args.pickupLocation.address,
      },
      dropoffLocation: {
        address: args.dropoffLocation.address,
      },
      pickupDate: pickupDateString,
      pickupTime: args.pickupTime,
      returnDate: returnDateString,
      returnTime: args.returnTime,
      transferType: args.transferType,
      passengers: args.passengers,
      luggageCount: args.luggageCount,
      distanceKm: args.distanceKm,
      estimatedDurationMinutes: args.estimatedDurationMinutes,
      pricingDetails: {
        baseFare: fare.baseFare,
        distancePrice: fare.distanceCharge,
        totalPrice,
        pricePerKm: fare.tierPricePerKm,
        promoCode: appliedDiscount?.code,
        discountAmount: appliedDiscount?.amount,
        isReferralDiscount: appliedDiscount?.source === "affiliate",
      },
      paymentMethod: args.paymentMethod,
      locale: args.locale,
    });

    return {
      transferId,
      transferNumber: nextTransferNumber,
    };
  },
});

export const getTransferById = query({
  args: {
    transferId: v.id("transfers"),
  },
  handler: async (ctx, args) => {
    const transfer = await ctx.db.get(args.transferId);
    if (!transfer) return null;

    // Guest bookings (no userId) stay readable so the public confirmation
    // page keeps working right after booking. Transfers linked to a user
    // are only visible to that user or an admin.
    if (!transfer.userId) {
      return transfer;
    }

    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Authentication required to view this transfer.");
    }
    if (user.role !== "admin" && transfer.userId !== user._id) {
      throw new Error("User not authorized to view this transfer.");
    }

    return transfer;
  },
});

export const getCurrentUserTransfers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const transfers = await ctx.db
      .query("transfers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return transfers.sort((a, b) => b.pickupDate - a.pickupDate);
  },
});

export const getTransfersByVehicle = query({
  args: {
    vehicleId: v.id("vehicles"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const transfers = await ctx.db
      .query("transfers")
      .withIndex("by_vehicle", (q) => q.eq("vehicleId", args.vehicleId))
      .collect();
    return transfers;
  },
});

export const getAllTransfers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const transfers = await ctx.db.query("transfers").collect();
    return transfers.sort((a, b) => b.pickupDate - a.pickupDate);
  },
});

export const updateTransferStatus = mutation({
  args: {
    transferId: v.id("transfers"),
    newStatus: transferStatusValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const transfer = await ctx.db.get(args.transferId);
    if (!transfer) {
      throw new Error("Transfer not found");
    }

    await ctx.db.patch(args.transferId, {
      status: args.newStatus as TransferStatusType,
    });

    // Void the linked referral conversion on cancel (re-confirm on un-cancel)
    await syncConversionForBooking(ctx, {
      bookingType: "transfer",
      bookingId: args.transferId,
      bookingIsLive: args.newStatus !== "cancelled",
    });

    return { success: true };
  },
});

export const updateTransferDetails = mutation({
  args: {
    transferId: v.id("transfers"),
    vehicleId: v.optional(v.id("vehicles")),
    transferType: v.optional(
      v.union(v.literal("one_way"), v.literal("round_trip")),
    ),
    pickupLocation: v.optional(locationValidator),
    pickupDate: v.optional(v.number()),
    pickupTime: v.optional(v.string()),
    dropoffLocation: v.optional(locationValidator),
    returnDate: v.optional(v.number()),
    returnTime: v.optional(v.string()),
    passengers: v.optional(v.number()),
    distanceKm: v.optional(v.number()),
    estimatedDurationMinutes: v.optional(v.number()),
    baseFare: v.optional(v.number()),
    distancePrice: v.optional(v.number()),
    totalPrice: v.optional(v.number()),
    pricePerKm: v.optional(v.number()),
    customerInfo: v.optional(customerInfoValidator),
    paymentMethod: v.optional(paymentMethodValidator),
    status: v.optional(transferStatusValidator),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { transferId, ...updates } = args;

    const transfer = await ctx.db.get(transferId);
    if (!transfer) {
      throw new Error("Transfer not found");
    }

    const updatesToApply: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        updatesToApply[key] = value;
      }
    }

    if (Object.keys(updatesToApply).length > 0) {
      await ctx.db.patch(transferId, updatesToApply);
    }

    if (updates.status !== undefined) {
      await syncConversionForBooking(ctx, {
        bookingType: "transfer",
        bookingId: transferId,
        bookingIsLive: updates.status !== "cancelled",
      });
    }

    return { success: true };
  },
});

export const cancelTransfer = mutation({
  args: {
    transferId: v.id("transfers"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const transfer = await ctx.db.get(args.transferId);
    if (!transfer) {
      throw new Error("Transfer not found");
    }

    // Only the owner of the transfer or an admin may cancel it
    if (user.role !== "admin" && transfer.userId !== user._id) {
      throw new Error("User not authorized to cancel this transfer.");
    }

    if (transfer.status === "completed") {
      throw new Error("Cannot cancel a completed transfer");
    }

    if (transfer.status === "cancelled") {
      throw new Error("Transfer is already cancelled");
    }

    await ctx.db.patch(args.transferId, { status: "cancelled" });

    // Owner decision (RNGO-26): void the referral conversion so the
    // referrer's counter only reflects live bookings
    await syncConversionForBooking(ctx, {
      bookingType: "transfer",
      bookingId: args.transferId,
      bookingIsLive: false,
    });

    return { success: true, message: "Transfer cancelled successfully" };
  },
});

export const deleteTransferPermanently = mutation({
  args: {
    transferId: v.id("transfers"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const transfer = await ctx.db.get(args.transferId);
    if (!transfer) {
      return { success: false, message: "Transfer not found" };
    }

    // A hard-deleted booking is not live: void its conversion first
    await syncConversionForBooking(ctx, {
      bookingType: "transfer",
      bookingId: args.transferId,
      bookingIsLive: false,
    });
    await ctx.db.delete(args.transferId);

    return { success: true, message: "Transfer deleted permanently" };
  },
});

export const getTransferStats = query({
  args: {},
  returns: v.object({
    totalTransfers: v.number(),
    activeTransfers: v.number(),
    pendingConfirmations: v.number(),
    currentMonthRevenue: v.number(),
    transferGrowth: v.number(),
    revenueGrowth: v.number(),
  }),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const allTransfers = await ctx.db.query("transfers").collect();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonthStart = new Date(currentYear, currentMonth - 1, 1).getTime();
    const currentMonthStart = new Date(currentYear, currentMonth, 1).getTime();

    const totalTransfers = allTransfers.length;

    const activeTransfers = allTransfers.filter(
      (t) => t.status === "confirmed" && t.pickupDate >= Date.now(),
    ).length;

    const pendingConfirmations = allTransfers.filter(
      (t) => t.status === "pending",
    ).length;

    const currentMonthTransfers = allTransfers.filter(
      (t) => t.pickupDate >= currentMonthStart,
    );
    const currentMonthRevenue = currentMonthTransfers.reduce(
      (sum, t) => sum + t.totalPrice,
      0,
    );

    const lastMonthTransfers = allTransfers.filter(
      (t) => t.pickupDate >= lastMonthStart && t.pickupDate < currentMonthStart,
    );
    const lastMonthRevenue = lastMonthTransfers.reduce(
      (sum, t) => sum + t.totalPrice,
      0,
    );

    const transferGrowth =
      lastMonthTransfers.length > 0
        ? Math.round(
            ((currentMonthTransfers.length - lastMonthTransfers.length) /
              lastMonthTransfers.length) *
              100,
          )
        : currentMonthTransfers.length > 0
          ? 100
          : 0;

    const revenueGrowth =
      lastMonthRevenue > 0
        ? Math.round(
            ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100,
          )
        : currentMonthRevenue > 0
          ? 100
          : 0;

    return {
      totalTransfers,
      activeTransfers,
      pendingConfirmations,
      currentMonthRevenue: Math.round(currentMonthRevenue),
      transferGrowth,
      revenueGrowth,
    };
  },
});

export const getMonthlyTransferChartData = query({
  args: {},
  returns: v.array(
    v.object({
      month: v.string(),
      transfers: v.number(),
      revenue: v.number(),
    }),
  ),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const allTransfers = await ctx.db.query("transfers").collect();

    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = date.getTime();
      const monthEnd = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
      ).getTime();

      const monthTransfers = allTransfers.filter(
        (t) => t.pickupDate >= monthStart && t.pickupDate <= monthEnd,
      );

      const monthRevenue = monthTransfers.reduce(
        (sum, t) => sum + t.totalPrice,
        0,
      );

      months.push({
        month: date.toLocaleString("default", { month: "short" }),
        transfers: monthTransfers.length,
        revenue: Math.round(monthRevenue),
      });
    }

    return months;
  },
});

export const getTransferVehicles = query({
  args: {
    minSeats: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_transfer", (q) => q.eq("isTransferVehicle", true))
      .collect();

    const availableVehicles = vehicles.filter((v) => v.status === "available");

    const minSeats = args.minSeats;
    if (minSeats !== undefined) {
      return availableVehicles.filter((v) => {
        const effectiveCapacity = v.transferSeats ?? ((v.seats ?? 0) - 2);
        return effectiveCapacity >= minSeats;
      });
    }

    return availableVehicles;
  },
});

export const getTransferVehiclesWithImages = query({
  args: {
    minSeats: v.optional(v.number()),
    distanceKm: v.optional(v.number()),
    transferType: v.optional(v.union(v.literal("one_way"), v.literal("round_trip"))),
  },
  handler: async (ctx, args) => {
    const vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_transfer", (q) => q.eq("isTransferVehicle", true))
      .collect();

    const availableVehicles = vehicles.filter((v) => v.status === "available");

    // Filter by transferSeats (if set) or fallback to seats - 2
    const minSeats = args.minSeats;
    const filteredVehicles = minSeats !== undefined
      ? availableVehicles.filter((v) => {
          const effectiveCapacity = v.transferSeats ?? ((v.seats ?? 0) - 2);
          return effectiveCapacity >= minSeats;
        })
      : availableVehicles;

    // Fetch all vehicle classes for base fare and multiplier lookup
    const vehicleClasses = await ctx.db.query("vehicleClasses").collect();
    const classMap = new Map(vehicleClasses.map((c) => [c._id, c]));

    // Fetch all pricing tiers (computeTransferPricing filters to active ones)
    const pricingTiers = await ctx.db.query("transferPricingTiers").collect();

    const vehiclesWithImages = await Promise.all(
      filteredVehicles.map(async (vehicle) => {
        let imageUrl: string | null = null;
        const imageId = vehicle.mainImageId || vehicle.images?.[0];
        if (imageId) {
          imageUrl = await ctx.storage.getUrl(imageId);
        }

        const vehicleClass = vehicle.classId ? classMap.get(vehicle.classId) : null;

        const fare = computeTransferPricing({
          distanceKm: args.distanceKm ?? 0,
          transferType: args.transferType ?? "one_way",
          vehicleClass,
          tiers: pricingTiers,
        });

        return {
          ...vehicle,
          imageUrl,
          transferBaseFare: fare.baseFare,
          classMultiplier: vehicleClass?.transferMultiplier ?? 1.0,
          distanceCharge: fare.distanceCharge,
          calculatedPrice: fare.totalPrice,
        };
      }),
    );

    // Sort by calculated price (ascending)
    return vehiclesWithImages.sort((a, b) => a.calculatedPrice - b.calculatedPrice);
  },
});
