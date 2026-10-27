import { useDateBasedSeasonalPricing } from "@/hooks/use-date-based-seasonal-pricing";
import { getLongestTierPricePerDayWithSeason } from "@/lib/pricing";
import type { Vehicle } from "@/types/vehicle";

/** Cheapest advertised "from" daily rate across the given cars, in EUR. */
export function useLowestFromPrice(vehicles: Vehicle[]): number | null {
  const { multiplier, isLoading } = useDateBasedSeasonalPricing();
  if (isLoading) return null;

  const prices = vehicles
    .map((vehicle) => getLongestTierPricePerDayWithSeason(vehicle, multiplier))
    .filter((price): price is number => price !== null);
  return prices.length > 0 ? Math.min(...prices) : null;
}
