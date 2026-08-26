"use client";

import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Vehicle } from "@/types/vehicle";
import { useTranslations } from "next-intl";
import {
  FILTER_CATEGORIES,
  FilterCategory,
  FilterOption,
  FilterState,
} from "@/hooks/use-vehicle-filters";

interface CategoryUiConfig {
  labelKey: string;
  emptyKey: string;
  capitalize: boolean;
  scrollable: boolean;
}

const CATEGORY_UI: Record<FilterCategory, CategoryUiConfig> = {
  brands: {
    labelKey: "brand",
    emptyKey: "noBrands",
    capitalize: false,
    scrollable: true,
  },
  fuelTypes: {
    labelKey: "fuelType",
    emptyKey: "noFuelTypes",
    capitalize: true,
    scrollable: false,
  },
  transmissions: {
    labelKey: "transmission",
    emptyKey: "noTransmissions",
    capitalize: true,
    scrollable: false,
  },
  types: {
    labelKey: "type",
    emptyKey: "noTypes",
    capitalize: true,
    scrollable: false,
  },
};

interface VehicleFiltersProps {
  allVehicles: Vehicle[] | null;
  filterState: FilterState;
  filterOptions: Record<FilterCategory, FilterOption[]>;
  toggleFilter: (category: FilterCategory, value: string) => void;
  removeFilter: (category: FilterCategory, value: string) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export function VehicleFilters({
  allVehicles,
  filterState,
  filterOptions,
  toggleFilter,
  removeFilter,
  clearAllFilters,
  hasActiveFilters,
  activeFilterCount,
}: VehicleFiltersProps) {
  const t = useTranslations("filters");
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!allVehicles || allVehicles.length === 0) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <div className="mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full sm:w-auto"
        >
          <Filter className="mr-2 h-4 w-4" />
          {isExpanded ? t("hideFilters") : t("showFilters")}
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {activeFilterCount}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Filter Options Card - Collapsible */}
      {isExpanded && (
        <Card className="mb-3 shadow-lg bg-accent">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FILTER_CATEGORIES.map((category) => {
                const ui = CATEGORY_UI[category];
                const options = filterOptions[category];
                return (
                  <div key={category}>
                    <Label className="text-sm font-semibold mb-2 block">
                      {t(ui.labelKey)}
                    </Label>
                    <div
                      className={`space-y-2 ${
                        ui.scrollable ? "max-h-48 overflow-y-auto pr-2" : ""
                      }`}
                    >
                      {options.map((option) => (
                        <FilterCheckboxItem
                          key={option.value}
                          option={option}
                          checked={filterState[category].includes(option.value)}
                          onCheckedChange={() =>
                            toggleFilter(category, option.value)
                          }
                          capitalize={ui.capitalize}
                        />
                      ))}
                      {options.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          {t(ui.emptyKey)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Chips - Below Filter Card */}
      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {t("activeFilters")} ({activeFilterCount}):
          </span>

          {FILTER_CATEGORIES.map((category) =>
            filterState[category].map((value) => (
              <Button
                key={`${category}-${value}`}
                variant="secondary"
                size="sm"
                className={`h-7 px-2 text-xs ${
                  CATEGORY_UI[category].capitalize ? "capitalize" : ""
                }`}
                onClick={() => removeFilter(category, value)}
              >
                {value}
                <X className="ml-1 h-3 w-3" />
              </Button>
            )),
          )}

          {/* Clear all button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
            onClick={clearAllFilters}
          >
            {t("clearAll")}
          </Button>
        </div>
      )}
    </>
  );
}

// Reusable checkbox filter item component
interface FilterCheckboxItemProps {
  option: FilterOption;
  checked: boolean;
  onCheckedChange: () => void;
  capitalize?: boolean;
}

const FilterCheckboxItem = React.memo(function FilterCheckboxItem({
  option,
  checked,
  onCheckedChange,
  capitalize = false,
}: FilterCheckboxItemProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={`filter-${option.value}`}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={option.count === 0}
      />
      <label
        htmlFor={`filter-${option.value}`}
        className={`text-sm font-normal cursor-pointer flex-1 ${
          capitalize ? "capitalize" : ""
        } ${option.count === 0 ? "text-muted-foreground line-through" : ""}`}
      >
        {option.label}
        <span className="ml-1 text-xs text-muted-foreground">
          ({option.count})
        </span>
      </label>
    </div>
  );
});
