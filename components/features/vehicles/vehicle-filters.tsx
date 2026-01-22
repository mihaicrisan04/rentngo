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
  useVehicleFilters,
  FilterOption,
} from "@/hooks/use-vehicle-filters";

interface VehicleFiltersProps {
  allVehicles: Vehicle[] | null;
  onFilterChange: (filteredVehicles: Vehicle[] | null) => void;
}

export function VehicleFilters({
  allVehicles,
  onFilterChange,
}: VehicleFiltersProps) {
  const t = useTranslations("filters");
  const [isExpanded, setIsExpanded] = React.useState(false);

  const {
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
  } = useVehicleFilters(allVehicles);

  // Update parent component when filtered vehicles change
  React.useEffect(() => {
    onFilterChange(filteredVehicles);
  }, [filteredVehicles, onFilterChange]);

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
              {/* Brand Filter */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">
                  {t("brand")}
                </Label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {brandOptions.map((option) => (
                    <FilterCheckboxItem
                      key={option.value}
                      option={option}
                      checked={filterState.brands.includes(option.value)}
                      onCheckedChange={() => toggleBrand(option.value)}
                    />
                  ))}
                  {brandOptions.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t("noBrands")}
                    </p>
                  )}
                </div>
              </div>

              {/* Fuel Type Filter */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">
                  {t("fuelType")}
                </Label>
                <div className="space-y-2">
                  {fuelTypeOptions.map((option) => (
                    <FilterCheckboxItem
                      key={option.value}
                      option={option}
                      checked={filterState.fuelTypes.includes(option.value)}
                      onCheckedChange={() => toggleFuelType(option.value)}
                      capitalize
                    />
                  ))}
                  {fuelTypeOptions.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t("noFuelTypes")}
                    </p>
                  )}
                </div>
              </div>

              {/* Transmission Filter */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">
                  {t("transmission")}
                </Label>
                <div className="space-y-2">
                  {transmissionOptions.map((option) => (
                    <FilterCheckboxItem
                      key={option.value}
                      option={option}
                      checked={filterState.transmissions.includes(option.value)}
                      onCheckedChange={() => toggleTransmission(option.value)}
                      capitalize
                    />
                  ))}
                  {transmissionOptions.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t("noTransmissions")}
                    </p>
                  )}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">
                  {t("type")}
                </Label>
                <div className="space-y-2">
                  {typeOptions.map((option) => (
                    <FilterCheckboxItem
                      key={option.value}
                      option={option}
                      checked={filterState.types.includes(option.value)}
                      onCheckedChange={() => toggleType(option.value)}
                      capitalize
                    />
                  ))}
                  {typeOptions.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t("noTypes")}
                    </p>
                  )}
                </div>
              </div>
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

          {/* Brand chips */}
          {filterState.brands.map((brand) => (
            <Button
              key={`brand-${brand}`}
              variant="secondary"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => removeBrand(brand)}
            >
              {brand}
              <X className="ml-1 h-3 w-3" />
            </Button>
          ))}

          {/* Fuel type chips */}
          {filterState.fuelTypes.map((fuelType) => (
            <Button
              key={`fuel-${fuelType}`}
              variant="secondary"
              size="sm"
              className="h-7 px-2 text-xs capitalize"
              onClick={() => removeFuelType(fuelType)}
            >
              {fuelType}
              <X className="ml-1 h-3 w-3" />
            </Button>
          ))}

          {/* Transmission chips */}
          {filterState.transmissions.map((transmission) => (
            <Button
              key={`transmission-${transmission}`}
              variant="secondary"
              size="sm"
              className="h-7 px-2 text-xs capitalize"
              onClick={() => removeTransmission(transmission)}
            >
              {transmission}
              <X className="ml-1 h-3 w-3" />
            </Button>
          ))}

          {/* Type chips */}
          {filterState.types.map((type) => (
            <Button
              key={`type-${type}`}
              variant="secondary"
              size="sm"
              className="h-7 px-2 text-xs capitalize"
              onClick={() => removeType(type)}
            >
              {type}
              <X className="ml-1 h-3 w-3" />
            </Button>
          ))}

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

function FilterCheckboxItem({
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
}