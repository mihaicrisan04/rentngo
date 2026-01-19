import { Id, Doc } from "../convex/_generated/dataModel";

// Use Convex generated vehicle type as the primary vehicle interface
export type Vehicle = Doc<"vehicles">;

// Extract types from the schema for use in components (derived from Convex schema)
// export type VehicleType = "sedan" | "suv" | "hatchback" | "sports" | "truck" | "van";
export type VehicleType = Vehicle["type"];
// export type TransmissionType = "automatic" | "manual";
export type TransmissionType = Vehicle["transmission"];
// export type FuelType = "petrol" | "diesel" | "electric" | "hybrid" | "benzina";
export type FuelType = Vehicle["fuelType"];
// export type VehicleStatus = "available" | "rented" | "maintenance";
export type VehicleStatus = Vehicle["status"];

// Pricing tier interface (matches schema)
export interface PricingTier {
  minDays: number;
  maxDays: number;
  pricePerDay: number;
}

// Vehicle filters interface
export interface VehicleFilters {
  type?: VehicleType;
  transmission?: TransmissionType;
  fuelType?: FuelType;
  minPrice?: number;
  maxPrice?: number;
  status?: VehicleStatus;
  location?: string;
}

// Vehicle form data interface (for create/edit forms)
export interface VehicleFormData {
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  seats: number;
  transmission: TransmissionType;
  fuelType: FuelType;
  engineCapacity: number;
  engineType: string;
  // Tiered pricing structure
  pricingTiers: PricingTier[];
  // Warranty amount for the vehicle
  warranty: number;
  location: string;
  features: string[];
  status: VehicleStatus;
}

// Vehicle search/display interface (for listings)
export interface VehicleListItem extends Vehicle {
  currency?: string;
  title?: string;
  desc?: string;
}

// Vehicle image component props
export interface VehicleImageProps {
  imageId: Id<"_storage">;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}

/**
 * Get the base price tier (lowest minDays + highest pricePerDay)
 * This represents the "standard" or "base" price for the vehicle
 */
export function getBasePriceTier(vehicle: Vehicle): PricingTier | null {
  if (!vehicle.pricingTiers || vehicle.pricingTiers.length === 0) {
    return null;
  }
  
  // Sort by minDays (ascending), then by pricePerDay (descending)
  // This gives us the tier with lowest day requirement and highest price
  const sortedTiers = [...vehicle.pricingTiers].sort((a, b) => {
    if (a.minDays !== b.minDays) {
      return a.minDays - b.minDays; // Lower minDays first
    }
    return b.pricePerDay - a.pricePerDay; // Higher pricePerDay first
  });
  
  return sortedTiers[0];
}

/**
 * Get the base price per day for a vehicle
 * Uses the pricing tier with lowest minDays and highest pricePerDay
 */
export function getBasePricePerDay(vehicle: Vehicle): number {
  const baseTier = getBasePriceTier(vehicle);
  if (baseTier) {
    return baseTier.pricePerDay;
  }

  throw new Error(`Vehicle ${vehicle._id} has no pricing tiers configured`);
}

// Helper function to get price for a specific rental duration
export function getPriceForDuration(vehicle: Vehicle, days: number): number {
  // If vehicle has pricing tiers, use them
  if (vehicle.pricingTiers && vehicle.pricingTiers.length > 0) {
    // Find the appropriate tier for the rental duration
    const applicableTier = vehicle.pricingTiers.find(
      tier => days >= tier.minDays && days <= tier.maxDays
    );
    
    if (applicableTier) {
      return applicableTier.pricePerDay;
    }
    
    // If no exact tier found, use the tier with the highest maxDays
    const fallbackTier = vehicle.pricingTiers.reduce((prev, current) => 
      current.maxDays > prev.maxDays ? current : prev
    );
    return fallbackTier.pricePerDay;
  }
  
  // Legacy fallback - use the base price per day
  return getBasePricePerDay(vehicle);
}

// Helper function to get total price for a rental duration
export function getTotalPrice(vehicle: Vehicle, days: number): number {
  return getPriceForDuration(vehicle, days) * days;
}

// Helper function to get the price range for a vehicle
export function getPriceRange(vehicle: Vehicle): { min: number; max: number } {
  if (vehicle.pricingTiers && vehicle.pricingTiers.length > 0) {
    const prices = vehicle.pricingTiers.map(tier => tier.pricePerDay);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }
  
  // Legacy fallback - use base price per day
  const basePrice = getBasePricePerDay(vehicle);
  return {
    min: basePrice,
    max: basePrice
  };
} 
