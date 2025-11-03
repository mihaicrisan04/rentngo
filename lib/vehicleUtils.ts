import { differenceInDays } from "date-fns";
import { getLocationPrice } from "@/components/location-picker";
import { Vehicle, getPriceForDuration, getBasePricePerDay } from "@/types/vehicle";

// Pricing calculation types
export interface PriceDetails {
  basePrice: number | null;
  totalPrice: number | null;
  days: number | null;
  deliveryFee: number;
  returnFee: number;
  totalLocationFees: number;
  // Add seasonal pricing info
  seasonalMultiplier?: number;
  seasonalAdjustment?: number;
  basePriceBeforeSeason?: number | null;
}

/**
 * Calculate pricing details for a vehicle rental using tiered pricing
 */
export function calculateVehiclePricing(
  vehicle: Vehicle,
  pickup?: Date | null,
  restitution?: Date | null,
  deliveryLocation?: string,
  restitutionLocation?: string,
  pickupTime?: string | null,
  restitutionTime?: string | null
): PriceDetails {
  if (pickup && restitution && pickupTime && restitutionTime && restitution >= pickup) {
    const calculatedDays = calculateRentalDays(pickup, restitution, pickupTime, restitutionTime);

    // Get the appropriate price per day based on rental duration using pricing tiers
    const pricePerDay = getPriceForDuration(vehicle, calculatedDays);
    const basePrice = calculatedDays * pricePerDay;
    
    // Add location fees
    const deliveryFee = deliveryLocation ? getLocationPrice(deliveryLocation) : 0;
    const returnFee = restitutionLocation ? getLocationPrice(restitutionLocation) : 0;
    const totalLocationFees = deliveryFee + returnFee;
    
    return { 
      basePrice,
      totalPrice: basePrice + totalLocationFees, 
      days: calculatedDays,
      deliveryFee,
      returnFee,
      totalLocationFees
    };
  }
  
  return { 
    basePrice: null, 
    totalPrice: null, 
    days: null, 
    deliveryFee: 0, 
    returnFee: 0, 
    totalLocationFees: 0 
  };
}

/**
 * Build reservation URL with vehicle ID
 */
export function buildReservationUrl(vehicleId: string): string {
  const params = new URLSearchParams();
  params.append("vehicleId", vehicleId);
  return `/reservation?${params.toString()}`;
}

/**
 * Format vehicle name for display
 */
export function formatVehicleName(make: string, model: string, year?: number): string {
  const yearStr = year ? ` ${year}` : '';
  return `${make} ${model}${yearStr}`;
}

/**
 * Format engine specification display
 */
export function formatEngineSpec(capacity?: number, type?: string): string | undefined {
  if (!capacity) return undefined;
  const capacityStr = `${capacity.toFixed(1)}L`;
  const typeStr = type ? ` ${type}` : '';
  return `${capacityStr}${typeStr}`.trim();
}

/**
 * Get vehicle type display label
 */
export function getVehicleTypeLabel(type?: string): string {
  if (!type) return '';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Check if dates are valid for rental
 */
export function isValidRentalPeriod(pickup?: Date, restitution?: Date): boolean {
  if (!pickup || !restitution) return false;
  return restitution > pickup;
}

/**
 * Get minimum return date based on pickup date
 */
export function getMinReturnDate(pickupDate?: Date): Date {
  if (!pickupDate) return new Date();
  return pickupDate;
}

/**
 * Calculate number of rental days using dates and pickup/return times
 * Rules:
 * - Same-day rentals count as 1 day
 * - For multi-day rentals, if restitution time is more than 2 hours after pickup time, add 1 day
 */
export function calculateRentalDays(
  pickup: Date,
  restitution: Date,
  pickupTime: string,
  restitutionTime: string
): number {
  const pickupHour = parseInt(pickupTime.split(':')[0]);
  const restitutionHour = parseInt(restitutionTime.split(':')[0]);
  const days = differenceInDays(restitution, pickup);
  if (days === 0) return 1;
  if (restitutionHour > pickupHour + 2) return days + 1;
  return days;
}

/**
 * Calculate pricing details for a vehicle rental with seasonal adjustments
 */
export function calculateVehiclePricingWithSeason(
  vehicle: Vehicle,
  seasonalMultiplier: number = 1.0,
  pickup?: Date | null,
  restitution?: Date | null,
  deliveryLocation?: string,
  restitutionLocation?: string,
  pickupTime?: string | null,
  restitutionTime?: string | null
): PriceDetails {
  if (pickup && restitution && pickupTime && restitutionTime && restitution >= pickup) {
    const calculatedDays = calculateRentalDays(pickup, restitution, pickupTime, restitutionTime);

    // Get the base price per day from pricing tiers
    const basePricePerDay = getPriceForDuration(vehicle, calculatedDays);
    
    // Apply seasonal multiplier to the price per day and round it
    const seasonalPricePerDay = Math.round(basePricePerDay * seasonalMultiplier);
    
    // Calculate base price using the rounded seasonal price per day
    const basePriceBeforeSeason = calculatedDays * basePricePerDay;
    const seasonallyAdjustedBasePrice = calculatedDays * seasonalPricePerDay;
    const seasonalAdjustment = seasonallyAdjustedBasePrice - basePriceBeforeSeason;
    
    // Add location fees
    const deliveryFee = deliveryLocation ? getLocationPrice(deliveryLocation) : 0;
    const returnFee = restitutionLocation ? getLocationPrice(restitutionLocation) : 0;
    const totalLocationFees = deliveryFee + returnFee;
    
    return {
      basePrice: seasonallyAdjustedBasePrice,
      totalPrice: seasonallyAdjustedBasePrice + totalLocationFees,
      days: calculatedDays,
      deliveryFee,
      returnFee,
      totalLocationFees,
      seasonalMultiplier,
      seasonalAdjustment,
      basePriceBeforeSeason,
    };
  }
  
  return { 
    basePrice: null, 
    totalPrice: null, 
    days: null, 
    deliveryFee: 0, 
    returnFee: 0, 
    totalLocationFees: 0,
    seasonalMultiplier: 1.0,
    seasonalAdjustment: 0,
    basePriceBeforeSeason: null,
  };
}

/**
 * Helper function to get vehicle price per day with seasonal adjustment
 */
export function getPriceForDurationWithSeason(
  vehicle: Vehicle, 
  days: number, 
  seasonalMultiplier: number = 1.0
): number {
  const basePrice = getPriceForDuration(vehicle, days);
  return Math.round(basePrice * seasonalMultiplier);
}

/**
 * Calculate total included kilometers for rental period
 * Base allowance: 200km per day
 */
export function calculateIncludedKilometers(days: number): number {
  return days * 200;
}

/**
 * Calculate extra kilometers price
 * Each extra 50km costs a configurable price (default 5 EUR)
 */
export function calculateExtraKilometersPrice(
  extraKilometers: number,
  pricePerExtra50km: number = 5,
): number {
  const extraPackages = Math.floor(extraKilometers / 50);
  return extraPackages * pricePerExtra50km;
}

/**
 * Get maximum allowed extra kilometers (5000km = 100 * 50km packages)
 */
export function getMaxExtraKilometers(): number {
  return 5000;
} 
