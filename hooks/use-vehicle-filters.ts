import { useState, useMemo, useCallback } from "react";
import { Vehicle } from "@/types/vehicle";

export const FILTER_CATEGORIES = [
  "brands",
  "fuelTypes",
  "transmissions",
  "types",
] as const;

export type FilterCategory = (typeof FILTER_CATEGORIES)[number];

export type FilterState = Record<FilterCategory, string[]>;

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

const categoryValue: Record<FilterCategory, (vehicle: Vehicle) => string> = {
  brands: (vehicle) => normalizeString(vehicle.make),
  fuelTypes: (vehicle) => vehicle.fuelType || "",
  transmissions: (vehicle) => vehicle.transmission || "",
  types: (vehicle) => vehicle.type || "",
};

const EMPTY_FILTER_STATE: FilterState = {
  brands: [],
  fuelTypes: [],
  transmissions: [],
  types: [],
};

function matchesCategory(
  vehicle: Vehicle,
  category: FilterCategory,
  selected: string[]
): boolean {
  if (selected.length === 0) return true;
  const value = categoryValue[category](vehicle);
  if (category === "brands") {
    return selected.some((s) => value === normalizeString(s));
  }
  return selected.includes(value);
}

interface UseVehicleFiltersReturn<V extends Vehicle> {
  filterState: FilterState;
  filteredVehicles: V[] | null;
  filterOptions: Record<FilterCategory, FilterOption[]>;
  toggleFilter: (category: FilterCategory, value: string) => void;
  removeFilter: (category: FilterCategory, value: string) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export function useVehicleFilters<V extends Vehicle>(
  allVehicles: V[] | null
): UseVehicleFiltersReturn<V> {
  const [filterState, setFilterState] =
    useState<FilterState>(EMPTY_FILTER_STATE);

  // Extract unique values with counts, per category
  const filterOptions = useMemo(() => {
    const options = {} as Record<FilterCategory, FilterOption[]>;
    for (const category of FILTER_CATEGORIES) {
      const counts = new Map<string, number>();
      allVehicles?.forEach((vehicle) => {
        const value = categoryValue[category](vehicle);
        if (value) {
          counts.set(value, (counts.get(value) || 0) + 1);
        }
      });
      options[category] = Array.from(counts.entries())
        .map(([value, count]) => ({ label: value, value, count }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    return options;
  }, [allVehicles]);

  // Apply filters with OR logic within a category, AND across categories
  const filteredVehicles = useMemo<V[] | null>(() => {
    if (!allVehicles) return null;

    if (FILTER_CATEGORIES.every((c) => filterState[c].length === 0)) {
      return allVehicles;
    }

    return allVehicles.filter((vehicle) =>
      FILTER_CATEGORIES.every((category) =>
        matchesCategory(vehicle, category, filterState[category])
      )
    );
  }, [allVehicles, filterState]);

  const toggleFilter = useCallback(
    (category: FilterCategory, value: string) => {
      setFilterState((prev) => ({
        ...prev,
        [category]: prev[category].includes(value)
          ? prev[category].filter((v) => v !== value)
          : [...prev[category], value],
      }));
    },
    []
  );

  const removeFilter = useCallback(
    (category: FilterCategory, value: string) => {
      setFilterState((prev) => ({
        ...prev,
        [category]: prev[category].filter((v) => v !== value),
      }));
    },
    []
  );

  const clearAllFilters = useCallback(() => {
    setFilterState(EMPTY_FILTER_STATE);
  }, []);

  const activeFilterCount = useMemo(
    () =>
      FILTER_CATEGORIES.reduce(
        (total, category) => total + filterState[category].length,
        0
      ),
    [filterState]
  );

  return {
    filterState,
    filteredVehicles,
    filterOptions,
    toggleFilter,
    removeFilter,
    clearAllFilters,
    hasActiveFilters: activeFilterCount > 0,
    activeFilterCount,
  };
}
