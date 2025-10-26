import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - stores user profiles
  users: defineTable({
    name: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    clerkId: v.string(), // Clerk user ID from the JWT subject
    phone: v.optional(v.string()),
    role: v.union(v.literal("renter"), v.literal("admin")),
    preferences: v.optional(
      v.object({
        language: v.union(v.literal("en"), v.literal("ro")),
        notifications: v.boolean(),
      }),
    ),
  })
    .index("by_email", ["email"])
    .index("by_clerk_id", ["clerkId"]),

  // Vehicles table - stores car inventory
  vehicles: defineTable({
    make: v.string(),
    model: v.string(),
    year: v.optional(v.number()),
    type: v.optional(
      v.union(
        v.literal("sedan"),
        v.literal("suv"),
        v.literal("hatchback"),
        v.literal("sports"),
        v.literal("truck"),
        v.literal("van"),
      ),
    ),
    class: v.optional(
      v.union(
        v.literal("economy"),
        v.literal("van"),
        v.literal("compact"),
        v.literal("intermediate"),
        v.literal("standard"),
        v.literal("business"),
        v.literal("full-size"),
        v.literal("premium"),
        v.literal("luxury"),
        v.literal("sport"),
        v.literal("super-sport"),
        v.literal("supercars"),
        v.literal("executive"),
        v.literal("commercial"),
        v.literal("convertible"),
      ),
    ),
    seats: v.optional(v.number()),
    transmission: v.optional(
      v.union(v.literal("automatic"), v.literal("manual")),
    ),
    fuelType: v.optional(
      v.union(
        v.literal("diesel"),
        v.literal("electric"),
        v.literal("hybrid"),
        v.literal("benzina"),
      ),
    ),
    engineCapacity: v.optional(v.number()),
    engineType: v.optional(v.string()),
    pricePerDay: v.optional(v.number()), // Legacy field - use pricingTiers instead
    pricingTiers: v.optional(
      v.array(
        v.object({
          minDays: v.number(),
          maxDays: v.number(),
          pricePerDay: v.number(),
        }),
      ),
    ),
    warranty: v.optional(v.number()), // Warranty amount for the vehicle
    isOwner: v.optional(v.boolean()), // Whether the car is owned by the company (true) or partnership (false)
    location: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("available"),
      v.literal("rented"),
      v.literal("maintenance"),
    ),
    images: v.optional(v.array(v.id("_storage"))),
    mainImageId: v.optional(v.id("_storage")),
  })
    .index("by_location", ["location"])
    .index("by_type", ["type"])
    .index("by_class", ["class"])
    .index("by_status", ["status"]),

  // Reservations table - stores booking records
  reservations: defineTable({
    reservationNumber: v.optional(v.number()),
    userId: v.optional(v.id("users")),
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
      v.literal("card_online"),
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed"),
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
    additionalCharges: v.optional(
      v.array(
        v.object({
          description: v.string(),
          amount: v.number(),
        }),
      ),
    ),
    // Simple protection fields
    // True if SCDW is selected (zero deductible). False if standard warranty (non-zero deductible).
    isSCDWSelected: v.boolean(),
    // The deductible amount applicable to this reservation.
    // If isSCDWSelected is true, this should be 0. Otherwise, it's the warranty deductible.
    deductibleAmount: v.number(),
    // The cost added to the totalPrice specifically for the chosen protection (warranty or SCDW)
    protectionCost: v.optional(v.number()),
    // Seasonal pricing tracking
    // Store the season ID that was active when this reservation was created
    seasonId: v.optional(v.id("seasons")),
    // Store the multiplier that was applied (for historical accuracy even if season changes)
    seasonalMultiplier: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
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
      v.literal("refunded"),
    ),
    paymentMethod: v.string(),
    refundAmount: v.optional(v.number()),
  })
    .index("by_reservation", ["reservationId"])
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
  })
    .index("by_code", ["code"])
    .index("by_active", ["active"]),

  // Email logs table - tracks sent emails
  emailLogs: defineTable({
    type: v.union(
      v.literal("confirmation"),
      v.literal("reminder"),
      v.literal("receipt"),
      v.literal("cancellation"),
    ),
    userId: v.id("users"),
    reservationId: v.optional(v.id("reservations")),
    sentAt: v.number(),
    status: v.union(v.literal("sent"), v.literal("failed")),
    error: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_reservation", ["reservationId"]),

  // Seasons table - defines seasonal pricing multipliers and their periods
  seasons: defineTable({
    name: v.string(), // "High Season", "Low Season", "Holiday Season", "Extra Season"
    description: v.optional(v.string()), // "Summer and holiday pricing"
    multiplier: v.number(), // 1.35, 1.5, 0.8, etc.
    periods: v.array(
      v.object({
        startDate: v.string(), // ISO date string "2024-06-01"
        endDate: v.string(), // ISO date string "2024-07-30"
        description: v.optional(v.string()), // "Summer period", "Easter week", "New Year period"
      }),
    ),
    isActive: v.boolean(), // whether this season type is enabled for selection
  }).index("by_active", ["isActive"]),

  // Current season table - tracks the currently active season
  currentSeason: defineTable({
    seasonId: v.id("seasons"),
    setAt: v.number(), // timestamp when this season was activated
    setBy: v.optional(v.string()), // admin user ID or name who set it (for tracking)
  }),

  // Featured cars table - stores the 3 featured vehicles for homepage display
  featuredCars: defineTable({
    slot: v.number(), // 1, 2, or 3 - the position slot for the featured car
    vehicleId: v.id("vehicles"),
    setAt: v.number(), // timestamp when this featured car was set
    setBy: v.optional(v.string()), // admin user ID or name who set it (for tracking)
  }).index("by_slot", ["slot"]),
});
