import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - stores user profiles
  users: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    role: v.union(v.literal("renter"), v.literal("admin")),
    preferences: v.optional(v.object({
      language: v.union(v.literal("en"), v.literal("ro")),
      notifications: v.boolean(),
    })),
  }).index("by_email", ["email"]),

  // Vehicles table - stores car inventory
  vehicles: defineTable({
    make: v.string(),
    model: v.string(),
    year: v.optional(v.number()),
    type: v.optional(v.union(v.literal("sedan"), v.literal("suv"), v.literal("hatchback"), v.literal("sports"), v.literal("truck"), v.literal("van"))),
    seats: v.optional(v.number()),
    transmission: v.optional(v.union(v.literal("automatic"), v.literal("manual"))),
    fuelType: v.optional(v.union(v.literal("petrol"), v.literal("diesel"), v.literal("electric"), v.literal("hybrid"), v.literal("benzina"))),
    engineCapacity: v.optional(v.number()),
    engineType: v.optional(v.string()),
    pricePerDay: v.number(),
    location: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    status: v.union(v.literal("available"), v.literal("rented"), v.literal("maintenance")),
    images: v.optional(v.array(v.id("_storage"))),
    mainImageId: v.optional(v.id("_storage")),
  }).index("by_location", ["location"])
    .index("by_type", ["type"])
    .index("by_status", ["status"]),

  // Reservations table - stores booking records
  reservations: defineTable({
    userId: v.id("users"),
    vehicleId: v.id("vehicles"),
    startDate: v.number(), // Unix timestamp
    endDate: v.number(), // Unix timestamp
    pickupTime: v.string(), // Time in "HH:MM" format (e.g., "14:30")
    restitutionTime: v.string(), // Time in "HH:MM" format (e.g., "16:00")
    pickupLocation: v.string(), // Name of pickup location
    restitutionLocation: v.string(), // Name of return location
    paymentMethod: v.union(
      v.literal("cash_on_delivery"),
      v.literal("card_on_delivery"),
      v.literal("card_online")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
    totalPrice: v.number(),
    // Customer information (for non-authenticated or guest bookings)
    customerInfo: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      message: v.optional(v.string()),
      flightNumber: v.optional(v.string()), // Format: "XX 1234" (airline code + space + number)
    }),
    promoCode: v.optional(v.string()),
    // Store any additional charges or fees (delivery fees, extras, etc.)
    additionalCharges: v.optional(v.array(v.object({
      description: v.string(),
      amount: v.number(),
    }))),
  }).index("by_user", ["userId"])
    .index("by_vehicle", ["vehicleId"])
    .index("by_dates", ["startDate", "endDate"])
    .index("by_pickup_location", ["pickupLocation"])
    .index("by_restitution_location", ["restitutionLocation"])
    .index("by_payment_method", ["paymentMethod"]),

  // Payments table - stores payment records
  payments: defineTable({
    reservationId: v.id("reservations"),
    stripePaymentId: v.string(),
    amount: v.number(),
    currency: v.literal("RON"),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    paymentMethod: v.string(),
    refundAmount: v.optional(v.number()),
  }).index("by_reservation", ["reservationId"])
    .index("by_status", ["status"]),

  // Promotions table - stores discount codes
  promotions: defineTable({
    code: v.string(),
    type: v.union(v.literal("percentage"), v.literal("fixed")),
    value: v.number(), // percentage or fixed amount
    expiryDate: v.number(), // Unix timestamp
    usageCount: v.number(),
    maxUsage: v.optional(v.number()),
    active: v.boolean(),
  }).index("by_code", ["code"])
    .index("by_active", ["active"]),

  // Email logs table - tracks sent emails
  emailLogs: defineTable({
    type: v.union(
      v.literal("confirmation"),
      v.literal("reminder"),
      v.literal("receipt"),
      v.literal("cancellation")
    ),
    userId: v.id("users"),
    reservationId: v.optional(v.id("reservations")),
    sentAt: v.number(),
    status: v.union(v.literal("sent"), v.literal("failed")),
    error: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_reservation", ["reservationId"]),
});