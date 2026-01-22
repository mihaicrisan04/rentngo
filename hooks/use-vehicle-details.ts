import { useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { searchStorage, SearchData } from "@/lib/search-storage";
import {
  calculateVehiclePricing,
  calculateVehiclePricingWithSeason,
  getPriceForDurationWithSeason,
  PriceDetails,
} from "@/lib/vehicle-utils";
import { useDateBasedSeasonalPricing } from "./use-date-based-seasonal-pricing";

interface RentalState extends SearchData {
  isHydrated: boolean;
}

export function useVehicleDetails(vehicleId: string) {
  const vehicle = useQuery(api.vehicles.getById, {
    id: vehicleId as Id<"vehicles">,
  });

  const vehicleClass = useQuery(
    api.vehicleClasses.getById,
    vehicle?.classId ? { id: vehicle.classId } : "skip"
  );

  // Rental state management with default locations
  const [rentalState, setRentalState] = useState<RentalState>({
    deliveryLocation: searchStorage.getDefaultLocation(),
    pickupDate: undefined,
    pickupTime: null,
    restitutionLocation: searchStorage.getDefaultLocation(),
    returnDate: undefined,
    returnTime: null,
    isHydrated: false,
  });

  // Get date-based seasonal pricing
  const { multiplier: currentMultiplier } = useDateBasedSeasonalPricing(
    rentalState.pickupDate,
    rentalState.returnDate,
  );

  // Load data from localStorage on mount
  useEffect(() => {
    const storedData = searchStorage.load();
    setRentalState((prev) => ({
      ...prev,
      ...storedData,
      isHydrated: true,
    }));
  }, []);

  // Calculate pricing details using the enhanced vehicleUtils function
  const priceDetails = calculateVehiclePricingWithSeason(
    vehicle ||
      ({ pricingTiers: [{ minDays: 1, maxDays: 999, pricePerDay: 0 }] } as any), // fallback if vehicle is loading
    currentMultiplier,
    rentalState.pickupDate,
    rentalState.returnDate,
    rentalState.deliveryLocation,
    rentalState.restitutionLocation,
    rentalState.pickupTime,
    rentalState.returnTime,
  );

  // Handle rental details updates
  const updateRentalDetails = useCallback((updates: Partial<SearchData>) => {
    setRentalState((prev) => {
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

  const additional50kmPrice = vehicleClass?.additional50kmPrice ?? 5;

  return {
    vehicle,
    vehicleClass,
    rentalState,
    priceDetails,
    updateRentalDetails,
    buildReservationUrl,
    additional50kmPrice,
  };
}
