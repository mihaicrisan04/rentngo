import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useMemo } from "react";
import {
  calculateMultiplierForDateRange,
  toDateString,
  type Season,
  type CurrentSeason,
} from "@/lib/season-utils";

export function useDateBasedSeasonalPricing(
  startDate?: Date | null,
  endDate?: Date | null,
) {
  const hasDates =
    startDate !== undefined &&
    startDate !== null &&
    endDate !== undefined &&
    endDate !== null;

  // Fetch all active seasons once (Convex caches this automatically)
  const activeSeasons = useQuery(api.seasons.getActive);

  // Fetch current season once (Convex caches this automatically)
  const currentSeasonData = useQuery(api.seasons.getCurrent);

  // Calculate multiplier client-side for instant results (zero latency)
  const result = useMemo(() => {
    // If we don't have dates, return current season multiplier
    if (!hasDates) {
      if (currentSeasonData?.season) {
        return {
          multiplier: currentSeasonData.season.multiplier,
          seasonId: currentSeasonData.season._id,
          seasonName: currentSeasonData.season.name,
          isLoading: false,
        };
      }
      return {
        multiplier: 1.0,
        seasonId: undefined,
        seasonName: undefined,
        isLoading:
          activeSeasons === undefined || currentSeasonData === undefined,
      };
    }

    // If data is still loading, return default multiplier
    if (activeSeasons === undefined || currentSeasonData === undefined) {
      return {
        multiplier: 1.0,
        seasonId: undefined,
        seasonName: undefined,
        isLoading: true,
      };
    }

    // Convert dates to strings
    const startDateStr = toDateString(startDate!);
    const endDateStr = toDateString(endDate!);

    // Calculate multiplier client-side (instant, no server round-trip!)
    const multiplierResult = calculateMultiplierForDateRange(
      startDateStr,
      endDateStr,
      activeSeasons as Season[],
      currentSeasonData as CurrentSeason | null,
    );

    return {
      multiplier: multiplierResult.multiplier,
      seasonId: multiplierResult.seasonId,
      seasonName: multiplierResult.seasonName,
      isLoading: false,
    };
  }, [hasDates, startDate, endDate, activeSeasons, currentSeasonData]);

  return result;
}
