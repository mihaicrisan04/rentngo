import { differenceInDays } from "date-fns";
import { getLocationPrice } from "@/components/location-picker";
import { PricingTier, Vehicle, getPriceForDuration } from "@/types/vehicle";

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
    // Get hours from time strings
    const pickupHour = parseInt(pickupTime.split(':')[0]);
    const restitutionHour = parseInt(restitutionTime.split(':')[0]);
    
    // Calculate base days difference
    const days = differenceInDays(restitution, pickup);
    
    let calculatedDays = days;
    
    // If it's same day rental (days = 0) or different days
    if (days === 0) {
      // For same day rentals, always count as 1 day
      calculatedDays = 1;
    } else {
      // For multi-day rentals, check hours
      if (restitutionHour <= pickupHour + 2) {
        calculatedDays = days;
      } else if (restitutionHour > pickupHour + 2) {
        calculatedDays = days + 1;
      } else if (restitutionHour < pickupHour) {
        calculatedDays = days;
      }
    }

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
    // Get hours from time strings
    const pickupHour = parseInt(pickupTime.split(':')[0]);
    const restitutionHour = parseInt(restitutionTime.split(':')[0]);
    
    // Calculate base days difference
    const days = differenceInDays(restitution, pickup);
    
    let calculatedDays = days;
    
    // If it's same day rental (days = 0) or different days
    if (days === 0) {
      // For same day rentals, always count as 1 day
      calculatedDays = 1;
    } else {
      // For multi-day rentals, check hours
      if (restitutionHour <= pickupHour + 2) {
        calculatedDays = days;
      } else if (restitutionHour > pickupHour + 2) {
        calculatedDays = days + 1;
      } else if (restitutionHour < pickupHour) {
        calculatedDays = days;
      }
    }

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
