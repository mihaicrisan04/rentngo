import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

const transferStatusValidator = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("cancelled"),
  v.literal("completed"),
);

type TransferStatusType = "pending" | "confirmed" | "cancelled" | "completed";

const locationValidator = v.object({
  address: v.string(),
  coordinates: v.object({
    lng: v.number(),
    lat: v.number(),
  }),
});

const customerInfoValidator = v.object({
  name: v.string(),
  email: v.string(),
  phone: v.string(),
  message: v.optional(v.string()),
  flightNumber: v.optional(v.string()),
});

const paymentMethodValidator = v.union(
  v.literal("cash_on_delivery"),
  v.literal("card_on_delivery"),
  v.literal("card_online"),
);

export const createTransfer = mutation({
  args: {
    userId: v.optional(v.id("users")),
    vehicleId: v.id("vehicles"),
    transferType: v.union(v.literal("one_way"), v.literal("round_trip")),
    pickupLocation: locationValidator,
    pickupDate: v.number(),
    pickupTime: v.string(),
    dropoffLocation: locationValidator,
    returnDate: v.optional(v.number()),
    returnTime: v.optional(v.string()),
    passengers: v.number(),
    distanceKm: v.number(),
    estimatedDurationMinutes: v.number(),
    baseFare: v.number(),
    distancePrice: v.number(),
    totalPrice: v.number(),
    pricePerKm: v.number(),
    customerInfo: customerInfoValidator,
    paymentMethod: paymentMethodValidator,
    luggageCount: v.optional(v.number()),
    locale: v.optional(v.string()),
  },
  returns: v.object({
    transferId: v.id("transfers"),
    transferNumber: v.number(),
  }),
  handler: async (ctx, args) => {
    const allTransfers = await ctx.db.query("transfers").collect();
    const hasAny = allTransfers.length > 0;
    const maxNumber = hasAny
      ? Math.max(...allTransfers.map((t) => t.transferNumber ?? 0))
      : 0;
    const nextTransferNumber = maxNumber + 1;

    const newTransferData = {
      transferNumber: nextTransferNumber,
      userId: args.userId,
      vehicleId: args.vehicleId,
      transferType: args.transferType,
      pickupLocation: args.pickupLocation,
      pickupDate: args.pickupDate,
      pickupTime: args.pickupTime,
      dropoffLocation: args.dropoffLocation,
      returnDate: args.returnDate,
      returnTime: args.returnTime,
      passengers: args.passengers,
      distanceKm: args.distanceKm,
      estimatedDurationMinutes: args.estimatedDurationMinutes,
      baseFare: args.baseFare,
      distancePrice: args.distancePrice,
      totalPrice: args.totalPrice,
      pricePerKm: args.pricePerKm,
      customerInfo: args.customerInfo,
      paymentMethod: args.paymentMethod,
      luggageCount: args.luggageCount,
      status: "pending" as const,
    };

    const transferId = await ctx.db.insert("transfers", newTransferData);

    // Format pickup date for email
    const pickupDateObj = new Date(args.pickupDate);
    const timeZone = 'Europe/Bucharest';
    const pickupDateString = pickupDateObj.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', timeZone });
    
    let returnDateString: string | undefined;
    if (args.returnDate) {
      const returnDateObj = new Date(args.returnDate);
      returnDateString = returnDateObj.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', timeZone });
    }

    // Fetch vehicle info for email
    const vehicle = await ctx.db.get(args.vehicleId);

    // Schedule email sending
    await ctx.scheduler.runAfter(0, internal.emails.sendTransferConfirmationEmail, {
      transferNumber: nextTransferNumber,
      customerInfo: args.customerInfo,
      vehicleInfo: vehicle ? {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        type: vehicle.type,
        seats: vehicle.transferSeats ?? vehicle.seats,
        transmission: vehicle.transmission,
        fuelType: vehicle.fuelType,
      } : {
        make: "Vehicle",
        model: "Info",
      },
      pickupLocation: {
        address: args.pickupLocation.address,
      },
      dropoffLocation: {
        address: args.dropoffLocation.address,
      },
      pickupDate: pickupDateString,
      pickupTime: args.pickupTime,
      returnDate: returnDateString,
      returnTime: args.returnTime,
      transferType: args.transferType,
      passengers: args.passengers,
      luggageCount: args.luggageCount,
      distanceKm: args.distanceKm,
      estimatedDurationMinutes: args.estimatedDurationMinutes,
      pricingDetails: {
        baseFare: args.baseFare,
        distancePrice: args.distancePrice,
        totalPrice: args.totalPrice,
        pricePerKm: args.pricePerKm,
      },
      paymentMethod: args.paymentMethod,
      locale: args.locale,
    });

    return {
      transferId,
      transferNumber: nextTransferNumber,
    };
  },
});

export const getTransferById = query({
  args: {
    transferId: v.id("transfers"),
  },
  handler: async (ctx, args) => {
    const transfer = await ctx.db.get(args.transferId);
    return transfer;
  },
});

export const getCurrentUserTransfers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const transfers = await ctx.db
      .query("transfers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return transfers.sort((a, b) => b.pickupDate - a.pickupDate);
  },
});

export const getTransfersByVehicle = query({
  args: {
    vehicleId: v.id("vehicles"),
  },
  handler: async (ctx, args) => {
    const transfers = await ctx.db
      .query("transfers")
      .withIndex("by_vehicle", (q) => q.eq("vehicleId", args.vehicleId))
      .collect();
    return transfers;
  },
});

export const getAllTransfers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      return [];
    }

    const transfers = await ctx.db.query("transfers").collect();
    return transfers.sort((a, b) => b.pickupDate - a.pickupDate);
  },
});

export const updateTransferStatus = mutation({
  args: {
    transferId: v.id("transfers"),
    newStatus: transferStatusValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const transfer = await ctx.db.get(args.transferId);
    if (!transfer) {
      throw new Error("Transfer not found");
    }

    await ctx.db.patch(args.transferId, {
      status: args.newStatus as TransferStatusType,
    });

    return { success: true };
  },
});

export const updateTransferDetails = mutation({
  args: {
    transferId: v.id("transfers"),
    vehicleId: v.optional(v.id("vehicles")),
    transferType: v.optional(
      v.union(v.literal("one_way"), v.literal("round_trip")),
    ),
    pickupLocation: v.optional(locationValidator),
    pickupDate: v.optional(v.number()),
    pickupTime: v.optional(v.string()),
    dropoffLocation: v.optional(locationValidator),
    returnDate: v.optional(v.number()),
    returnTime: v.optional(v.string()),
    passengers: v.optional(v.number()),
    distanceKm: v.optional(v.number()),
    estimatedDurationMinutes: v.optional(v.number()),
    baseFare: v.optional(v.number()),
    distancePrice: v.optional(v.number()),
    totalPrice: v.optional(v.number()),
    pricePerKm: v.optional(v.number()),
    customerInfo: v.optional(customerInfoValidator),
    paymentMethod: v.optional(paymentMethodValidator),
    status: v.optional(transferStatusValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const { transferId, ...updates } = args;

    const transfer = await ctx.db.get(transferId);
    if (!transfer) {
      throw new Error("Transfer not found");
    }

    const updatesToApply: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        updatesToApply[key] = value;
      }
    }

    if (Object.keys(updatesToApply).length > 0) {
      await ctx.db.patch(transferId, updatesToApply);
    }

    return { success: true };
  },
});

export const cancelTransfer = mutation({
  args: {
    transferId: v.id("transfers"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const transfer = await ctx.db.get(args.transferId);
    if (!transfer) {
      throw new Error("Transfer not found");
    }

    if (transfer.status === "completed") {
      throw new Error("Cannot cancel a completed transfer");
    }

    if (transfer.status === "cancelled") {
      throw new Error("Transfer is already cancelled");
    }

    await ctx.db.patch(args.transferId, { status: "cancelled" });

    return { success: true, message: "Transfer cancelled successfully" };
  },
});

export const deleteTransferPermanently = mutation({
  args: {
    transferId: v.id("transfers"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const transfer = await ctx.db.get(args.transferId);
    if (!transfer) {
      return { success: false, message: "Transfer not found" };
    }

    await ctx.db.delete(args.transferId);

    return { success: true, message: "Transfer deleted permanently" };
  },
});

export const getTransferStats = query({
  args: {},
  returns: v.object({
    totalTransfers: v.number(),
    activeTransfers: v.number(),
    pendingConfirmations: v.number(),
    currentMonthRevenue: v.number(),
    transferGrowth: v.number(),
    revenueGrowth: v.number(),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        totalTransfers: 0,
        activeTransfers: 0,
        pendingConfirmations: 0,
        currentMonthRevenue: 0,
        transferGrowth: 0,
        revenueGrowth: 0,
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      return {
        totalTransfers: 0,
        activeTransfers: 0,
        pendingConfirmations: 0,
        currentMonthRevenue: 0,
        transferGrowth: 0,
        revenueGrowth: 0,
      };
    }

    const allTransfers = await ctx.db.query("transfers").collect();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonthStart = new Date(currentYear, currentMonth - 1, 1).getTime();
    const currentMonthStart = new Date(currentYear, currentMonth, 1).getTime();

    const totalTransfers = allTransfers.length;

    const activeTransfers = allTransfers.filter(
      (t) => t.status === "confirmed" && t.pickupDate >= Date.now(),
    ).length;

    const pendingConfirmations = allTransfers.filter(
      (t) => t.status === "pending",
    ).length;

    const currentMonthTransfers = allTransfers.filter(
      (t) => t.pickupDate >= currentMonthStart,
    );
    const currentMonthRevenue = currentMonthTransfers.reduce(
      (sum, t) => sum + t.totalPrice,
      0,
    );

    const lastMonthTransfers = allTransfers.filter(
      (t) => t.pickupDate >= lastMonthStart && t.pickupDate < currentMonthStart,
    );
    const lastMonthRevenue = lastMonthTransfers.reduce(
      (sum, t) => sum + t.totalPrice,
      0,
    );

    const transferGrowth =
      lastMonthTransfers.length > 0
        ? Math.round(
            ((currentMonthTransfers.length - lastMonthTransfers.length) /
              lastMonthTransfers.length) *
              100,
          )
        : currentMonthTransfers.length > 0
          ? 100
          : 0;

    const revenueGrowth =
      lastMonthRevenue > 0
        ? Math.round(
            ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100,
          )
        : currentMonthRevenue > 0
          ? 100
          : 0;

    return {
      totalTransfers,
      activeTransfers,
      pendingConfirmations,
      currentMonthRevenue: Math.round(currentMonthRevenue),
      transferGrowth,
      revenueGrowth,
    };
  },
});

export const getMonthlyTransferChartData = query({
  args: {},
  returns: v.array(
    v.object({
      month: v.string(),
      transfers: v.number(),
      revenue: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      return [];
    }

    const allTransfers = await ctx.db.query("transfers").collect();

    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = date.getTime();
      const monthEnd = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
      ).getTime();

      const monthTransfers = allTransfers.filter(
        (t) => t.pickupDate >= monthStart && t.pickupDate <= monthEnd,
      );

      const monthRevenue = monthTransfers.reduce(
        (sum, t) => sum + t.totalPrice,
        0,
      );

      months.push({
        month: date.toLocaleString("default", { month: "short" }),
        transfers: monthTransfers.length,
        revenue: Math.round(monthRevenue),
      });
    }

    return months;
  },
});

export const getTransferVehicles = query({
  args: {
    minSeats: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_transfer", (q) => q.eq("isTransferVehicle", true))
      .collect();

    const availableVehicles = vehicles.filter((v) => v.status === "available");

    const minSeats = args.minSeats;
    if (minSeats !== undefined) {
      return availableVehicles.filter((v) => {
        const effectiveCapacity = v.transferSeats ?? ((v.seats ?? 0) - 2);
        return effectiveCapacity >= minSeats;
      });
    }

    return availableVehicles;
  },
});

export const getTransferVehiclesWithImages = query({
  args: {
    minSeats: v.optional(v.number()),
    distanceKm: v.optional(v.number()),
    transferType: v.optional(v.union(v.literal("one_way"), v.literal("round_trip"))),
  },
  handler: async (ctx, args) => {
    const vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_transfer", (q) => q.eq("isTransferVehicle", true))
      .collect();

    const availableVehicles = vehicles.filter((v) => v.status === "available");

    // Filter by transferSeats (if set) or fallback to seats - 2
    const minSeats = args.minSeats;
    const filteredVehicles = minSeats !== undefined
      ? availableVehicles.filter((v) => {
          const effectiveCapacity = v.transferSeats ?? ((v.seats ?? 0) - 2);
          return effectiveCapacity >= minSeats;
        })
      : availableVehicles;

    // Fetch all vehicle classes for base fare and multiplier lookup
    const vehicleClasses = await ctx.db.query("vehicleClasses").collect();
    const classMap = new Map(vehicleClasses.map((c) => [c._id, c]));

    // Fetch all active pricing tiers
    const pricingTiers = await ctx.db.query("transferPricingTiers").collect();
    const activeTiers = pricingTiers.filter((t) => t.isActive);

    const BASE_KM_INCLUDED = 15;
    const DEFAULT_BASE_FARE = 25;
    const DEFAULT_MULTIPLIER = 1.0;
    const DEFAULT_PRICE_PER_KM = 1.0;

    const vehiclesWithImages = await Promise.all(
      filteredVehicles.map(async (vehicle) => {
        let imageUrl: string | null = null;
        const imageId = vehicle.mainImageId || vehicle.images?.[0];
        if (imageId) {
          imageUrl = await ctx.storage.getUrl(imageId);
        }

        // Get base fare and multiplier from vehicle class
        const vehicleClass = vehicle.classId ? classMap.get(vehicle.classId) : null;
        const transferBaseFare = vehicleClass?.transferBaseFare ?? DEFAULT_BASE_FARE;
        const classMultiplier = vehicleClass?.transferMultiplier ?? DEFAULT_MULTIPLIER;

        // Calculate price using new tiered formula
        const distanceKm = args.distanceKm ?? 0;
        const extraKm = Math.max(distanceKm - BASE_KM_INCLUDED, 0);

        let calculatedPrice: number;
        let distanceCharge = 0;

        if (extraKm === 0) {
          // Trip within base fare (≤ 15km)
          calculatedPrice = transferBaseFare;
        } else {
          // Find applicable tier based on extra km
          const tier = activeTiers.find(
            (t) =>
              extraKm >= t.minExtraKm &&
              (t.maxExtraKm === undefined || extraKm < t.maxExtraKm),
          );

          const tierPricePerKm = tier?.pricePerKm ?? DEFAULT_PRICE_PER_KM;

          // Calculate: baseFare + (extraKm × tierPrice × classMultiplier)
          distanceCharge = extraKm * tierPricePerKm * classMultiplier;
          calculatedPrice = transferBaseFare + distanceCharge;
        }

        // Apply round trip multiplier
        if (args.transferType === "round_trip") {
          calculatedPrice = calculatedPrice * 2;
        }

        return {
          ...vehicle,
          imageUrl,
          transferBaseFare,
          classMultiplier,
          distanceCharge: Math.round(distanceCharge * 100) / 100,
          calculatedPrice: Math.round(calculatedPrice * 100) / 100,
        };
      }),
    );

    // Sort by calculated price (ascending)
    return vehiclesWithImages.sort((a, b) => a.calculatedPrice - b.calculatedPrice);
  },
});
