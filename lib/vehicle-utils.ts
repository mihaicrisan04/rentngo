// Rental pricing math lives in the pure pricing engine (single source of
// truth, shared with the Convex server recompute); re-exported here so
// existing imports keep working.
export {
  calculateRentalDays,
  calculateVehiclePricing,
  calculateVehiclePricingWithSeason,
  getPriceForDurationWithSeason,
  calculateIncludedKilometers,
  calculateExtraKilometersPrice,
  getMaxExtraKilometers,
} from "@/lib/pricing";
export type { PriceDetails } from "@/lib/pricing";

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
 * Generate a URL-friendly slug from vehicle make, model, and year
 * Format: make-model-year (e.g., "bmw-x5-2024")
 */
export function generateVehicleSlug(make: string, model: string, year?: number): string {
  const parts = [make, model];
  if (year) {
    parts.push(year.toString());
  }

  return parts
    .join("-")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters except hyphens
    .replace(/[\s_]+/g, "-")  // Replace spaces and underscores with hyphens
    .replace(/-+/g, "-")      // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

export { validateSlug as validateVehicleSlug } from "./slug";
