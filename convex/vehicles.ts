import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { paginationOptsValidator } from "convex/server";

// Pricing tier validator
const pricingTierValidator = v.object({
  minDays: v.number(),
  maxDays: v.number(),
  pricePerDay: v.number(),
});

// Get all vehicles with pagination and filters
export const getAll = query({
  args: {
    paginationOpts: paginationOptsValidator,
    filters: v.optional(
      v.object({
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
        transmission: v.optional(
          v.union(v.literal("automatic"), v.literal("manual")),
        ),
        fuelType: v.optional(
          v.union(
            v.literal("petrol"),
            v.literal("diesel"),
            v.literal("electric"),
            v.literal("hybrid"),
            v.literal("benzina"),
          ),
        ),
        status: v.optional(
          v.union(
            v.literal("available"),
            v.literal("rented"),
            v.literal("maintenance"),
          ),
        ),
      }),
    ),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("vehicles");

    // Apply filters if they exist
    if (args.filters) {
      const {
        type,
        transmission,
        fuelType,
        status,
      } = args.filters;

      if (type) {
        query = query.filter((q) => q.eq(q.field("type"), type));
      }
      if (transmission) {
        query = query.filter((q) =>
          q.eq(q.field("transmission"), transmission),
        );
      }
      if (fuelType) {
        query = query.filter((q) => q.eq(q.field("fuelType"), fuelType));
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

// Get vehicle by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const vehicle = await ctx.db
      .query("vehicles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    return vehicle;
  },
});

// Check if a slug already exists (for real-time validation)
// Returns the vehicle ID if slug exists, null otherwise
// Optionally excludes a specific vehicle (for edit mode)
export const checkSlugExists = query({
  args: {
    slug: v.string(),
    excludeVehicleId: v.optional(v.id("vehicles")),
  },
  returns: v.union(v.id("vehicles"), v.null()),
  handler: async (ctx, args) => {
    if (!args.slug) return null;

    const vehicle = await ctx.db
      .query("vehicles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!vehicle) return null;

    // If we're excluding a vehicle (edit mode), check if it's the same one
    if (args.excludeVehicleId && vehicle._id === args.excludeVehicleId) {
      return null;
    }

    return vehicle._id;
  },
});

// Create a new vehicle
export const create = mutation({
  args: {
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
    classSortIndex: v.optional(v.number()), // For custom sorting within a class
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
    pricingTiers: v.array(pricingTierValidator),
    warranty: v.optional(v.number()),
    isOwner: v.optional(v.boolean()),
    location: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("available"),
      v.literal("rented"),
      v.literal("maintenance"),
    ),
    isTransferVehicle: v.optional(v.boolean()),
    transferPricePerKm: v.optional(v.number()),
    transferSeats: v.optional(v.number()),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate slug uniqueness if provided
    if (args.slug) {
      const existing = await ctx.db
        .query("vehicles")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug))
        .first();
      if (existing) {
        throw new Error(`A vehicle with slug "${args.slug}" already exists`);
      }
    }

    return await ctx.db.insert("vehicles", {
      ...args,
      isOwner: args.isOwner ?? false, // Default to false if not provided
      images: [], // Initialize empty images array
      isTransferVehicle: args.isTransferVehicle ?? false, // Default to false
      transferPricePerKm: args.transferPricePerKm,
      transferSeats: args.transferSeats,
      slug: args.slug,
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
    classSortIndex: v.optional(v.number()), // For custom sorting within a class
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
    pricingTiers: v.optional(v.array(pricingTierValidator)),
    warranty: v.optional(v.number()),
    isOwner: v.optional(v.boolean()),
    location: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    status: v.optional(
      v.union(
        v.literal("available"),
        v.literal("rented"),
        v.literal("maintenance"),
      ),
    ),
    images: v.optional(v.array(v.id("_storage"))),
    mainImageId: v.optional(v.id("_storage")),
    isTransferVehicle: v.optional(v.boolean()),
    transferPricePerKm: v.optional(v.number()),
    transferSeats: v.optional(v.number()),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Validate slug uniqueness if provided and changed
    if (updates.slug !== undefined) {
      const existing = await ctx.db
        .query("vehicles")
        .withIndex("by_slug", (q) => q.eq("slug", updates.slug))
        .first();
      if (existing && existing._id !== id) {
        throw new Error(`A vehicle with slug "${updates.slug}" already exists`);
      }
    }

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
    insertAtIndex: v.optional(v.number()), // Optional: where to insert the images in the order
  },
  handler: async (ctx, args) => {
    const { vehicleId, images, insertAtIndex } = args;

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

    // Update the vehicle with new image IDs in the specified order
    const currentImages = vehicle.images || [];
    let newImages;

    if (
      insertAtIndex !== undefined &&
      insertAtIndex >= 0 &&
      insertAtIndex <= currentImages.length
    ) {
      // Insert at specific position
      newImages = [
        ...currentImages.slice(0, insertAtIndex),
        ...imageIds,
        ...currentImages.slice(insertAtIndex),
      ];
    } else {
      // Append to the end (default behavior)
      newImages = [...currentImages, ...imageIds];
    }

    await ctx.runMutation(api.vehicles.update, {
      id: vehicleId,
      images: newImages,
    });

    return imageIds;
  },
});

// Reorder vehicle images
export const reorderImages = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    imageIds: v.array(v.id("_storage")), // Array of image IDs in the desired order
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { vehicleId, imageIds } = args;

    // Get the current vehicle
    const vehicle = await ctx.db.get(vehicleId);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    // Verify all provided image IDs exist in the vehicle's current images
    const currentImages = vehicle.images || [];
    const invalidIds = imageIds.filter((id) => !currentImages.includes(id));
    if (invalidIds.length > 0) {
      throw new Error("Some image IDs do not belong to this vehicle");
    }

    // Verify we have all images (no missing images)
    if (imageIds.length !== currentImages.length) {
      throw new Error("Image reorder must include all existing images");
    }

    // Update the vehicle with the new image order
    await ctx.db.patch(vehicleId, {
      images: imageIds,
    });

    return null;
  },
});

// Remove a specific image from a vehicle
export const removeImage = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    imageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { vehicleId, imageId } = args;

    // Get the current vehicle
    const vehicle = await ctx.db.get(vehicleId);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    // Check if the image exists in the vehicle's images
    const currentImages = vehicle.images || [];
    if (!currentImages.includes(imageId)) {
      throw new Error("Image not found in vehicle's images");
    }

    // Remove the image from the storage
    await ctx.storage.delete(imageId);

    // Remove the image from the vehicle's images array
    const updatedImages = currentImages.filter((id) => id !== imageId);

    // If this was the main image, clear the main image
    const updates: { images: typeof updatedImages; mainImageId?: undefined } = {
      images: updatedImages,
    };

    if (vehicle.mainImageId === imageId) {
      updates.mainImageId = undefined;
    }

    await ctx.db.patch(vehicleId, updates);

    return null;
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
    startDate: v.number(), // Unix timestamp
    endDate: v.number(), // Unix timestamp
    deliveryLocation: v.optional(v.string()),

    // Optional filters
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
    transmission: v.optional(
      v.union(v.literal("automatic"), v.literal("manual")),
    ),
    fuelType: v.optional(
      v.union(
        v.literal("petrol"),
        v.literal("diesel"),
        v.literal("electric"),
        v.literal("hybrid"),
        v.literal("benzina"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const {
      type,
      transmission,
      fuelType,
    } = args;

    let vehicleQuery = ctx.db
      .query("vehicles")
      .filter((q) => q.eq(q.field("status"), "available"));

    // Apply optional filters
    if (type) {
      vehicleQuery = vehicleQuery.filter((q) => q.eq(q.field("type"), type));
    }
    if (transmission) {
      vehicleQuery = vehicleQuery.filter((q) =>
        q.eq(q.field("transmission"), transmission),
      );
    }
    if (fuelType) {
      vehicleQuery = vehicleQuery.filter((q) =>
        q.eq(q.field("fuelType"), fuelType),
      );
    }

    return await vehicleQuery.collect();
  },
});

// --- End of Migration ---

// Get vehicles by class ID (for ordering page)
export const getByClass = query({
  args: {
    classId: v.id("vehicleClasses"),
  },
  returns: v.array(
    v.object({
      _id: v.id("vehicles"),
      _creationTime: v.number(),
      make: v.string(),
      model: v.string(),
      year: v.optional(v.number()),
      status: v.union(
        v.literal("available"),
        v.literal("rented"),
        v.literal("maintenance"),
      ),
      classSortIndex: v.optional(v.number()),
      mainImageId: v.optional(v.id("_storage")),
    }),
  ),
  handler: async (ctx, args) => {
    const vehicles = await ctx.db
      .query("vehicles")
      .filter((q) => q.eq(q.field("classId"), args.classId))
      .collect();

    // Sort by classSortIndex
    return vehicles
      .map((v) => ({
        _id: v._id,
        _creationTime: v._creationTime,
        make: v.make,
        model: v.model,
        year: v.year,
        status: v.status,
        classSortIndex: v.classSortIndex ?? 0,
        mainImageId: v.mainImageId,
      }))
      .sort((a, b) => a.classSortIndex - b.classSortIndex);
  },
});

// Reorder vehicles within a class
export const reorder = mutation({
  args: {
    updates: v.array(
      v.object({
        id: v.id("vehicles"),
        classSortIndex: v.number(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { updates } = args;

    // Update each vehicle with its new classSortIndex
    for (const update of updates) {
      const existingVehicle = await ctx.db.get(update.id);
      if (!existingVehicle) {
        throw new Error(`Vehicle with ID ${update.id} not found.`);
      }

      await ctx.db.patch(update.id, {
        classSortIndex: update.classSortIndex,
      });
    }

    return null;
  },
});

// Get all vehicles with their class information for public display
export const getAllVehiclesWithClasses = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("vehicles"),
      _creationTime: v.number(),
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
      classId: v.optional(v.id("vehicleClasses")),
      classSortIndex: v.optional(v.number()),
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
      pricePerDay: v.optional(v.number()),
      pricingTiers: v.optional(
        v.array(
          v.object({
            minDays: v.number(),
            maxDays: v.number(),
            pricePerDay: v.number(),
          }),
        ),
      ),
      warranty: v.optional(v.number()),
      isOwner: v.optional(v.boolean()),
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
      isTransferVehicle: v.optional(v.boolean()),
      transferPricePerKm: v.optional(v.number()),
      // SEO slug
      slug: v.optional(v.string()),
      // Class information
      className: v.optional(v.string()),
      classDisplayName: v.optional(v.string()),
      classSortIndexFromClass: v.optional(v.number()),
    }),
  ),
  handler: async (ctx) => {
    // Get all vehicles
    const vehicles = await ctx.db.query("vehicles").collect();

    // Get all vehicle classes
    const vehicleClasses = await ctx.db.query("vehicleClasses").collect();
    const classMap = new Map(vehicleClasses.map((c) => [c._id, c]));

    // Combine vehicle data with class information
    const vehiclesWithClasses = vehicles.map((vehicle) => {
      const vehicleClass = vehicle.classId
        ? classMap.get(vehicle.classId)
        : undefined;

      return {
        ...vehicle,
        className: vehicleClass?.name,
        classDisplayName: vehicleClass?.displayName,
        classSortIndexFromClass: vehicleClass?.sortIndex,
      };
    });

    // Sort vehicles by class sortIndex (ascending), then by vehicle classSortIndex (ascending)
    return vehiclesWithClasses.sort((a, b) => {
      // First, sort by class sortIndex (classes with sortIndex come first)
      const aClassSort = a.classSortIndexFromClass ?? 999999;
      const bClassSort = b.classSortIndexFromClass ?? 999999;

      if (aClassSort !== bClassSort) {
        return aClassSort - bClassSort;
      }

      // Within same class, sort by vehicle's classSortIndex
      const aVehicleSort = a.classSortIndex ?? 999999;
      const bVehicleSort = b.classSortIndex ?? 999999;

      return aVehicleSort - bVehicleSort;
    });
  },
});
