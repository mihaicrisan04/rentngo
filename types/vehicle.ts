import { Id } from "../convex/_generated/dataModel";

// Core vehicle types from schema
export type VehicleType = "sedan" | "suv" | "hatchback" | "sports" | "truck" | "van";
export type TransmissionType = "automatic" | "manual";
export type FuelType = "petrol" | "diesel" | "electric" | "hybrid" | "benzina";
export type VehicleStatus = "available" | "rented" | "maintenance";

// Pricing tier interface
export interface PricingTier {
  minDays: number;
  maxDays: number;
  pricePerDay: number;
}

// Complete vehicle interface
export interface Vehicle {
  _id: Id<"vehicles">;
  make: string;
  model: string;
  year?: number;
  type?: VehicleType;
  seats?: number;
  transmission?: TransmissionType;
  fuelType?: FuelType;
  engineCapacity?: number;
  engineType?: string;
  // Legacy pricing field - kept for backward compatibility
  pricePerDay: number;
  // New tiered pricing structure
  pricingTiers?: PricingTier[];
  // Warranty amount for the vehicle
  warranty?: number;
  location?: string;
  features?: string[];
  status: VehicleStatus;
  images?: Id<"_storage">[];
  mainImageId?: Id<"_storage">;
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
  // Legacy field for backward compatibility
  pricePerDay: number;
  // New tiered pricing structure
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
  
  // Fallback to legacy pricePerDay
  return vehicle.pricePerDay;
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
  
  // Fallback to legacy pricePerDay
  return {
    min: vehicle.pricePerDay,
    max: vehicle.pricePerDay
  };
} 