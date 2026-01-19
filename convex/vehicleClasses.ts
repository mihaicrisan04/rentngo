import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

// Query: Get all vehicle classes
export const list = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id("vehicleClasses"),
      _creationTime: v.number(),
      name: v.string(),
      displayName: v.optional(v.string()),
      description: v.optional(v.string()),
      sortIndex: v.number(),
      isActive: v.boolean(),
      additional50kmPrice: v.optional(v.number()),
      transferBaseFare: v.optional(v.number()),
      transferMultiplier: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, args) => {
    const { activeOnly = false } = args;

    if (activeOnly) {
      const classes = await ctx.db
        .query("vehicleClasses")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .order("asc")
        .collect();

      // Sort by sortIndex
      return classes.sort((a, b) => a.sortIndex - b.sortIndex);
    }

    const classes = await ctx.db.query("vehicleClasses").collect();

    // Sort by sortIndex
    return classes.sort((a, b) => a.sortIndex - b.sortIndex);
  },
});

// Query: Get a single vehicle class by ID
export const getById = query({
  args: {
    id: v.id("vehicleClasses"),
  },
  returns: v.union(
    v.object({
      _id: v.id("vehicleClasses"),
      _creationTime: v.number(),
      name: v.string(),
      displayName: v.optional(v.string()),
      description: v.optional(v.string()),
      sortIndex: v.number(),
      isActive: v.boolean(),
      additional50kmPrice: v.optional(v.number()),
      transferBaseFare: v.optional(v.number()),
      transferMultiplier: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const vehicleClass = await ctx.db.get(args.id);
    return vehicleClass;
  },
});

// Query: Get a vehicle class by name (for duplicate checking)
export const getByName = query({
  args: {
    name: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("vehicleClasses"),
      _creationTime: v.number(),
      name: v.string(),
      displayName: v.optional(v.string()),
      description: v.optional(v.string()),
      sortIndex: v.number(),
      isActive: v.boolean(),
      additional50kmPrice: v.optional(v.number()),
      transferBaseFare: v.optional(v.number()),
      transferMultiplier: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const vehicleClass = await ctx.db
      .query("vehicleClasses")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    return vehicleClass;
  },
});

// Mutation: Create a new vehicle class
export const create = mutation({
  args: {
    name: v.string(),
    displayName: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    additional50kmPrice: v.optional(v.number()),
    transferBaseFare: v.optional(v.number()),
    transferMultiplier: v.optional(v.number()),
  },
  returns: v.id("vehicleClasses"),
  handler: async (ctx, args) => {
    const { name, displayName, description, isActive = true, additional50kmPrice = 5, transferBaseFare = 25, transferMultiplier = 1.0 } = args;

    // Check if a class with this name already exists
    const existingClass = await ctx.db
      .query("vehicleClasses")
      .withIndex("by_name", (q) => q.eq("name", name))
      .first();

    if (existingClass) {
      throw new Error(
        `A vehicle class with the name "${name}" already exists.`,
      );
    }

    // Get the current maximum sortIndex to append new class at the end
    const allClasses = await ctx.db.query("vehicleClasses").collect();
    const maxSortIndex =
      allClasses.length > 0
        ? Math.max(...allClasses.map((c) => c.sortIndex))
        : -1;

    // Create the new vehicle class
    const newClassId = await ctx.db.insert("vehicleClasses", {
      name,
      displayName,
      description,
      sortIndex: maxSortIndex + 1,
      isActive,
      additional50kmPrice,
      transferBaseFare,
      transferMultiplier,
    });

    return newClassId;
  },
});

// Mutation: Update an existing vehicle class
export const update = mutation({
  args: {
    id: v.id("vehicleClasses"),
    name: v.optional(v.string()),
    displayName: v.optional(v.string()),
    description: v.optional(v.string()),
    sortIndex: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    additional50kmPrice: v.optional(v.number()),
    transferBaseFare: v.optional(v.number()),
    transferMultiplier: v.optional(v.number()),
  },
  returns: v.union(
    v.object({
      _id: v.id("vehicleClasses"),
      _creationTime: v.number(),
      name: v.string(),
      displayName: v.optional(v.string()),
      description: v.optional(v.string()),
      sortIndex: v.number(),
      isActive: v.boolean(),
      additional50kmPrice: v.optional(v.number()),
      transferBaseFare: v.optional(v.number()),
      transferMultiplier: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const { id, name, displayName, description, sortIndex, isActive, additional50kmPrice, transferBaseFare, transferMultiplier } = args;

    // Check if the class exists
    const existingClass = await ctx.db.get(id);
    if (!existingClass) {
      throw new Error("Vehicle class not found.");
    }

    // If name is being changed, check for duplicates
    if (name && name !== existingClass.name) {
      const duplicateClass = await ctx.db
        .query("vehicleClasses")
        .withIndex("by_name", (q) => q.eq("name", name))
        .first();

      if (duplicateClass && duplicateClass._id !== id) {
        throw new Error(
          `A vehicle class with the name "${name}" already exists.`,
        );
      }
    }

    // Update the class
    const updateData: Partial<Doc<"vehicleClasses">> = {};
    if (name !== undefined) updateData.name = name;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (description !== undefined) updateData.description = description;
    if (sortIndex !== undefined) updateData.sortIndex = sortIndex;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (additional50kmPrice !== undefined) updateData.additional50kmPrice = additional50kmPrice;
    if (transferBaseFare !== undefined) updateData.transferBaseFare = transferBaseFare;
    if (transferMultiplier !== undefined) updateData.transferMultiplier = transferMultiplier;

    await ctx.db.patch(id, updateData);

    // Return the updated class
    const updatedClass = await ctx.db.get(id);
    return updatedClass;
  },
});

// Mutation: Delete a vehicle class
export const remove = mutation({
  args: {
    id: v.id("vehicleClasses"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id } = args;

    // Check if the class exists
    const existingClass = await ctx.db.get(id);
    if (!existingClass) {
      throw new Error("Vehicle class not found.");
    }

    // Check if any vehicles reference this class
    const vehiclesUsingClass = await ctx.db
      .query("vehicles")
      .filter((q) => q.eq(q.field("classId"), id))
      .first();

    if (vehiclesUsingClass) {
      throw new Error(
        "Cannot delete this vehicle class because it is being used by one or more vehicles. Please reassign those vehicles first.",
      );
    }

    // Delete the class
    await ctx.db.delete(id);

    return null;
  },
});

// Mutation: Reorder vehicle classes (for future drag-and-drop functionality)
export const reorder = mutation({
  args: {
    updates: v.array(
      v.object({
        id: v.id("vehicleClasses"),
        sortIndex: v.number(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { updates } = args;

    // Update each class with its new sortIndex
    for (const update of updates) {
      const existingClass = await ctx.db.get(update.id);
      if (!existingClass) {
        throw new Error(`Vehicle class with ID ${update.id} not found.`);
      }

      await ctx.db.patch(update.id, {
        sortIndex: update.sortIndex,
      });
    }

    return null;
  },
});
