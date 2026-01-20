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
    classId: v.optional(v.id("vehicleClasses")), // Reference to vehicle class
    classSortIndex: v.optional(v.number()), // For custom sorting within a class (future feature)
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
    // Transfer-related fields
    isTransferVehicle: v.optional(v.boolean()), // Whether this vehicle is available for transfers
    transferPricePerKm: v.optional(v.number()), // Price per kilometer for transfers in EUR
    // SEO-friendly URL slug
    slug: v.optional(v.string()), // URL slug for car detail pages (e.g., "bmw-x5-2024")
  })
    .index("by_location", ["location"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_transfer", ["isTransferVehicle"])
    .index("by_slug", ["slug"]),

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

  // Transfers table - stores VIP transfer bookings
  transfers: defineTable({
    transferNumber: v.optional(v.number()),
    userId: v.optional(v.id("users")),
    vehicleId: v.id("vehicles"),

    // Transfer type
    transferType: v.union(v.literal("one_way"), v.literal("round_trip")),

    // Pickup details
    pickupLocation: v.object({
      address: v.string(),
      coordinates: v.object({
        lng: v.number(),
        lat: v.number(),
      }),
    }),
    pickupDate: v.number(), // Unix timestamp
    pickupTime: v.string(), // Time in "HH:MM" format

    // Dropoff details
    dropoffLocation: v.object({
      address: v.string(),
      coordinates: v.object({
        lng: v.number(),
        lat: v.number(),
      }),
    }),

    // Return trip (for round_trip type only)
    returnDate: v.optional(v.number()), // Unix timestamp
    returnTime: v.optional(v.string()), // Time in "HH:MM" format

    // Trip info
    passengers: v.number(),
    luggageCount: v.optional(v.number()), // Number of medium-size luggage items
    distanceKm: v.number(),
    estimatedDurationMinutes: v.number(),

    // Pricing
    baseFare: v.number(), // Minimum fare
    distancePrice: v.number(), // Price calculated from distance
    totalPrice: v.number(),
    pricePerKm: v.number(), // Rate used for this booking

    // Customer information
    customerInfo: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      message: v.optional(v.string()),
      flightNumber: v.optional(v.string()),
    }),

    // Payment
    paymentMethod: v.union(
      v.literal("cash_on_delivery"),
      v.literal("card_on_delivery"),
      v.literal("card_online"),
    ),

    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed"),
    ),
  })
    .index("by_user", ["userId"])
    .index("by_vehicle", ["vehicleId"])
    .index("by_pickup_date", ["pickupDate"])
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

  // Vehicle classes table - stores vehicle class definitions for categorization
  vehicleClasses: defineTable({
    name: v.string(), // The class name (e.g., "Economy", "Luxury")
    displayName: v.optional(v.string()), // For localization/display purposes
    description: v.optional(v.string()), // Description of the class
    sortIndex: v.number(), // For custom sorting of classes
    isActive: v.boolean(), // Whether this class is active/visible
    additional50kmPrice: v.optional(v.number()), // Price per extra 50km package in EUR
    transferBaseFare: v.optional(v.number()), // Base fare for transfers in EUR
    transferMultiplier: v.optional(v.number()), // Multiplier for transfer pricing (e.g., 1.0, 1.2, 1.5)
  })
    .index("by_active", ["isActive"])
    .index("by_sort_index", ["sortIndex"])
    .index("by_name", ["name"]),

  // Transfer pricing tiers table - global admin-editable km-range pricing tiers
  transferPricingTiers: defineTable({
    minExtraKm: v.number(), // Min extra km (after 15km base)
    maxExtraKm: v.optional(v.number()), // Max extra km (null = unlimited)
    pricePerKm: v.number(), // Price in EUR (e.g., 1.60, 1.20)
    sortIndex: v.number(), // For ordering
    isActive: v.boolean(), // Whether this tier is active
  }).index("by_sort_index", ["sortIndex"]),

  // Blogs table - stores blog posts
  blogs: defineTable({
    title: v.string(),
    slug: v.string(), // URL-safe slug
    author: v.string(),
    description: v.string(), // Short excerpt/description
    content: v.string(), // MDX content as string
    coverImage: v.optional(v.id("_storage")), // Main cover image
    images: v.optional(v.array(v.id("_storage"))), // Additional blog images
    tags: v.optional(v.array(v.string())), // Blog categories/tags
    publishedAt: v.optional(v.number()), // Publish timestamp
    status: v.union(v.literal("draft"), v.literal("published")),
    readingTime: v.optional(v.number()), // Estimated reading time in minutes
    views: v.optional(v.number()), // View count
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_published_at", ["publishedAt"]),
});
