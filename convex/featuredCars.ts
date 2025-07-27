import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getCurrentUserOrThrow } from "./users";

// Get all featured cars (max 3, ordered by slot)
export const getFeaturedCars = query({
  args: {},
  handler: async (ctx) => {
    const featuredCars = await ctx.db
      .query("featuredCars")
      .withIndex("by_slot")
      .order("asc")
      .collect();

    // Get vehicle details for each featured car
    const featuredVehicles = [];
    for (const featured of featuredCars) {
      const vehicle = await ctx.db.get(featured.vehicleId);
      if (vehicle) {
        featuredVehicles.push({
          slot: featured.slot,
          vehicle,
          setAt: featured.setAt,
          setBy: featured.setBy,
        });
      }
    }

    return featuredVehicles;
  },
});

// Get featured cars as vehicle objects only (for homepage use)
export const getFeaturedVehicles = query({
  args: {},
  handler: async (ctx) => {
    const featuredCars = await ctx.db
      .query("featuredCars")
      .withIndex("by_slot")
      .order("asc")
      .collect();

    const vehicles = [];
    for (const featured of featuredCars) {
      const vehicle = await ctx.db.get(featured.vehicleId);
      if (vehicle) {
        vehicles.push(vehicle);
      }
    }

    return vehicles;
  },
});

// Set a featured car for a specific slot (1, 2, or 3)
export const setFeaturedCar = mutation({
  args: {
    slot: v.number(),
    vehicleId: v.id("vehicles"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    if (user.role !== "admin") {
      throw new Error("Only admins can set featured cars");
    }

    // Validate slot is between 1 and 3
    if (args.slot < 1 || args.slot > 3) {
      throw new Error("Slot must be between 1 and 3");
    }

    // Check if vehicle exists
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    // Check if this vehicle is already featured in another slot
    const existingFeatured = await ctx.db
      .query("featuredCars")
      .filter((q) => q.eq(q.field("vehicleId"), args.vehicleId))
      .first();

    if (existingFeatured && existingFeatured.slot !== args.slot) {
      throw new Error("This vehicle is already featured in another slot");
    }

    // Check if slot is already occupied
    const existingSlot = await ctx.db
      .query("featuredCars")
      .withIndex("by_slot", (q) => q.eq("slot", args.slot))
      .first();

    if (existingSlot) {
      // Update existing slot
      await ctx.db.patch(existingSlot._id, {
        vehicleId: args.vehicleId,
        setAt: Date.now(),
        setBy: user.name || user.email,
      });
    } else {
      // Create new featured car entry
      await ctx.db.insert("featuredCars", {
        slot: args.slot,
        vehicleId: args.vehicleId,
        setAt: Date.now(),
        setBy: user.name || user.email,
      });
    }

    return { success: true };
  },
});

// Remove a featured car from a specific slot
export const removeFeaturedCar = mutation({
  args: {
    slot: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    if (user.role !== "admin") {
      throw new Error("Only admins can remove featured cars");
    }

    // Validate slot
    if (args.slot < 1 || args.slot > 3) {
      throw new Error("Slot must be between 1 and 3");
    }

    // Find and remove the featured car in this slot
    const existingSlot = await ctx.db
      .query("featuredCars")
      .withIndex("by_slot", (q) => q.eq("slot", args.slot))
      .first();

    if (existingSlot) {
      await ctx.db.delete(existingSlot._id);
    }

    return { success: true };
  },
});

// Get available vehicles that can be featured (excluding already featured ones)
export const getAvailableVehiclesForFeatured = query({
  args: {
    excludeSlot: v.optional(v.number()), // Exclude the current slot's vehicle when editing
  },
  handler: async (ctx, args) => {
    // Get all vehicles
    const allVehicles = await ctx.db.query("vehicles").collect();

    // Get currently featured vehicle IDs
    const featuredCars = await ctx.db.query("featuredCars").collect();
    const featuredVehicleIds = new Set(
      featuredCars
        .filter((featured) => !args.excludeSlot || featured.slot !== args.excludeSlot)
        .map((featured) => featured.vehicleId)
    );

    // Filter out already featured vehicles
    const availableVehicles = allVehicles.filter(
      (vehicle) => !featuredVehicleIds.has(vehicle._id)
    );

    return availableVehicles;
  },
});

// Clear all featured cars (admin utility function)
export const clearAllFeaturedCars = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    if (user.role !== "admin") {
      throw new Error("Only admins can clear featured cars");
    }

    const allFeatured = await ctx.db.query("featuredCars").collect();
    
    for (const featured of allFeatured) {
      await ctx.db.delete(featured._id);
    }

    return { success: true, cleared: allFeatured.length };
  },
}); 