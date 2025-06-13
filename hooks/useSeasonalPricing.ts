import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function useSeasonalPricing() {
  const currentSeason = useQuery(api.seasons.getCurrent);
  const multiplier = useQuery(api.seasons.getCurrentMultiplier);

  return {
    currentSeason,
    multiplier: multiplier ?? 1.0,
    isLoading: multiplier === undefined,
    hasActiveSeason: multiplier !== undefined && multiplier !== 1.0,
  };
} 