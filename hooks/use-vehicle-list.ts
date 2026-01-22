import { useState, useEffect } from "react";
import { useConvex } from "convex/react";
import { api } from "../convex/_generated/api";
import { Vehicle } from "@/types/vehicle";

interface UseVehicleListReturn {
  allVehicles: Vehicle[] | null;
  displayedVehicles: Vehicle[] | null;
  isLoading: boolean;
  error: string | null;
  setDisplayedVehicles: (vehicles: Vehicle[] | null) => void;
}

export function useVehicleList(isHydrated: boolean): UseVehicleListReturn {
  const convex = useConvex();

  const [allVehicles, setAllVehicles] = useState<Vehicle[] | null>(null);
  const [displayedVehicles, setDisplayedVehicles] = useState<Vehicle[] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all vehicles once on component mount
  useEffect(() => {
    if (!isHydrated) return;

    const loadAllVehicles = async () => {
      setError(null);
      setIsLoading(true);

      try {
        const results = await convex.query(
          api.vehicles.getAllVehiclesWithClasses,
          {},
        );
        const vehicles = results as Vehicle[];
        setAllVehicles(vehicles);
        setDisplayedVehicles(vehicles);
      } catch (err) {
        console.error("Failed to fetch all vehicles:", err);
        setError(
          "Failed to load vehicles. Please try refreshing or contact support.",
        );
        setAllVehicles(null);
        setDisplayedVehicles(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllVehicles();
  }, [isHydrated, convex]);

  return {
    allVehicles,
    displayedVehicles,
    isLoading,
    error,
    setDisplayedVehicles,
  };
}
