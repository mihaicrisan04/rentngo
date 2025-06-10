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
  const featuredVehiclesQuery = useQuery(api.vehicles.getAll, { 
    paginationOpts: { numItems: 3, cursor: null }
  });

  const vehiclesToDisplay = (featuredVehiclesQuery?.page || []) as Vehicle[];
  const isLoading = featuredVehiclesQuery === undefined;
  const error = featuredVehiclesQuery === null;
  
  const currentTitle = isLoading 
    ? "Loading..." 
    : (vehiclesToDisplay.length > 0 ? "Featured Cars" : "No Featured Cars");

  return {
    vehiclesToDisplay,
    currentTitle,
    isLoading,
    error
  };
} 