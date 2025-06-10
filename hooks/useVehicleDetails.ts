import { useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { differenceInDays } from "date-fns";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { searchStorage, SearchData } from "@/lib/searchStorage";
import { getLocationPrice } from "@/components/LocationPicker";

interface PriceDetails {
  basePrice: number | null;
  totalPrice: number | null;
  days: number | null;
  deliveryFee: number;
  returnFee: number;
  totalLocationFees: number;
}

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

  // Calculate pricing details
  const calculatePricing = useCallback((
    pricePerDay: number,
    pickup?: Date | null,
    restitution?: Date | null,
    deliveryLocation?: string,
    restitutionLocation?: string
  ): PriceDetails => {
    if (pickup && restitution && restitution > pickup) {
      const days = differenceInDays(restitution, pickup);
      const calculatedDays = days === 0 ? 1 : days;
      const basePrice = calculatedDays * pricePerDay;
      
      const deliveryFee = deliveryLocation ? getLocationPrice(deliveryLocation) : 0;
      const returnFee = restitutionLocation ? getLocationPrice(restitutionLocation) : 0;
      const totalLocationFees = deliveryFee + returnFee;
      
      return { 
        basePrice,
        totalPrice: basePrice + totalLocationFees, 
        days: calculatedDays,
        deliveryFee,
        returnFee,
        totalLocationFees
      };
    }
    return { 
      basePrice: null, 
      totalPrice: null, 
      days: null, 
      deliveryFee: 0, 
      returnFee: 0, 
      totalLocationFees: 0 
    };
  }, []);

  const priceDetails = calculatePricing(
    vehicle?.pricePerDay || 0,
    rentalState.pickupDate,
    rentalState.returnDate,
    rentalState.deliveryLocation,
    rentalState.restitutionLocation
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