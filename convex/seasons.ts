import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get all seasons
export const getAll = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("seasons"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      multiplier: v.number(),
      periods: v.array(
        v.object({
          startDate: v.string(),
          endDate: v.string(),
          description: v.optional(v.string()),
        }),
      ),
      isActive: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db.query("seasons").order("desc").collect();
  },
});

// Get season by ID
export const getById = query({
  args: { id: v.id("seasons") },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("seasons"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      multiplier: v.number(),
      periods: v.array(
        v.object({
          startDate: v.string(),
          endDate: v.string(),
          description: v.optional(v.string()),
        }),
      ),
      isActive: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get active seasons only
export const getActive = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("seasons"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      multiplier: v.number(),
      periods: v.array(
        v.object({
          startDate: v.string(),
          endDate: v.string(),
          description: v.optional(v.string()),
        }),
      ),
      isActive: v.boolean(),
    }),
  ),
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
        periods: v.array(
          v.object({
            startDate: v.string(),
            endDate: v.string(),
            description: v.optional(v.string()),
          }),
        ),
        isActive: v.boolean(),
      }),
    }),
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

// Get multiplier for a specific date range based on seasonal period overlap
export const getMultiplierForDateRange = query({
  args: {
    startDateStr: v.string(), // "YYYY-MM-DD" format
    endDateStr: v.string(), // "YYYY-MM-DD" format
  },
  returns: v.object({
    multiplier: v.number(),
    seasonId: v.optional(v.id("seasons")),
    seasonName: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    // Get all active seasons
    const activeSeasons = await ctx.db
      .query("seasons")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    if (activeSeasons.length === 0) {
      // Fall back to current season
      const currentSeason = await ctx.db.query("currentSeason").first();
      if (currentSeason) {
        const season = await ctx.db.get(currentSeason.seasonId);
        if (season && season.isActive) {
          return {
            multiplier: season.multiplier,
            seasonId: season._id,
            seasonName: season.name,
          };
        }
      }
      return { multiplier: 1.0 };
    }

    // Helper to parse date string "YYYY-MM-DD" to comparable number YYYYMMDD
    const dateToNumber = (dateStr: string): number => {
      const [year, month, day] = dateStr.split("-");
      return parseInt(year) * 10000 + parseInt(month) * 100 + parseInt(day);
    };

    // Helper to add days to a date string (purely string-based)
    const addDays = (dateStr: string, days: number): string => {
      const [year, month, day] = dateStr.split("-").map(Number);
      // Create date at noon to avoid DST issues, but we only care about the date part
      const date = new Date(year, month - 1, day, 12, 0, 0);
      date.setDate(date.getDate() + days);

      const newYear = date.getFullYear();
      const newMonth = String(date.getMonth() + 1).padStart(2, "0");
      const newDay = String(date.getDate()).padStart(2, "0");
      return `${newYear}-${newMonth}-${newDay}`;
    };

    // Helper to generate all dates in range (string-based, timezone-safe)
    const getDatesInRange = (startStr: string, endStr: string): string[] => {
      const dates: string[] = [];
      const startNum = dateToNumber(startStr);
      const endNum = dateToNumber(endStr);

      if (startNum > endNum) {
        return dates; // Invalid range
      }

      let currentDate = startStr;
      dates.push(currentDate);

      while (dateToNumber(currentDate) < endNum) {
        currentDate = addDays(currentDate, 1);
        dates.push(currentDate);
      }

      return dates;
    };

    // Helper to check if a date (MM-DD) falls within a period (handles year-spanning)
    const isDateInPeriod = (
      dateStr: string,
      periodStart: string,
      periodEnd: string,
    ): boolean => {
      const date = dateStr.substring(5); // Extract MM-DD
      const start = periodStart.substring(5); // Extract MM-DD
      const end = periodEnd.substring(5); // Extract MM-DD

      if (start <= end) {
        // Period within same year (e.g., "06-01" to "09-30")
        return date >= start && date <= end;
      } else {
        // Period spans year boundary (e.g., "12-15" to "01-05")
        return date >= start || date <= end;
      }
    };

    const rentalDates = getDatesInRange(args.startDateStr, args.endDateStr);
    const seasonOverlaps = new Map<string, number>();

    // For each active season, count how many rental days fall within its periods
    for (const season of activeSeasons) {
      let totalOverlap = 0;

      for (const rentalDate of rentalDates) {
        for (const period of season.periods) {
          if (isDateInPeriod(rentalDate, period.startDate, period.endDate)) {
            totalOverlap++;
            break; // Count each rental day only once per season
          }
        }
      }

      if (totalOverlap > 0) {
        seasonOverlaps.set(season._id, totalOverlap);
      }
    }

    // Find season with most overlap
    if (seasonOverlaps.size > 0) {
      let maxSeasonId: string | null = null;
      let maxOverlap = 0;

      for (const [seasonId, overlap] of seasonOverlaps.entries()) {
        if (overlap > maxOverlap) {
          maxOverlap = overlap;
          maxSeasonId = seasonId;
        }
      }

      if (maxSeasonId) {
        const winningSeason = await ctx.db.get(maxSeasonId as Id<"seasons">);
        if (winningSeason) {
          return {
            multiplier: winningSeason.multiplier,
            seasonId: winningSeason._id,
            seasonName: winningSeason.name,
          };
        }
      }
    }

    // No overlap found, fall back to current season
    const currentSeason = await ctx.db.query("currentSeason").first();
    if (currentSeason) {
      const season = await ctx.db.get(currentSeason.seasonId);
      if (season && season.isActive) {
        return {
          multiplier: season.multiplier,
          seasonId: season._id,
          seasonName: season.name,
        };
      }
    }

    // Default to 1.0 if no season matches
    return { multiplier: 1.0 };
  },
});

// Create a new season
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    multiplier: v.number(),
    periods: v.array(
      v.object({
        startDate: v.string(),
        endDate: v.string(),
        description: v.optional(v.string()),
      }),
    ),
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
    periods: v.optional(
      v.array(
        v.object({
          startDate: v.string(),
          endDate: v.string(),
          description: v.optional(v.string()),
        }),
      ),
    ),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined),
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
      throw new Error(
        "Cannot delete the currently active season. Please set a different season first.",
      );
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

    return season.periods.some((period) => {
      const startDate = new Date(period.startDate);
      const endDate = new Date(period.endDate);
      return checkDate >= startDate && checkDate <= endDate;
    });
  },
});
