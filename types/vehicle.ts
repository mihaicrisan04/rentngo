import { Id } from "../convex/_generated/dataModel";

// Core vehicle types from schema
export type VehicleType = "sedan" | "suv" | "hatchback" | "sports" | "truck" | "van";
export type TransmissionType = "automatic" | "manual";
export type FuelType = "petrol" | "diesel" | "electric" | "hybrid" | "benzina";
export type VehicleStatus = "available" | "rented" | "maintenance";

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
  pricePerDay: number;
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
  pricePerDay: number;
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