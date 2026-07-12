import {
  SCDW_BLOCK_DAYS,
  SCDW_EXTRA_BLOCK_PRICE,
  SCDW_FIRST_BLOCK_PRICE,
} from "./constants";
import type { VehiclePricingData } from "./types";

/**
 * SCDW (zero-deductible insurance) price for a rental.
 *
 * CANONICAL RATE (owner decision, 2026-07-11, Linear RNGO-13): `dailyRate`
 * must be the BASE-tier daily rate × seasonal multiplier, rounded —
 * `Math.round(getBasePricePerDay(vehicle) * seasonalMultiplier)` — NOT the
 * duration-tier rate. This matches the on-screen total the customer approves
 * at checkout.
 */
export function calculateSCDW(days: number, dailyRate: number): number {
  const base = dailyRate * 2; // costul asigurării pentru 1–3 zile
  if (days <= SCDW_BLOCK_DAYS) {
    return base;
  }
  const blocks = Math.ceil((days - SCDW_BLOCK_DAYS) / SCDW_BLOCK_DAYS);
  return base + SCDW_FIRST_BLOCK_PRICE + SCDW_EXTRA_BLOCK_PRICE * (blocks - 1);
}

/**
 * Warranty (deductible) amount - use vehicle warranty or fallback based on type.
 * An explicit warranty of 0 means a zero deductible (owner decision,
 * 2026-07-11, PR #45 review); only a genuinely unset warranty falls back to
 * the type table.
 */
export function calculateWarranty(
  vehicle: Pick<VehiclePricingData, "warranty" | "type"> | null | undefined,
): number {
  // If vehicle has warranty field, use it (0 is a valid, deliberate value)
  if (vehicle?.warranty !== undefined) {
    return vehicle.warranty;
  }

  // Fallback to type-based calculation for backward compatibility
  const vehicleType = vehicle?.type || "standard";
  switch (vehicleType.toLowerCase()) {
    case "economy":
      return 300;
    case "compact":
      return 400;
    case "midsize":
    case "intermediate":
      return 500;
    case "standard":
    case "fullsize":
      return 600;
    case "suv":
    case "premium":
      return 800;
    case "luxury":
      return 1000;
    default:
      return 500; // Default warranty amount
  }
}
