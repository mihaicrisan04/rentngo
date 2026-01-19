import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const BASE_KM_INCLUDED = 15; // First 15km included in base fare
const DEFAULT_BASE_FARE = 25;
const DEFAULT_MULTIPLIER = 1.0;
const DEFAULT_PRICE_PER_KM = 1.0; // Fallback when no tier matches

// Query: List all active pricing tiers (sorted by minExtraKm)
export const listTiers = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id("transferPricingTiers"),
      _creationTime: v.number(),
      minExtraKm: v.number(),
      maxExtraKm: v.optional(v.number()),
      pricePerKm: v.number(),
      sortIndex: v.number(),
      isActive: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    const { activeOnly = true } = args;

    const tiers = await ctx.db
      .query("transferPricingTiers")
      .withIndex("by_sort_index")
      .collect();

    const filteredTiers = activeOnly
      ? tiers.filter((t) => t.isActive)
      : tiers;

    return filteredTiers.sort((a, b) => a.minExtraKm - b.minExtraKm);
  },
});

// Query: Get a single tier by ID
export const getTierById = query({
  args: {
    id: v.id("transferPricingTiers"),
  },
  returns: v.union(
    v.object({
      _id: v.id("transferPricingTiers"),
      _creationTime: v.number(),
      minExtraKm: v.number(),
      maxExtraKm: v.optional(v.number()),
      pricePerKm: v.number(),
      sortIndex: v.number(),
      isActive: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Mutation: Create a new pricing tier
export const createTier = mutation({
  args: {
    minExtraKm: v.number(),
    maxExtraKm: v.optional(v.number()),
    pricePerKm: v.number(),
    isActive: v.optional(v.boolean()),
  },
  returns: v.id("transferPricingTiers"),
  handler: async (ctx, args) => {
    const { minExtraKm, maxExtraKm, pricePerKm, isActive = true } = args;

    // Validate range
    if (maxExtraKm !== undefined && maxExtraKm <= minExtraKm) {
      throw new Error("Max KM must be greater than Min KM");
    }

    if (pricePerKm <= 0) {
      throw new Error("Price per KM must be positive");
    }

    // Get existing tiers to check for overlaps and determine sortIndex
    const existingTiers = await ctx.db.query("transferPricingTiers").collect();

    // Check for overlapping ranges
    for (const tier of existingTiers) {
      const tierMax = tier.maxExtraKm ?? Infinity;
      const newMax = maxExtraKm ?? Infinity;

      // Check if ranges overlap
      const overlap =
        minExtraKm < tierMax && newMax > tier.minExtraKm;

      if (overlap) {
        throw new Error(
          `Range ${minExtraKm}-${maxExtraKm ?? "∞"} overlaps with existing tier ${tier.minExtraKm}-${tier.maxExtraKm ?? "∞"}`,
        );
      }
    }

    // Calculate sortIndex
    const maxSortIndex =
      existingTiers.length > 0
        ? Math.max(...existingTiers.map((t) => t.sortIndex))
        : -1;

    const tierId = await ctx.db.insert("transferPricingTiers", {
      minExtraKm,
      maxExtraKm,
      pricePerKm,
      sortIndex: maxSortIndex + 1,
      isActive,
    });

    return tierId;
  },
});

// Mutation: Update an existing pricing tier
export const updateTier = mutation({
  args: {
    id: v.id("transferPricingTiers"),
    minExtraKm: v.optional(v.number()),
    maxExtraKm: v.optional(v.number()),
    pricePerKm: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, minExtraKm, maxExtraKm, pricePerKm, isActive } = args;

    const existingTier = await ctx.db.get(id);
    if (!existingTier) {
      throw new Error("Tier not found");
    }

    const newMin = minExtraKm ?? existingTier.minExtraKm;
    const newMax = maxExtraKm !== undefined ? maxExtraKm : existingTier.maxExtraKm;

    // Validate range
    if (newMax !== undefined && newMax <= newMin) {
      throw new Error("Max KM must be greater than Min KM");
    }

    if (pricePerKm !== undefined && pricePerKm <= 0) {
      throw new Error("Price per KM must be positive");
    }

    // Check for overlapping ranges with other tiers
    if (minExtraKm !== undefined || maxExtraKm !== undefined) {
      const allTiers = await ctx.db.query("transferPricingTiers").collect();

      for (const tier of allTiers) {
        if (tier._id === id) continue; // Skip self

        const tierMax = tier.maxExtraKm ?? Infinity;
        const checkMax = newMax ?? Infinity;

        const overlap = newMin < tierMax && checkMax > tier.minExtraKm;

        if (overlap) {
          throw new Error(
            `Range ${newMin}-${newMax ?? "∞"} overlaps with existing tier ${tier.minExtraKm}-${tier.maxExtraKm ?? "∞"}`,
          );
        }
      }
    }

    // Build update object
    const updates: Record<string, number | boolean | undefined> = {};
    if (minExtraKm !== undefined) updates.minExtraKm = minExtraKm;
    if (maxExtraKm !== undefined) updates.maxExtraKm = maxExtraKm;
    if (pricePerKm !== undefined) updates.pricePerKm = pricePerKm;
    if (isActive !== undefined) updates.isActive = isActive;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(id, updates);
    }

    return null;
  },
});

// Mutation: Delete a pricing tier
export const deleteTier = mutation({
  args: {
    id: v.id("transferPricingTiers"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const tier = await ctx.db.get(args.id);
    if (!tier) {
      throw new Error("Tier not found");
    }

    await ctx.db.delete(args.id);
    return null;
  },
});

// Query: Calculate transfer price server-side
export const calculateTransferPrice = query({
  args: {
    distanceKm: v.number(),
    classId: v.id("vehicleClasses"),
    transferType: v.union(v.literal("one_way"), v.literal("round_trip")),
  },
  returns: v.object({
    baseFare: v.number(),
    extraKm: v.number(),
    distanceCharge: v.number(),
    totalPrice: v.number(),
    tierPricePerKm: v.number(),
  }),
  handler: async (ctx, args) => {
    // 1. Get vehicle class for base_fare and multiplier
    const vehicleClass = await ctx.db.get(args.classId);
    const baseFare = vehicleClass?.transferBaseFare ?? DEFAULT_BASE_FARE;
    const classMultiplier = vehicleClass?.transferMultiplier ?? DEFAULT_MULTIPLIER;

    // 2. Calculate extra km (after first 15km)
    const extraKm = Math.max(args.distanceKm - BASE_KM_INCLUDED, 0);

    // 3. If no extra km, return base fare only
    if (extraKm === 0) {
      const total = args.transferType === "round_trip" ? baseFare * 2 : baseFare;
      return {
        baseFare,
        extraKm: 0,
        distanceCharge: 0,
        totalPrice: Math.round(total * 100) / 100,
        tierPricePerKm: 0,
      };
    }

    // 4. Get applicable tier based on extra km
    const tiers = await ctx.db
      .query("transferPricingTiers")
      .collect();

    const activeTiers = tiers.filter((t) => t.isActive);

    // Find the tier that matches the extra km range
    const tier = activeTiers.find(
      (t) =>
        extraKm >= t.minExtraKm &&
        (t.maxExtraKm === undefined || extraKm < t.maxExtraKm),
    );

    const tierPricePerKm = tier?.pricePerKm ?? DEFAULT_PRICE_PER_KM;

    // 5. Calculate distance charge: extraKm * tierPrice * classMultiplier
    const distanceCharge = extraKm * tierPricePerKm * classMultiplier;

    // 6. Calculate total
    let totalPrice = baseFare + distanceCharge;
    if (args.transferType === "round_trip") {
      totalPrice *= 2;
    }

    return {
      baseFare,
      extraKm,
      distanceCharge: Math.round(distanceCharge * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
      tierPricePerKm,
    };
  },
});

// Query: Calculate transfer price by vehicleId (for booking page)
export const calculateTransferPriceByVehicle = query({
  args: {
    distanceKm: v.number(),
    vehicleId: v.id("vehicles"),
    transferType: v.union(v.literal("one_way"), v.literal("round_trip")),
  },
  returns: v.object({
    baseFare: v.number(),
    extraKm: v.number(),
    distanceCharge: v.number(),
    totalPrice: v.number(),
    tierPricePerKm: v.number(),
  }),
  handler: async (ctx, args) => {
    // 1. Get vehicle and its class
    const vehicle = await ctx.db.get(args.vehicleId);
    const classId = vehicle?.classId;

    let baseFare = DEFAULT_BASE_FARE;
    let classMultiplier = DEFAULT_MULTIPLIER;

    if (classId) {
      const vehicleClass = await ctx.db.get(classId);
      baseFare = vehicleClass?.transferBaseFare ?? DEFAULT_BASE_FARE;
      classMultiplier = vehicleClass?.transferMultiplier ?? DEFAULT_MULTIPLIER;
    }

    // 2. Calculate extra km (after first 15km)
    const extraKm = Math.max(args.distanceKm - BASE_KM_INCLUDED, 0);

    // 3. If no extra km, return base fare only
    if (extraKm === 0) {
      const total = args.transferType === "round_trip" ? baseFare * 2 : baseFare;
      return {
        baseFare,
        extraKm: 0,
        distanceCharge: 0,
        totalPrice: Math.round(total * 100) / 100,
        tierPricePerKm: 0,
      };
    }

    // 4. Get applicable tier based on extra km
    const tiers = await ctx.db
      .query("transferPricingTiers")
      .collect();

    const activeTiers = tiers.filter((t) => t.isActive);

    // Find the tier that matches the extra km range
    const tier = activeTiers.find(
      (t) =>
        extraKm >= t.minExtraKm &&
        (t.maxExtraKm === undefined || extraKm < t.maxExtraKm),
    );

    const tierPricePerKm = tier?.pricePerKm ?? DEFAULT_PRICE_PER_KM;

    // 5. Calculate distance charge: extraKm * tierPrice * classMultiplier
    const distanceCharge = extraKm * tierPricePerKm * classMultiplier;

    // 6. Calculate total
    let totalPrice = baseFare + distanceCharge;
    if (args.transferType === "round_trip") {
      totalPrice *= 2;
    }

    return {
      baseFare,
      extraKm,
      distanceCharge: Math.round(distanceCharge * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
      tierPricePerKm,
    };
  },
});

// Mutation: Seed default pricing tiers (for initial setup)
export const seedDefaultTiers = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Check if tiers already exist
    const existingTiers = await ctx.db.query("transferPricingTiers").collect();
    if (existingTiers.length > 0) {
      throw new Error("Pricing tiers already exist. Delete them first to reseed.");
    }

    // Default tiers as specified in the plan
    const defaultTiers = [
      { minExtraKm: 0, maxExtraKm: 25, pricePerKm: 1.6, sortIndex: 0 },
      { minExtraKm: 25, maxExtraKm: 65, pricePerKm: 1.2, sortIndex: 1 },
      { minExtraKm: 65, maxExtraKm: 185, pricePerKm: 1.0, sortIndex: 2 },
      { minExtraKm: 185, maxExtraKm: 285, pricePerKm: 0.97, sortIndex: 3 },
      { minExtraKm: 285, maxExtraKm: 385, pricePerKm: 0.95, sortIndex: 4 },
      { minExtraKm: 385, maxExtraKm: undefined, pricePerKm: 0.9, sortIndex: 5 },
    ];

    for (const tier of defaultTiers) {
      await ctx.db.insert("transferPricingTiers", {
        ...tier,
        isActive: true,
      });
    }

    return null;
  },
});
