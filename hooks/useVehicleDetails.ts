import { useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { searchStorage, SearchData } from "@/lib/searchStorage";
import { calculateVehiclePricing, PriceDetails } from "@/lib/vehicleUtils";

interface RentalState extends SearchData {
  isHydrated: boolean;
}

export function useVehicleDetails(vehicleId: string) {
  const vehicle = useQuery(api.vehicles.getById, { id: vehicleId as Id<"vehicles"> });
  
  // Rental state management
  const [rentalState, setRentalState] = useState<RentalState>({
    deliveryLocation: "",
    pickupDate: undefined,
    pickupTime: null,
    restitutionLocation: "",
    returnDate: undefined,
    returnTime: null,
    isHydrated: false,
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const storedData = searchStorage.load();
    setRentalState(prev => ({
      ...prev,
      ...storedData,
      isHydrated: true,
    }));
  }, []);

  // Calculate pricing details using the enhanced vehicleUtils function
  const priceDetails = calculateVehiclePricing(
    vehicle || { pricePerDay: 0 } as any, // fallback if vehicle is loading
    rentalState.pickupDate,
    rentalState.returnDate,
    rentalState.deliveryLocation,
    rentalState.restitutionLocation,
    rentalState.pickupTime,
    rentalState.returnTime
  );

  // Handle rental details updates
  const updateRentalDetails = useCallback((updates: Partial<SearchData>) => {
    setRentalState(prev => {
      const newState = { ...prev, ...updates };
      
      // Save to localStorage only after hydration
      if (prev.isHydrated) {
        searchStorage.save(updates);
      }
      
      return newState;
    });
  }, []);

  const buildReservationUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.append("vehicleId", vehicleId);
    return `/reservation?${params.toString()}`;
  }, [vehicleId]);

  return {
    vehicle,
    rentalState,
    priceDetails,
    updateRentalDetails,
    buildReservationUrl,
  };
} 