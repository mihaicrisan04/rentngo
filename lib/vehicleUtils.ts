import { differenceInDays } from "date-fns";
import { getLocationPrice } from "@/components/LocationPicker";

// Pricing calculation types
export interface PriceDetails {
  basePrice: number | null;
  totalPrice: number | null;
  days: number | null;
  deliveryFee: number;
  returnFee: number;
  totalLocationFees: number;
}

/**
 * Calculate pricing details for a vehicle rental
 */
export function calculateVehiclePricing(
  pricePerDay: number,
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
    
    // If same day or next day, check hours
    if (days <= 1) {
      // If restitution is within 2 hours after pickup time, count as 1 day
      if (restitutionHour <= pickupHour + 2) {
        calculatedDays = 1;
      }
      // If restitution is more than 2 hours after pickup time, count as 2 days  
      else if (restitutionHour > pickupHour + 2) {
        calculatedDays = 2;
      }
      // If restitution is before pickup time, count as 1 day
      else if (restitutionHour < pickupHour) {
        calculatedDays = 1;
      }
    }

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