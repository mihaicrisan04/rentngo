/**
 * Structural types for the pricing engine.
 *
 * This module (and everything under lib/pricing) is pure TypeScript: it is
 * imported both by client code (`@/lib/pricing`) and by Convex functions
 * (relative `../lib/pricing`), so it must never import React, Next.js,
 * Convex, or generated Convex types. Convex documents (`Doc<"vehicles">`,
 * `Doc<"seasons">`, ...) are structurally assignable to these input types.
 */

export interface PricingTier {
  minDays: number;
  maxDays: number;
  pricePerDay: number;
}

/** The subset of a vehicle document the pricing engine needs. */
export interface VehiclePricingData {
  _id?: string;
  pricingTiers?: PricingTier[];
  warranty?: number;
  type?: string;
}

/** The subset of a season document the pricing engine needs. */
export interface Season {
  _id: string;
  name: string;
  description?: string;
  multiplier: number;
  periods: Array<{
    startDate: string;
    endDate: string;
    description?: string;
  }>;
  isActive: boolean;
}

export interface CurrentSeason {
  seasonId: string;
  season: Season;
}

export interface MultiplierResult {
  multiplier: number;
  seasonId?: string;
  seasonName?: string;
}

/**
 * Stable, locale-free codes for reservation line items. The UI and email
 * layers translate `code` + `params` at render time (shared i18n namespace
 * `reservationCharges`); localized prose is never persisted.
 */
export type ChargeCode =
  | "pickupLocationFee" // params: { location }
  | "returnLocationFee" // params: { location }
  | "snowChains" // params: { days }
  | "childSeat1to4" // params: { count, days }
  | "childSeat5to12" // params: { count, days }
  | "extraKm"; // params: { km }

export type ChargeParams = Record<string, string | number>;

export interface ReservationCharge {
  code: ChargeCode;
  params: ChargeParams;
  amount: number;
}

/** Physical extras selected for a rental. */
export interface ReservationExtras {
  snowChains: boolean;
  childSeat1to4: number;
  childSeat5to12: number;
  /** Extra kilometers purchased, in km (sold as 50km packages). */
  extraKilometers: number;
}

export interface ReservationPricingInput {
  vehicle: VehiclePricingData;
  startDate: Date;
  endDate: Date;
  pickupTime: string; // "HH:MM"
  restitutionTime: string; // "HH:MM"
  pickupLocation: string;
  restitutionLocation: string;
  seasonalMultiplier: number;
  isSCDWSelected: boolean;
  extras?: ReservationExtras;
  /** Price per extra-50km package from the vehicle class (default 5 EUR). */
  additional50kmPrice?: number;
}

export interface ReservationPricingBreakdown {
  rentalDays: number;
  /** Duration-tier daily rate × seasonal multiplier, rounded. */
  pricePerDay: number;
  /** rentalDays × pricePerDay (pre-extras, pre-location-fees). */
  basePrice: number;
  deliveryFee: number;
  returnFee: number;
  totalLocationFees: number;
  warrantyAmount: number;
  /** SCDW price (always computed, charged only when selected). */
  scdwPrice: number;
  /** scdwPrice when SCDW is selected, else 0. */
  protectionCost: number;
  /** 0 when SCDW is selected, else the warranty deductible. */
  deductibleAmount: number;
  /** Location fees + physical extras as structured line items. */
  additionalCharges: ReservationCharge[];
  /** Sum of additionalCharges amounts (location fees + extras). */
  totalAdditionalCharges: number;
  /** basePrice + protectionCost + totalAdditionalCharges. */
  totalPrice: number;
  seasonalMultiplier: number;
}

export interface TransferTierData {
  minExtraKm: number;
  maxExtraKm?: number;
  pricePerKm: number;
  isActive?: boolean;
}

export interface TransferVehicleClassData {
  transferBaseFare?: number;
  transferMultiplier?: number;
}

export interface TransferPricingInput {
  distanceKm: number;
  transferType: "one_way" | "round_trip";
  vehicleClass?: TransferVehicleClassData | null;
  tiers: TransferTierData[];
}

export interface TransferPricingBreakdown {
  baseFare: number;
  extraKm: number;
  /** Distance charge for a single leg (not doubled for round trips). */
  distanceCharge: number;
  /** Full price; doubled for round trips. */
  totalPrice: number;
  /** Per-km rate of the matched tier (0 when the trip fits the base fare). */
  tierPricePerKm: number;
}
