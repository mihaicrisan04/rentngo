import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

// Get all vehicles with pagination and filters
export const getAll = query({
  args: { 
    paginationOpts: paginationOptsValidator,
    filters: v.optional(v.object({
      type: v.optional(v.union(v.literal("sedan"), v.literal("suv"), v.literal("hatchback"), v.literal("sports"))),
      transmission: v.optional(v.union(v.literal("automatic"), v.literal("manual"))),
      fuelType: v.optional(v.union(v.literal("petrol"), v.literal("diesel"), v.literal("electric"), v.literal("hybrid"))),
      minPrice: v.optional(v.number()),
      maxPrice: v.optional(v.number()),
      status: v.optional(v.union(v.literal("available"), v.literal("rented"), v.literal("maintenance"))),
    }))
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("vehicles");

    // Apply filters if they exist
    if (args.filters) {
      const { type, transmission, fuelType, minPrice, maxPrice, status } = args.filters;
      
      if (type) {
        query = query.filter((q) => q.eq(q.field("type"), type));
      }
      if (transmission) {
        query = query.filter((q) => q.eq(q.field("transmission"), transmission));
      }
      if (fuelType) {
        query = query.filter((q) => q.eq(q.field("fuelType"), fuelType));
      }
      if (minPrice !== undefined) {
        query = query.filter((q) => q.gte(q.field("pricePerDay"), minPrice));
      }
      if (maxPrice !== undefined) {
        query = query.filter((q) => q.lte(q.field("pricePerDay"), maxPrice));
      }
      if (status) {
        query = query.filter((q) => q.eq(q.field("status"), status));
      }
    }

    return await query.order("desc").paginate(args.paginationOpts);
  },
});

// Get all vehicles (deprecated - use getAll with pagination instead)
export const getAllVehicles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("vehicles").collect();
  },
});

// Get vehicle by ID
export const getById = query({
  args: { id: v.id("vehicles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new vehicle
export const create = mutation({
  args: {
    make: v.string(),
    model: v.string(),
    year: v.number(),
    type: v.union(v.literal("sedan"), v.literal("suv"), v.literal("hatchback"), v.literal("sports")),
    seats: v.number(),
    transmission: v.union(v.literal("automatic"), v.literal("manual")),
    fuelType: v.union(v.literal("petrol"), v.literal("diesel"), v.literal("electric"), v.literal("hybrid")),
    engineCapacity: v.number(),
    engineType: v.string(),
    pricePerDay: v.number(),
    location: v.string(),
    features: v.array(v.string()),
    status: v.union(v.literal("available"), v.literal("rented"), v.literal("maintenance")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("vehicles", {
      ...args,
      images: [], // Initialize empty images array
    });
  },
});

// Update a vehicle
export const update = mutation({
  args: {
    id: v.id("vehicles"),
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    type: v.optional(v.union(v.literal("sedan"), v.literal("suv"), v.literal("hatchback"), v.literal("sports"))),
    seats: v.optional(v.number()),
    transmission: v.optional(v.union(v.literal("automatic"), v.literal("manual"))),
    fuelType: v.optional(v.union(v.literal("petrol"), v.literal("diesel"), v.literal("electric"), v.literal("hybrid"))),
    engineCapacity: v.optional(v.number()),
    engineType: v.optional(v.string()),
    pricePerDay: v.optional(v.number()),
    location: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal("available"), v.literal("rented"), v.literal("maintenance"))),
    images: v.optional(v.array(v.id("_storage"))),
    mainImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

// Delete a vehicle
export const remove = mutation({
  args: { id: v.id("vehicles") },
  handler: async (ctx, args) => {
    // First, get the vehicle to check for images
    const vehicle = await ctx.db.get(args.id);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    // Delete all associated images from storage
    if (vehicle.images && vehicle.images.length > 0) {
      for (const imageId of vehicle.images) {
        await ctx.storage.delete(imageId);
      }
    }

    // Delete the vehicle
    await ctx.db.delete(args.id);
    return null;
  },
});

// Upload vehicle images
export const uploadImages = action({
  args: {
    vehicleId: v.id("vehicles"),
    images: v.array(v.bytes()),
  },
  handler: async (ctx, args) => {
    const { vehicleId, images } = args;
    
    // Get the current vehicle
    const vehicle = await ctx.runQuery(api.vehicles.getById, { id: vehicleId });
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    // Upload each image to storage
    const imageIds = [];
    for (const imageBytes of images) {
      const imageId = await ctx.storage.store(new Blob([imageBytes]));
      imageIds.push(imageId);
    }

    // Update the vehicle with new image IDs
    await ctx.runMutation(api.vehicles.update, {
      id: vehicleId,
      images: [...(vehicle.images || []), ...imageIds],
    });

    return imageIds;
  },
});

// Set main image
export const setMainImage = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    imageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const { vehicleId, imageId } = args;
    
    // Verify the image exists in the vehicle's images array
    const vehicle = await ctx.db.get(vehicleId);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    if (vehicle.images && !vehicle.images.includes(imageId)) {
      throw new Error("Image not found in vehicle's images");
    }

    // Set as main image
    return await ctx.db.patch(vehicleId, {
      mainImageId: imageId,
    });
  },
});

// Get image URL
export const getImageUrl = query({
  args: {
    imageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.imageId);
  },
});

// Query to search for available vehicles based on date range and location
export const searchAvailableVehicles = query({
  args: {
    startDate: v.number(), // Unix timestamp - Will be accepted but not used for reservation checking in this version
    endDate: v.number(),   // Unix timestamp - Will be accepted but not used for reservation checking in this version
    deliveryLocation: v.optional(v.string()), // Retained as optional, not used for filtering here
    
    // Optional filters (similar to getAll)
    type: v.optional(v.union(v.literal("sedan"), v.literal("suv"), v.literal("hatchback"), v.literal("sports"))),
    transmission: v.optional(v.union(v.literal("automatic"), v.literal("manual"))),
    fuelType: v.optional(v.union(v.literal("petrol"), v.literal("diesel"), v.literal("electric"), v.literal("hybrid"))),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { /* startDate, endDate, */ deliveryLocation, type, transmission, fuelType, minPrice, maxPrice } = args;

    // 1. Remove logic for querying reservations table and finding unavailableVehicleIds
    // const overlappingReservations = await ctx.db ... .collect();
    // const unavailableVehicleIds = new Set(...);

    // 2. Query vehicles, filtering by status: "available" and other optional filters.
    // deliveryLocation is not used for filtering vehicle results in this version.
    let vehicleQuery = ctx.db
      .query("vehicles")
      .filter((q) => q.eq(q.field("status"), "available")); // Only consider vehicles marked as 'available'

    // Apply optional filters
    if (type) {
      vehicleQuery = vehicleQuery.filter((q) => q.eq(q.field("type"), type));
    }
    if (transmission) {
      vehicleQuery = vehicleQuery.filter((q) => q.eq(q.field("transmission"), transmission));
    }
    if (fuelType) {
      vehicleQuery = vehicleQuery.filter((q) => q.eq(q.field("fuelType"), fuelType));
    }
    if (minPrice !== undefined) {
      vehicleQuery = vehicleQuery.filter((q) => q.gte(q.field("pricePerDay"), minPrice));
    }
    if (maxPrice !== undefined) {
      vehicleQuery = vehicleQuery.filter((q) => q.lte(q.field("pricePerDay"), maxPrice));
    }

    const potentiallyAvailableVehicles = await vehicleQuery.collect();

    // 3. Filtering based on unavailableVehicleIds is removed.
    // const availableVehicles = potentiallyAvailableVehicles.filter(...);

    return potentiallyAvailableVehicles; // Return all vehicles with status:"available" that match filters
  },
});

// --- End of Migration ---

