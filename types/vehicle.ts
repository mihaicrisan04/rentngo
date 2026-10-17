import { Id, Doc } from "../convex/_generated/dataModel";

// Tier pricing logic lives in the pure pricing engine (single source of
// truth, shared with the Convex server recompute); re-exported here so
// existing component imports keep working.
import type { PricingTier } from "@/lib/pricing";

export {
  getBasePriceTier,
  getBasePricePerDay,
  getPriceForDuration,
  getTotalPrice,
  getPriceRange,
} from "@/lib/pricing";
export type { PricingTier };

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
