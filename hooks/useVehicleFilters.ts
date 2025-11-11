import { useState, useMemo, useCallback } from "react";
import { Vehicle } from "@/types/vehicle";

// Filter state structure
export interface FilterState {
  brands: string[];
  fuelTypes: string[];
  transmissions: string[];
  types: string[];
}

// Filter option with count
export interface FilterOption {
  label: string;
  value: string;
  count: number;
}

// Normalize string for comparison (trim, capitalize first letter)
function normalizeString(str: string | undefined | null): string {
  if (!str) return "";
  const trimmed = str.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

interface UseVehicleFiltersReturn {
  filterState: FilterState;
  filteredVehicles: Vehicle[] | null;
  brandOptions: FilterOption[];
  fuelTypeOptions: FilterOption[];
  transmissionOptions: FilterOption[];
  typeOptions: FilterOption[];
  toggleBrand: (brand: string) => void;
  toggleFuelType: (fuelType: string) => void;
  toggleTransmission: (transmission: string) => void;
  toggleType: (type: string) => void;
  removeBrand: (brand: string) => void;
  removeFuelType: (fuelType: string) => void;
  removeTransmission: (transmission: string) => void;
  removeType: (type: string) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export function useVehicleFilters(
  allVehicles: Vehicle[] | null
): UseVehicleFiltersReturn {
  const [filterState, setFilterState] = useState<FilterState>({
    brands: [],
    fuelTypes: [],
    transmissions: [],
    types: [],
  });

  // Extract and normalize unique values with counts
  const brandOptions = useMemo<FilterOption[]>(() => {
    if (!allVehicles) return [];

    const brandCounts = new Map<string, number>();

    allVehicles.forEach((vehicle) => {
      const normalized = normalizeString(vehicle.make);
      if (normalized) {
        brandCounts.set(normalized, (brandCounts.get(normalized) || 0) + 1);
      }
    });

    return Array.from(brandCounts.entries())
      .map(([brand, count]) => ({
        label: brand,
        value: brand,
        count,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [allVehicles]);

  const fuelTypeOptions = useMemo<FilterOption[]>(() => {
    if (!allVehicles) return [];

    const fuelTypeCounts = new Map<string, number>();

    allVehicles.forEach((vehicle) => {
      if (vehicle.fuelType) {
        fuelTypeCounts.set(
          vehicle.fuelType,
          (fuelTypeCounts.get(vehicle.fuelType) || 0) + 1
        );
      }
    });

    return Array.from(fuelTypeCounts.entries())
      .map(([fuelType, count]) => ({
        label: fuelType,
        value: fuelType,
        count,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [allVehicles]);

  const transmissionOptions = useMemo<FilterOption[]>(() => {
    if (!allVehicles) return [];

    const transmissionCounts = new Map<string, number>();

    allVehicles.forEach((vehicle) => {
      if (vehicle.transmission) {
        transmissionCounts.set(
          vehicle.transmission,
          (transmissionCounts.get(vehicle.transmission) || 0) + 1
        );
      }
    });

    return Array.from(transmissionCounts.entries())
      .map(([transmission, count]) => ({
        label: transmission,
        value: transmission,
        count,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [allVehicles]);

  const typeOptions = useMemo<FilterOption[]>(() => {
    if (!allVehicles) return [];

    const typeCounts = new Map<string, number>();

    allVehicles.forEach((vehicle) => {
      if (vehicle.type) {
        typeCounts.set(vehicle.type, (typeCounts.get(vehicle.type) || 0) + 1);
      }
    });

    return Array.from(typeCounts.entries())
      .map(([type, count]) => ({
        label: type,
        value: type,
        count,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [allVehicles]);

  // Apply filters to vehicle list
  const filteredVehicles = useMemo<Vehicle[] | null>(() => {
    if (!allVehicles) return null;

    const { brands, fuelTypes, transmissions, types } = filterState;

    // If no filters active, return all vehicles
    if (
      brands.length === 0 &&
      fuelTypes.length === 0 &&
      transmissions.length === 0 &&
      types.length === 0
    ) {
      return allVehicles;
    }

    // Apply filters with OR logic within category, AND across categories
    return allVehicles.filter((vehicle) => {
      // Brand filter (OR logic)
      const matchesBrand =
        brands.length === 0 ||
        brands.some((b) => normalizeString(vehicle.make) === normalizeString(b));

      // Fuel type filter (OR logic)
      const matchesFuel =
        fuelTypes.length === 0 || fuelTypes.includes(vehicle.fuelType || "");

      // Transmission filter (OR logic)
      const matchesTransmission =
        transmissions.length === 0 ||
        transmissions.includes(vehicle.transmission || "");

      // Type filter (OR logic)
      const matchesType =
        types.length === 0 || types.includes(vehicle.type || "");

      // AND all categories together
      return matchesBrand && matchesFuel && matchesTransmission && matchesType;
    });
  }, [allVehicles, filterState]);

  // Toggle functions for multi-select
  const toggleBrand = useCallback((brand: string) => {
    setFilterState((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  }, []);

  const toggleFuelType = useCallback((fuelType: string) => {
    setFilterState((prev) => ({
      ...prev,
      fuelTypes: prev.fuelTypes.includes(fuelType)
        ? prev.fuelTypes.filter((f) => f !== fuelType)
        : [...prev.fuelTypes, fuelType],
    }));
  }, []);

  const toggleTransmission = useCallback((transmission: string) => {
    setFilterState((prev) => ({
      ...prev,
      transmissions: prev.transmissions.includes(transmission)
        ? prev.transmissions.filter((t) => t !== transmission)
        : [...prev.transmissions, transmission],
    }));
  }, []);

  const toggleType = useCallback((type: string) => {
    setFilterState((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  }, []);

  // Remove functions for filter chips
  const removeBrand = useCallback((brand: string) => {
    setFilterState((prev) => ({
      ...prev,
      brands: prev.brands.filter((b) => b !== brand),
    }));
  }, []);

  const removeFuelType = useCallback((fuelType: string) => {
    setFilterState((prev) => ({
      ...prev,
      fuelTypes: prev.fuelTypes.filter((f) => f !== fuelType),
    }));
  }, []);

  const removeTransmission = useCallback((transmission: string) => {
    setFilterState((prev) => ({
      ...prev,
      transmissions: prev.transmissions.filter((t) => t !== transmission),
    }));
  }, []);

  const removeType = useCallback((type: string) => {
    setFilterState((prev) => ({
      ...prev,
      types: prev.types.filter((t) => t !== type),
    }));
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilterState({
      brands: [],
      fuelTypes: [],
      transmissions: [],
      types: [],
    });
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(
    () =>
      filterState.brands.length > 0 ||
      filterState.fuelTypes.length > 0 ||
      filterState.transmissions.length > 0 ||
      filterState.types.length > 0,
    [filterState]
  );

  // Count active filters
  const activeFilterCount = useMemo(
    () =>
      filterState.brands.length +
      filterState.fuelTypes.length +
      filterState.transmissions.length +
      filterState.types.length,
    [filterState]
  );

  return {
    filterState,
    filteredVehicles,
    brandOptions,
    fuelTypeOptions,
    transmissionOptions,
    typeOptions,
    toggleBrand,
    toggleFuelType,
    toggleTransmission,
    toggleType,
    removeBrand,
    removeFuelType,
    removeTransmission,
    removeType,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount,
  };
}