import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Vehicle } from "@/types/vehicle";

export interface UseHomepageFeaturedVehiclesReturn {
  vehiclesToDisplay: Vehicle[];
  currentTitle: string;
  isLoading: boolean;
  error: boolean;
}

export function useHomepageFeaturedVehicles(): UseHomepageFeaturedVehiclesReturn {
  // Try to get featured cars from backend first
  const featuredVehicles = useQuery(api.featuredCars.getFeaturedVehicles);
  
  // Fallback to random vehicles if no featured cars are set
  const fallbackVehiclesQuery = useQuery(
    api.vehicles.getAll, 
    featuredVehicles?.length === 0 ? { paginationOpts: { numItems: 3, cursor: null } } : "skip"
  );

  const isLoading = featuredVehicles === undefined || (featuredVehicles?.length === 0 && fallbackVehiclesQuery === undefined);
  const error = featuredVehicles === null || (featuredVehicles?.length === 0 && fallbackVehiclesQuery === null);

  // Memoize vehicles to display and title calculation
  const { vehiclesToDisplay, currentTitle } = useMemo(() => {
    if (isLoading || error) {
      return {
        vehiclesToDisplay: [] as Vehicle[],
        currentTitle: "Loading...",
      };
    }

    if (featuredVehicles && featuredVehicles.length > 0) {
      // Use featured cars from backend
      return {
        vehiclesToDisplay: featuredVehicles,
        currentTitle: "Featured Cars",
      };
    }

    if (fallbackVehiclesQuery?.page) {
      // Fallback to random selection
      const vehicles = fallbackVehiclesQuery.page as Vehicle[];
      return {
        vehiclesToDisplay: vehicles,
        currentTitle: vehicles.length > 0 ? "Our Latest Cars" : "No Cars Available",
      };
    }

    return {
      vehiclesToDisplay: [] as Vehicle[],
      currentTitle: "No Cars Available",
    };
  }, [isLoading, error, featuredVehicles, fallbackVehiclesQuery?.page]);

  return {
    vehiclesToDisplay,
    currentTitle,
    isLoading,
    error
  };
} 