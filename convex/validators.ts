import { v } from "convex/values";

// Shared enum validators — the single source of truth for the literal sets
// used by convex/schema.ts and the function modules. Keep these in sync with
// nothing: everything else imports from here.

export const vehicleTypeValidator = v.union(
  v.literal("sedan"),
  v.literal("suv"),
  v.literal("hatchback"),
  v.literal("sports"),
  v.literal("truck"),
  v.literal("van"),
);

export const transmissionValidator = v.union(
  v.literal("automatic"),
  v.literal("manual"),
);

// "petrol" is intentionally absent: "benzina" is the stored value.
export const fuelTypeValidator = v.union(
  v.literal("diesel"),
  v.literal("electric"),
  v.literal("hybrid"),
  v.literal("benzina"),
);

export const vehicleStatusValidator = v.union(
  v.literal("available"),
  v.literal("rented"),
  v.literal("maintenance"),
);

// Shared by reservations and transfers.
export const bookingStatusValidator = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("cancelled"),
  v.literal("completed"),
);

export const paymentMethodValidator = v.union(
  v.literal("cash_on_delivery"),
  v.literal("card_on_delivery"),
  v.literal("card_online"),
);

export const additionalChargeCodeValidator = v.union(
  v.literal("pickupLocationFee"),
  v.literal("returnLocationFee"),
  v.literal("snowChains"),
  v.literal("childSeat1to4"),
  v.literal("childSeat5to12"),
  v.literal("extraKm"),
);
