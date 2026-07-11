import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { getCurrentUser, getCurrentUserOrThrow, requireAdmin } from "./users";
import {
  assertValidReservationExtras,
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
  v.literal("completed")
);

// Explicit type for ReservationStatus based on the schema
type ReservationStatusType = "pending" | "confirmed" | "cancelled" | "completed";

 

// Validator for additional charges, aligned with schema.ts
const additionalChargeValidator = v.object({
  description: v.string(),
  amount: v.number(),
});

// --- CREATE ---
export const createReservation = mutation({
  args: {
    userId: v.optional(v.id("users")),
    vehicleId: v.id("vehicles"),
    startDate: v.number(), // Unix timestamp
    endDate: v.number(),   // Unix timestamp
    pickupTime: v.string(), // Time in "HH:MM" format
    restitutionTime: v.string(), // Time in "HH:MM" format
    pickupLocation: v.string(), // Name of pickup location
    restitutionLocation: v.string(), // Name of return location
    paymentMethod: v.union(
      v.literal("cash_on_delivery"),
      v.literal("card_on_delivery"),
      v.literal("card_online")
    ),
    totalPrice: v.number(),
    customerInfo: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      message: v.optional(v.string()),
      flightNumber: v.optional(v.string()),
    }),
    promoCode: v.optional(v.string()),
    additionalCharges: v.optional(v.array(additionalChargeValidator)),
    isSCDWSelected: v.boolean(),
    deductibleAmount: v.number(),
    protectionCost: v.optional(v.number()),
    seasonId: v.optional(v.id("seasons")),
    seasonalMultiplier: v.optional(v.number()),
    // Email data fields
    vehicleInfo: v.optional(v.object({
      make: v.string(),
      model: v.string(),
      year: v.optional(v.number()),
      type: v.optional(v.string()),
      seats: v.optional(v.number()),
      transmission: v.optional(v.string()),
      fuelType: v.optional(v.string()),
      features: v.optional(v.array(v.string())),
    })),
    pricePerDayUsed: v.optional(v.number()),
    locale: v.optional(v.string()),
    // Structured extras (new clients). When present, the server recomputes
    // ALL charges from these; the legacy prose `additionalCharges` are then
    // only used for the email rendering.
    extras: v.optional(v.object({
      snowChains: v.boolean(),
      childSeat1to4: v.number(),
      childSeat5to12: v.number(),
      extraKilometers: v.number(),
    })),
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
    // client-supplied userId
    const currentUser = await getCurrentUser(ctx);

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

    // Compute next reservation number (highest existing via index)
    const latestNumbered = await ctx.db
      .query("reservations")
      .withIndex("by_number")
      .order("desc")
      .first();
    const nextReservationNumber = latestNumbered
      ? (latestNumbered.reservationNumber ?? 0) + 1
      : 10000;

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
      promoCode: args.promoCode,
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

    const reservationId = await ctx.db.insert("reservations", newReservationData);

    // Schedule email sending if vehicle info is provided
    if (args.vehicleInfo) {
      // Format dates for email
      const timeZone = 'Europe/Bucharest';
      const startDateString = new Date(args.startDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', timeZone });
      const endDateString = new Date(args.endDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', timeZone });

      await ctx.scheduler.runAfter(0, internal.emails.sendReservationConfirmationEmail, {
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
        },
        pricingDetails: {
          // Server-computed values so the email matches what was stored.
          // Line items stay on the legacy localized prose until RNGO-24
          // teaches the templates to render coded charges.
          pricePerDay: pricing.pricePerDay,
          totalPrice,
          paymentMethod: args.paymentMethod,
          promoCode: args.promoCode,
          additionalCharges: args.additionalCharges,
          isSCDWSelected: args.isSCDWSelected,
          deductibleAmount: pricing.deductibleAmount,
          protectionCost:
            pricing.protectionCost > 0 ? pricing.protectionCost : undefined,
        },
        locale: args.locale,
      });
    }

    return { reservationId, reservationNumber: nextReservationNumber };
  },
});

// --- READ ---
export const getReservationById = query({
  args: { reservationId: v.id("reservations") },
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
      if (currentUser.role === "admin" || reservation.userId === currentUser._id) {
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

export const getCurrentUserReservations = query({
  args: {}, // No args needed, uses authenticated user
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("reservations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getReservationsByVehicle = query({
  args: { vehicleId: v.id("vehicles") },
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
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    if (user.role !== "admin") {
      throw new Error("User not authorized (admin only).");
    }

    return await ctx.db
      .query("reservations")
      .withIndex("by_pickup_location", (q) => q.eq("pickupLocation", args.pickupLocation))
      .collect();
  },
});

export const getReservationsByPaymentMethod = query({
  args: { 
    paymentMethod: v.union(
      v.literal("cash_on_delivery"),
      v.literal("card_on_delivery"),
      v.literal("card_online")
    ) 
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    if (user.role !== "admin") {
      throw new Error("User not authorized (admin only).");
    }

    return await ctx.db
      .query("reservations")
      .withIndex("by_payment_method", (q) => q.eq("paymentMethod", args.paymentMethod))
      .collect();
  },
});

// Admin-only
export const getAllReservations = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    if (user.role !== "admin") {
      throw new Error("User not authorized (admin only).");
    }
    return await ctx.db.query("reservations").order("desc").collect();
  },
});

// --- UPDATE ---
export const updateReservationStatus = mutation({
  args: {
    reservationId: v.id("reservations"),
    newStatus: reservationStatusValidator,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) {
      throw new Error("Reservation not found.");
    }

    if (reservation.userId !== user._id && user.role !== "admin") {
      throw new Error("User not authorized to update this reservation status.");
    }

    await ctx.db.patch(args.reservationId, { status: args.newStatus });

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
    paymentMethod: v.optional(v.union(
      v.literal("cash_on_delivery"),
      v.literal("card_on_delivery"),
      v.literal("card_online")
    )),
    totalPrice: v.optional(v.number()),
    customerInfo: v.optional(v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      message: v.optional(v.string()),
      flightNumber: v.optional(v.string()),
    })),
    status: v.optional(reservationStatusValidator),
    promoCode: v.optional(v.string()),
    additionalCharges: v.optional(v.array(additionalChargeValidator)),
    isSCDWSelected: v.optional(v.boolean()),
    deductibleAmount: v.optional(v.number()),
    protectionCost: v.optional(v.number()),
    seasonId: v.optional(v.id("seasons")),
    seasonalMultiplier: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
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
    if (updatesIn.vehicleId !== undefined) updatesToApply.vehicleId = updatesIn.vehicleId;
    if (updatesIn.startDate !== undefined) updatesToApply.startDate = updatesIn.startDate;
    if (updatesIn.endDate !== undefined) updatesToApply.endDate = updatesIn.endDate;
    if (updatesIn.pickupTime !== undefined) updatesToApply.pickupTime = updatesIn.pickupTime;
    if (updatesIn.restitutionTime !== undefined) updatesToApply.restitutionTime = updatesIn.restitutionTime;
    if (updatesIn.pickupLocation !== undefined) updatesToApply.pickupLocation = updatesIn.pickupLocation;
    if (updatesIn.restitutionLocation !== undefined) updatesToApply.restitutionLocation = updatesIn.restitutionLocation;
    if (updatesIn.paymentMethod !== undefined) updatesToApply.paymentMethod = updatesIn.paymentMethod;
    if (updatesIn.totalPrice !== undefined) updatesToApply.totalPrice = updatesIn.totalPrice;
    if (updatesIn.customerInfo !== undefined) updatesToApply.customerInfo = updatesIn.customerInfo;
    if (updatesIn.status !== undefined) updatesToApply.status = updatesIn.status; // status is already validated by args
    if (updatesIn.promoCode !== undefined) updatesToApply.promoCode = updatesIn.promoCode;
    if (updatesIn.additionalCharges !== undefined) updatesToApply.additionalCharges = updatesIn.additionalCharges;
    if (updatesIn.isSCDWSelected !== undefined) updatesToApply.isSCDWSelected = updatesIn.isSCDWSelected;
    if (updatesIn.deductibleAmount !== undefined) updatesToApply.deductibleAmount = updatesIn.deductibleAmount;
    if (updatesIn.protectionCost !== undefined) updatesToApply.protectionCost = updatesIn.protectionCost;
    if (updatesIn.seasonId !== undefined) updatesToApply.seasonId = updatesIn.seasonId;
    if (updatesIn.seasonalMultiplier !== undefined) updatesToApply.seasonalMultiplier = updatesIn.seasonalMultiplier;


    if (Object.keys(updatesToApply).length === 0) {
        return { success: true, message: "No changes provided." };
    }

    await ctx.db.patch(reservationId, updatesToApply);

    return { success: true, reservationId };
  },
});

// --- DELETE (Soft Delete) ---
export const cancelReservation = mutation({
  args: { reservationId: v.id("reservations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) {
      throw new Error("Reservation not found.");
    }

    // Only the owner of the reservation or an admin may cancel it
    if (user.role !== "admin" && reservation.userId !== user._id) {
      throw new Error("User not authorized to cancel this reservation.");
    }

    if (user.role !== 'admin' && (reservation.status === "completed" || reservation.status === "cancelled")) {
       throw new Error(`Reservation is already ${reservation.status} and cannot be modified by user.`);
    }
    
    // If reservation was "pending" or "confirmed", it can be "cancelled".
    // If it was already "completed", only an admin should be able to change it further (e.g. to "cancelled" for a special case refund)

    await ctx.db.patch(args.reservationId, { status: "cancelled" as ReservationStatusType });

    return { success: true, message: "Reservation cancelled." };
  },
});

// Hard delete (admin-only, use with caution)
export const deleteReservationPermanently = mutation({
  args: { reservationId: v.id("reservations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    if (!user || user.role !== "admin") {
      throw new Error("User not authorized (admin only).");
    }

    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) {
      return { success: true, message: "Reservation not found or already deleted." };
    }

    await ctx.db.delete(args.reservationId);

    return { success: true, message: "Reservation permanently deleted." };
  },
});

// Get reservation statistics for admin dashboard
export const getReservationStats = query({
  args: {},
  returns: v.object({
    totalReservations: v.number(),
    activeReservations: v.number(),
    pendingConfirmations: v.number(),
    currentMonthRevenue: v.number(),
    reservationGrowth: v.number(),
    revenueGrowth: v.number(),
  }),
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    if (user.role !== "admin") {
      throw new Error("User not authorized (admin only).");
    }

    const allReservations = await ctx.db.query("reservations").collect();
    
    const now = Date.now();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonthStart = new Date(currentYear, currentMonth - 1, 1).getTime();
    const currentMonthStart = new Date(currentYear, currentMonth, 1).getTime();
    
    // Total reservations
    const totalReservations = allReservations.length;
    
    // Active reservations (confirmed and currently ongoing)
    const activeReservations = allReservations.filter(r => 
      r.status === "confirmed" && 
      r.startDate <= now && 
      r.endDate >= now
    ).length;
    
    // Pending confirmations
    const pendingConfirmations = allReservations.filter(r => 
      r.status === "pending"
    ).length;
    
    // Current month revenue and reservations
    const currentMonthReservations = allReservations.filter(r => 
      r._creationTime >= currentMonthStart
    );
    const currentMonthRevenue = currentMonthReservations
      .filter(r => r.status === "confirmed" || r.status === "completed")
      .reduce((sum, r) => sum + r.totalPrice, 0);
    
    // Last month revenue for comparison
    const lastMonthReservations = allReservations.filter(r => 
      r._creationTime >= lastMonthStart && r._creationTime < currentMonthStart
    );
    const lastMonthRevenue = lastMonthReservations
      .filter(r => r.status === "confirmed" || r.status === "completed")
      .reduce((sum, r) => sum + r.totalPrice, 0);
    
    // Calculate percentage changes
    const reservationGrowth = lastMonthReservations.length > 0 
      ? ((currentMonthReservations.length - lastMonthReservations.length) / lastMonthReservations.length) * 100
      : 0;
    
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    return {
      totalReservations,
      activeReservations,
      pendingConfirmations,
      currentMonthRevenue,
      reservationGrowth: Math.round(reservationGrowth * 10) / 10, // Round to 1 decimal
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
    };
  },
});

// Get monthly data for charts (last 6 months)
export const getMonthlyChartData = query({
  args: {},
  returns: v.array(v.object({
    month: v.string(),
    reservations: v.number(),
    revenue: v.number(),
  })),
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    if (user.role !== "admin") {
      throw new Error("User not authorized (admin only).");
    }

    const allReservations = await ctx.db.query("reservations").collect();
    
    // Get last 6 months including current month
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = date.getTime();
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
      
      const monthReservations = allReservations.filter(r => 
        r._creationTime >= monthStart && r._creationTime <= monthEnd
      );
      
      const monthRevenue = monthReservations
        .filter(r => r.status === "confirmed" || r.status === "completed")
        .reduce((sum, r) => sum + r.totalPrice, 0);
      
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        reservations: monthReservations.length,
        revenue: Math.round(monthRevenue), // Round to nearest whole number
      });
    }
    
    return months;
  },
});
