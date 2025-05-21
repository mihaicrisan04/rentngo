import { mutation, action, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { faker } from "@faker-js/faker";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Define the possible literal values for vehicle properties
const vehicleMakes = ["Toyota", "Honda", "Ford", "BMW", "Mercedes-Benz", "Audi", "Volkswagen"] as const;
const vehicleModels = ["Camry", "Civic", "Focus", "X5", "C-Class", "A4", "Golf", "RAV4", "CR-V", "Explorer"] as const;
const vehicleYears = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] as const;
const vehicleTypes = ["sedan", "suv", "hatchback", "sports", "truck", "van"] as const; // Added more variety
const transmissions = ["automatic", "manual"] as const;
const fuelTypes = ["petrol", "diesel", "electric", "hybrid"] as const;
const statuses = ["available", "rented", "maintenance"] as const;
const locations = ["Cluj-Napoca Center", "Cluj-Napoca Airport", "Floresti", "Baciu", "Marasti", "Manastur"] as const;
const featuresList = [
      "air conditioning", "bluetooth", "parking sensors", "heated seats", 
      "backup camera", "navigation", "sunroof", "cruise control",
      "leather seats", "child seat", "wifi", "USB charging", "apple carplay", "android auto"
] as const;
const seatOptions = [2, 4, 5, 7] as const;
const pricePerDayOptions = [100, 120, 150, 180, 200, 250, 300, 350, 400, 500] as const;
const engineCapacityOptions = [1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5, 3.0, 1.5, 1.9, 2.4] as const;
const engineTypeOptions = ["TSI", "TCe", "MPI", "dCi", "HDI", "CDTI", "EcoBoost", "SkyActiv-G", "i-VTEC", "GDI", "CRDi", "BlueHDi"] as const;

// Generate a single fake user
export const generateFakeUser = mutation({
  args: { nonce: v.optional(v.number()) }, // Add a dummy argument to make the mutation unique
  handler: async (ctx, args) => {
    const userData = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      role: Math.random() > 0.2 ? "renter" : "admin",
      preferences: {
        language: Math.random() > 0.5 ? "en" : "ro",
        notifications: faker.datatype.boolean(),
      },
    };
    
    return await ctx.db.insert("users", userData as any);
  },
});

// Generate multiple fake users
export const generateFakeUsers = action({
  args: { count: v.number() },
  handler: async (ctx, args): Promise<Id<"users">[]> => {
    const userIds: Id<"users">[] = [];
    for (let i = 0; i < args.count; i++) {
      const userId: Id<"users"> = await ctx.runMutation(api.seedData.generateFakeUser, { nonce: Date.now() + i });
      userIds.push(userId);
    }
    return userIds;
  },
});

// Simplified Mutation: Accepts vehicle data and inserts it
export const generateFakeVehicle = mutation({
  args: {
    vehicleData: v.object({
      make: v.string(), 
      model: v.string(),
      year: v.number(), 
      type: v.union(...vehicleTypes.map(val => v.literal(val))), // This now includes truck and van
      seats: v.number(), 
      transmission: v.union(...transmissions.map(val => v.literal(val))),
      fuelType: v.union(...fuelTypes.map(val => v.literal(val))),
      engineCapacity: v.number(),
      engineType: v.string(),
      pricePerDay: v.number(), 
      location: v.union(...locations.map(val => v.literal(val))),
      features: v.array(v.union(...featuresList.map(val => v.literal(val)))),
      status: v.union(...statuses.map(val => v.literal(val))),
      images: v.array(v.id("_storage")), 
    })
  },
  handler: async (ctx, args): Promise<Id<"vehicles">> => {
    return await ctx.db.insert("vehicles", args.vehicleData);
  },
});

// Action: Generates multiple fake vehicles using Math.random() and predefined consts
export const generateMultipleFakeVehicles = action({
  args: { count: v.number() },
  handler: async (ctx, args): Promise<Id<"vehicles">[]> => {
    if (args.count <= 0) {
      return [];
    }
    const vehicleIds: Id<"vehicles">[] = [];

    for (let i = 0; i < args.count; i++) {
      // Generate random features
      const numFeatures = Math.floor(Math.random() * (featuresList.length - 2 + 1)) + 2; // 2 to all features
      const shuffledFeatures = [...featuresList].sort(() => 0.5 - Math.random());
      const selectedFeatures = shuffledFeatures.slice(0, numFeatures);
      
      const vehicleData = {
        make: vehicleMakes[Math.floor(Math.random() * vehicleMakes.length)],
        model: vehicleModels[Math.floor(Math.random() * vehicleModels.length)],
        year: vehicleYears[Math.floor(Math.random() * vehicleYears.length)],
        type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
        seats: seatOptions[Math.floor(Math.random() * seatOptions.length)],
        transmission: transmissions[Math.floor(Math.random() * transmissions.length)],
        fuelType: fuelTypes[Math.floor(Math.random() * fuelTypes.length)],
        engineCapacity: engineCapacityOptions[Math.floor(Math.random() * engineCapacityOptions.length)],
        engineType: engineTypeOptions[Math.floor(Math.random() * engineTypeOptions.length)],
        pricePerDay: pricePerDayOptions[Math.floor(Math.random() * pricePerDayOptions.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        features: selectedFeatures,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        images: [] as Id<"_storage">[], 
      };

      const vehicleId: Id<"vehicles"> = await ctx.runMutation(
        api.seedData.generateFakeVehicle,
        { vehicleData }
      );
      vehicleIds.push(vehicleId);
    }
    console.log(`Generated ${vehicleIds.length} vehicles using Math.random().`);
    return vehicleIds;
  },
});

// Generate a fake reservation (Mutation remains, used by Action with Faker)
export const generateFakeReservation = mutation({
  args: { 
    userId: v.id("users"),
    vehicleId: v.id("vehicles"),
    nonce: v.number()
  },
  handler: async (ctx, args): Promise<Id<"reservations">> => {
    faker.seed(args.nonce); // Faker still used here

    const reservationStatuses = ["pending", "confirmed", "cancelled", "completed"] as const;
    
    const startDate = faker.date.soon({ days: 30 });
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (Math.floor(Math.random() * 14) + 1)); // Using Math.random for duration too
    
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) {
      console.warn(`Vehicle ${args.vehicleId} not found during reservation creation. Skipping.`);
      throw new Error(`Vehicle ${args.vehicleId} not found`);
    }
    
    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = vehicle.pricePerDay * durationDays;
    
    const reservationData = {
      userId: args.userId,
      vehicleId: args.vehicleId,
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
      status: reservationStatuses[Math.floor(Math.random() * reservationStatuses.length)], // Math.random for status
      totalPrice,
      // Using Math.random for promo and additional charges as well, to reduce faker dependency
      promoCode: Math.random() > 0.7 ? Array(6).fill(0).map(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join('') : undefined,
      additionalCharges: Math.random() > 0.5 ? [
        {
          description: "Cleaning fee",
          amount: Math.floor(Math.random() * (200 - 50 + 1)) + 50 // Random int between 50 and 200
        }
      ] : undefined
    };
    
    return await ctx.db.insert("reservations", reservationData);
  },
});

// Helper query to get all vehicle IDs
export const getAllVehicleIds = internalQuery({
    args: {},
    handler: async (ctx): Promise<Id<"vehicles">[]> => {
        const vehicles = await ctx.db.query("vehicles").collect();
        return vehicles.map(v => v._id);
    }
});

// Generate multiple fake reservations (Action - orchestrates mutations)
export const generateMultipleFakeReservations = action({
  args: {
    count: v.number(),
    userId: v.id("users"), 
  },
  handler: async (ctx, args): Promise<Id<"reservations">[]> => {
    if (args.count <= 0) {
      return [];
    }

    const vehicleIdsFromDb: Id<"vehicles">[] = await ctx.runQuery(internal.seedData.getAllVehicleIds, {});
    if (vehicleIdsFromDb.length === 0) {
        console.warn("No vehicles found in the database. Cannot create reservations.");
        return [];
    }

    const reservationIds: Id<"reservations">[] = [];
    const baseNonce = Date.now(); // Still used for faker.seed in generateFakeReservation
    let createdCount = 0;

    for (let i = 0; i < args.count; i++) {
      const randomVehicleId = vehicleIdsFromDb[Math.floor(Math.random() * vehicleIdsFromDb.length)]; // Using Math.random
      
      try {
        const reservationId: Id<"reservations"> = await ctx.runMutation(api.seedData.generateFakeReservation, {
          userId: args.userId,
          vehicleId: randomVehicleId,
          nonce: baseNonce + i // Nonce for faker.seed in mutation
        });
        reservationIds.push(reservationId);
        createdCount++;
      } catch (error) {
        console.error(`Error creating reservation ${i + 1}/${args.count}:`, error);
      }
    }

    console.log(`Successfully generated ${createdCount} reservations for user ${args.userId}.`);
    return reservationIds;
  },
});