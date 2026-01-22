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
  
  // Determine vehicles to display
  let vehiclesToDisplay: Vehicle[] = [];
  let currentTitle = "Loading...";

  if (!isLoading && !error) {
    if (featuredVehicles && featuredVehicles.length > 0) {
      // Use featured cars from backend
      vehiclesToDisplay = featuredVehicles;
      currentTitle = "Featured Cars";
    } else if (fallbackVehiclesQuery?.page) {
      // Fallback to random selection
      vehiclesToDisplay = fallbackVehiclesQuery.page as Vehicle[];
      currentTitle = vehiclesToDisplay.length > 0 ? "Our Latest Cars" : "No Cars Available";
    } else {
      vehiclesToDisplay = [];
      currentTitle = "No Cars Available";
    }
  }

  return {
    vehiclesToDisplay,
    currentTitle,
    isLoading,
    error
  };
} 