import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get all seasons
export const getAll = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("seasons"),
    _creationTime: v.number(),
    name: v.string(),
    description: v.optional(v.string()),
    multiplier: v.number(),
    periods: v.array(v.object({
      startDate: v.string(),
      endDate: v.string(),
      description: v.optional(v.string())
    })),
    isActive: v.boolean(),
  })),
  handler: async (ctx) => {
    return await ctx.db.query("seasons").order("desc").collect();
  },
});

// Get active seasons only
export const getActive = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("seasons"),
    _creationTime: v.number(),
    name: v.string(),
    description: v.optional(v.string()),
    multiplier: v.number(),
    periods: v.array(v.object({
      startDate: v.string(),
      endDate: v.string(),
      description: v.optional(v.string())
    })),
    isActive: v.boolean(),
  })),
  handler: async (ctx) => {
    return await ctx.db
      .query("seasons")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("desc")
      .collect();
  },
});

// Get current season
export const getCurrent = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("currentSeason"),
      _creationTime: v.number(),
      seasonId: v.id("seasons"),
      setAt: v.number(),
      setBy: v.optional(v.string()),
      season: v.object({
        _id: v.id("seasons"),
        _creationTime: v.number(),
        name: v.string(),
        description: v.optional(v.string()),
        multiplier: v.number(),
        periods: v.array(v.object({
          startDate: v.string(),
          endDate: v.string(),
          description: v.optional(v.string())
        })),
        isActive: v.boolean(),
      }),
    })
  ),
  handler: async (ctx) => {
    const currentSeason = await ctx.db.query("currentSeason").first();
    if (!currentSeason) return null;

    const season = await ctx.db.get(currentSeason.seasonId);
    if (!season) return null;

    return {
      ...currentSeason,
      season,
    };
  },
});

// Get current season multiplier (most commonly used)
export const getCurrentMultiplier = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const currentSeason = await ctx.db.query("currentSeason").first();
    if (!currentSeason) return 1.0; // Default multiplier when no season is active

    const season = await ctx.db.get(currentSeason.seasonId);
    if (!season || !season.isActive) return 1.0;

    return season.multiplier;
  },
});

// Create a new season
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    multiplier: v.number(),
    periods: v.array(v.object({
      startDate: v.string(),
      endDate: v.string(),
      description: v.optional(v.string())
    })),
    isActive: v.optional(v.boolean()),
  },
  returns: v.id("seasons"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("seasons", {
      name: args.name,
      description: args.description,
      multiplier: args.multiplier,
      periods: args.periods,
      isActive: args.isActive ?? true,
    });
  },
});

// Update a season
export const update = mutation({
  args: {
    id: v.id("seasons"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    multiplier: v.optional(v.number()),
    periods: v.optional(v.array(v.object({
      startDate: v.string(),
      endDate: v.string(),
      description: v.optional(v.string())
    }))),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(id, cleanUpdates);
    return null;
  },
});

// Set current season
export const setCurrent = mutation({
  args: {
    seasonId: v.id("seasons"),
    setBy: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Verify the season exists and is active
    const season = await ctx.db.get(args.seasonId);
    if (!season) {
      throw new Error("Season not found");
    }
    if (!season.isActive) {
      throw new Error("Cannot set inactive season as current");
    }

    // Remove any existing current season
    const existingCurrent = await ctx.db.query("currentSeason").first();
    if (existingCurrent) {
      await ctx.db.delete(existingCurrent._id);
    }

    // Set new current season
    await ctx.db.insert("currentSeason", {
      seasonId: args.seasonId,
      setAt: Date.now(),
      setBy: args.setBy,
    });

    return null;
  },
});

// Clear current season (revert to base pricing)
export const clearCurrent = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const currentSeason = await ctx.db.query("currentSeason").first();
    if (currentSeason) {
      await ctx.db.delete(currentSeason._id);
    }
    return null;
  },
});

// Delete a season
export const deleteSeason = mutation({
  args: {
    id: v.id("seasons"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Check if this season is currently active
    const currentSeason = await ctx.db.query("currentSeason").first();
    if (currentSeason && currentSeason.seasonId === args.id) {
      throw new Error("Cannot delete the currently active season. Please set a different season first.");
    }

    await ctx.db.delete(args.id);
    return null;
  },
});

// Helper function to check if a date falls within any season period
export const isDateInSeason = internalQuery({
  args: {
    seasonId: v.id("seasons"),
    date: v.string(), // ISO date string "2024-06-15"
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const season = await ctx.db.get(args.seasonId);
    if (!season) return false;

    const checkDate = new Date(args.date);
    
    return season.periods.some(period => {
      const startDate = new Date(period.startDate);
      const endDate = new Date(period.endDate);
      return checkDate >= startDate && checkDate <= endDate;
    });
  },
}); 