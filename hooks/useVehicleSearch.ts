import { useState, useEffect, useCallback } from "react";
import { searchStorage, SearchData } from "@/lib/searchStorage";

interface UseVehicleSearchReturn {
  searchState: SearchData & { isHydrated: boolean };
  updateSearchField: <K extends keyof SearchData>(field: K, value: SearchData[K]) => void;
  isValidSearchPeriod: boolean;
}

export function useVehicleSearch(): UseVehicleSearchReturn {
  // Initialize with empty state to avoid hydration issues
  const [searchState, setSearchState] = useState<SearchData & { isHydrated: boolean }>({
    deliveryLocation: "",
    pickupDate: undefined,
    pickupTime: null,
    restitutionLocation: "",
    returnDate: undefined,
    returnTime: null,
    isHydrated: false,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Load initial state from localStorage after hydration
  useEffect(() => {
    const storedData = searchStorage.load();
    
    setSearchState(prev => ({
      ...prev,
      ...storedData,
      isHydrated: true,
    }));
  }, []);

  // Save to localStorage when search criteria changes (only after hydration)
  useEffect(() => {
    if (!searchState.isHydrated) return;

    const { isHydrated, ...dataToSave } = searchState;
    searchStorage.save(dataToSave);
  }, [searchState]);

  // Update search field
  const updateSearchField = useCallback(<K extends keyof SearchData>(
    field: K, 
    value: SearchData[K]
  ) => {
    setSearchState(prev => {
      const newState = { ...prev, [field]: value };
      
      // Auto-adjust return date if pickup date is later
      if (field === 'pickupDate' && value && prev.returnDate) {
        const pickupDate = value as Date;
        if (pickupDate.getTime() > prev.returnDate.getTime()) {
          newState.returnDate = pickupDate;
        }
      }
      
      // Ensure return date is not before pickup date
      if (field === 'returnDate' && value && prev.pickupDate) {
        const returnDate = value as Date;
        const pickupDate = prev.pickupDate;
        if (returnDate.getTime() < pickupDate.getTime()) {
          newState.returnDate = pickupDate;
        }
      }
      
      return newState;
    });
  }, []);

  // Check if search period is valid
  const isValidSearchPeriod = Boolean(
    searchState.pickupDate && 
    searchState.returnDate && 
    searchState.returnDate > searchState.pickupDate
  );

  return {
    searchState,
    updateSearchField,
    isValidSearchPeriod,
  };
} 