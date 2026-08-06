import { useState, useEffect, useCallback } from "react";
import { searchStorage, applySearchUpdates, SearchData } from "@/lib/search-storage";

interface UseVehicleSearchOptions {
  persist?: "always" | "onUpdate";
}

interface UseVehicleSearchReturn {
  searchState: SearchData & { isHydrated: boolean };
  updateSearchField: <K extends keyof SearchData>(field: K, value: SearchData[K]) => void;
  updateSearchFields: (updates: Partial<SearchData>) => void;
  isValidSearchPeriod: boolean;
}

export function useVehicleSearch({
  persist = "always",
}: UseVehicleSearchOptions = {}): UseVehicleSearchReturn {
  // Initialize with defaults to avoid hydration issues
  const [searchState, setSearchState] = useState<SearchData & { isHydrated: boolean }>({
    deliveryLocation: searchStorage.getDefaultLocation(),
    pickupDate: undefined,
    pickupTime: searchStorage.getDefaultTime(),
    restitutionLocation: searchStorage.getDefaultLocation(),
    returnDate: undefined,
    returnTime: searchStorage.getDefaultTime(),
    isHydrated: false,
  });
  const [hasUserUpdate, setHasUserUpdate] = useState(false);

  // Load initial state from localStorage after hydration
  useEffect(() => {
    const storedData = searchStorage.load();

    setSearchState(prev => ({
      ...prev,
      ...storedData,
      isHydrated: true,
    }));
  }, []);

  // Save to localStorage when search criteria changes (only after hydration,
  // and only after an explicit user update when persist is "onUpdate")
  useEffect(() => {
    if (!searchState.isHydrated) return;
    if (persist === "onUpdate" && !hasUserUpdate) return;

    const { isHydrated, ...dataToSave } = searchState;
    searchStorage.save(dataToSave);
  }, [searchState, persist, hasUserUpdate]);

  // Update one or more search fields, keeping the return date on or after the pickup date
  const updateSearchFields = useCallback((updates: Partial<SearchData>) => {
    setHasUserUpdate(true);
    setSearchState(prev => ({
      ...applySearchUpdates(prev, updates),
      isHydrated: prev.isHydrated,
    }));
  }, []);

  const updateSearchField = useCallback(<K extends keyof SearchData>(
    field: K,
    value: SearchData[K]
  ) => {
    updateSearchFields({ [field]: value });
  }, [updateSearchFields]);

  // Check if search period is valid
  const isValidSearchPeriod = Boolean(
    searchState.pickupDate &&
    searchState.returnDate &&
    searchState.returnDate > searchState.pickupDate
  );

  return {
    searchState,
    updateSearchField,
    updateSearchFields,
    isValidSearchPeriod,
  };
}
