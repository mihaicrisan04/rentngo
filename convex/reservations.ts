import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { getCurrentUser, getCurrentUserOrThrow } from "./users";

// Validator for reservation status, strictly aligned with schema.ts
const reservationStatusValidator = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("cancelled"),
  v.literal("completed")
);

// Explicit type for ReservationStatus based on the schema
type ReservationStatusType = "pending" | "confirmed" | "cancelled" | "completed";

// Flight number validation function
const validateFlightNumber = (flightNumber: string): boolean => {
  if (!flightNumber || !flightNumber.trim()) {
    return true; // Optional field
  }
  // Format: Two letter airline code followed by a space and then numbers
  // Examples: "AA 1234", "LH 456", "BA 2847"
  const flightNumberRegex = /^[A-Z]{2}\s\d+$/;
  return flightNumberRegex.test(flightNumber.trim());
};

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
  },
  handler: async (ctx, args) => {
    // Get the current authenticated user (if any)
    const currentUser = await getCurrentUser(ctx);

    // Validate flight number format if provided
    if (args.customerInfo.flightNumber && !validateFlightNumber(args.customerInfo.flightNumber)) {
      throw new Error("Invalid flight number format. Please use format: 'XX 1234' (two letter airline code, space, then numbers)");
    }

    // TODO: Implement robust availability check for the vehicle.
    // This should query reservations using the 'by_vehicle' and/or 'by_dates' index
    // to ensure no conflicting bookings for the given vehicleId and date range.
    // e.g., check if any existing reservation for this vehicle overlaps with [args.startDate, args.endDate)
    // const overlappingReservations = await ctx.db.query("reservations")
    //   .withIndex("by_vehicle", q => q.eq("vehicleId", args.vehicleId))
    //   .filter(q => q.and(q.lt(q.field("startDate"), args.endDate), q.gt(q.field("endDate"), args.startDate)))
    //   .collect();
    // if (overlappingReservations.length > 0) {
    //   throw new Error("Vehicle not available for the selected dates.");
    // }

    const newReservationData = {
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
      totalPrice: args.totalPrice,
      customerInfo: args.customerInfo,
      promoCode: args.promoCode,
      additionalCharges: args.additionalCharges,
    };

    const reservationId = await ctx.db.insert("reservations", newReservationData);

    // TODO (Post-payment/confirmation flow):
    // 1. Update reservation status to "confirmed" (e.g., via a Stripe webhook handler).
    // 2. Trigger a "confirmation" email to the user using Resend.
    //    Example: await ctx.runAction(api.emails.sendBookingConfirmation, { reservationId });

    return reservationId;
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
    // This query can be public for availability, or admin-only.
    // Add auth checks if needed.
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

    // TODO: Trigger emails/notifications based on status change
    return { success: true };
  },
});

export const updateReservationDetails = mutation({
  args: {
    reservationId: v.id("reservations"),
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

    // Validate flight number format if provided in customerInfo update
    if (updatesIn.customerInfo?.flightNumber && !validateFlightNumber(updatesIn.customerInfo.flightNumber)) {
      throw new Error("Invalid flight number format. Please use format: 'XX 1234' (two letter airline code, space, then numbers)");
    }

    // TODO: If startDate or endDate are changing, re-run availability checks.

    // Construct the updates object carefully to pass to patch
    const updatesToApply: Partial<typeof reservation> = {};
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


    if (Object.keys(updatesToApply).length === 0) {
        return { success: true, message: "No changes provided." };
    }

    await ctx.db.patch(reservationId, updatesToApply);
    
    // TODO: If critical details change, send an update email.
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

    if (user.role !== 'admin' && (reservation.status === "completed" || reservation.status === "cancelled")) {
       throw new Error(`Reservation is already ${reservation.status} and cannot be modified by user.`);
    }
    
    // If reservation was "pending" or "confirmed", it can be "cancelled".
    // If it was already "completed", only an admin should be able to change it further (e.g. to "cancelled" for a special case refund)

    await ctx.db.patch(args.reservationId, { status: "cancelled" as ReservationStatusType });

    // TODO: Trigger refund process via Stripe if applicable (if status was "confirmed" and payment made).
    // TODO: Send cancellation confirmation email via Resend.
    //       Example: await ctx.runAction(api.emails.sendBookingCancellation, { reservationId });

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
    // TODO: Consider cascading deletes or cleanup in related tables if necessary,
    // though typically Stripe and Resend logs would be kept.
    return { success: true, message: "Reservation permanently deleted." };
  },
});
