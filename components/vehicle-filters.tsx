"use client";

import * as React from "react";
import { Id } from "../convex/_generated/dataModel"; // Corrected path
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { Vehicle } from "@/types/vehicle";

interface VehicleFiltersProps {
  allVehicles: Vehicle[] | null;
  onFilterChange: (filteredVehicles: Vehicle[] | null) => void;
}

export function VehicleFilters({ allVehicles, onFilterChange }: VehicleFiltersProps) {
  const [brandFilter, setBrandFilter] = React.useState<string>("all");
  const [fuelTypeFilter, setFuelTypeFilter] = React.useState<string>("all");
  const [transmissionFilter, setTransmissionFilter] = React.useState<string>("all");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");

  // Extract unique brands
  const brands = React.useMemo(() => {
    if (!allVehicles) return [];
    const uniqueBrands = new Set(allVehicles.map(v => v.make).filter(Boolean));
    return ["all", ...Array.from(uniqueBrands)];
  }, [allVehicles]);

  // Extract unique fuel types
  const fuelTypes = React.useMemo(() => {
    if (!allVehicles) return [];
    const uniqueFuelTypes = new Set(allVehicles.map(v => v.fuelType).filter(Boolean) as string[]);
    return ["all", ...Array.from(uniqueFuelTypes)];
  }, [allVehicles]);

  // Extract unique transmissions
  const transmissions = React.useMemo(() => {
    if (!allVehicles) return [];
    const uniqueTransmissions = new Set(allVehicles.map(v => v.transmission).filter(Boolean) as string[]); 
    return ["all", ...Array.from(uniqueTransmissions)];
  }, [allVehicles]);

  // Extract unique vehicle types
  const vehicleTypes = React.useMemo(() => {
    if (!allVehicles) return [];
    const uniqueTypes = new Set(allVehicles.map(v => v.type).filter(Boolean) as string[]); 
    return ["all", ...Array.from(uniqueTypes)];
  }, [allVehicles]);

  React.useEffect(() => {
    if (!allVehicles) {
      onFilterChange(null);
      return;
    }

    let filtered = [...allVehicles];

    if (brandFilter !== "all") {
      filtered = filtered.filter(v => v.make === brandFilter);
    }
    if (fuelTypeFilter !== "all") {
      filtered = filtered.filter(v => v.fuelType === fuelTypeFilter);
    }
    if (transmissionFilter !== "all") {
      filtered = filtered.filter(v => v.transmission === transmissionFilter); // Assumes engineType is transmission
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter(v => v.type === typeFilter);
    }

    onFilterChange(filtered);
  }, [allVehicles, brandFilter, fuelTypeFilter, transmissionFilter, typeFilter, onFilterChange]);

  const resetFilters = () => {
    setBrandFilter("all");
    setFuelTypeFilter("all");
    setTransmissionFilter("all");
    setTypeFilter("all");
  };
  
  const hasActiveFilters = brandFilter !== "all" || fuelTypeFilter !== "all" || transmissionFilter !== "all" || typeFilter !== "all";

  if (!allVehicles || allVehicles.length === 0) {
    return null; // Don't show filters if there are no vehicles to filter
  }

  return (
    <Card className="mb-8 shadow-lg bg-accent">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl md:text-2xl">
            Filter Options
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="secondary" size="sm" onClick={resetFilters} className="text-sm">
              <XIcon className="mr-1 h-4 w-4" /> Reset Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="brand-filter" className="text-sm font-medium">Brand</Label>
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger id="brand-filter" className="mt-1">
              <SelectValue placeholder="Select Brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map(brand => (
                <SelectItem key={brand} value={brand} className="capitalize">
                  {brand === "all" ? "All Brands" : brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="fuel-type-filter" className="text-sm font-medium">Fuel Type</Label>
          <Select value={fuelTypeFilter} onValueChange={setFuelTypeFilter}>
            <SelectTrigger id="fuel-type-filter" className="mt-1">
              <SelectValue placeholder="Select Fuel Type" />
            </SelectTrigger>
            <SelectContent>
              {fuelTypes.map(fuel => (
                <SelectItem key={fuel} value={fuel} className="capitalize">
                  {fuel === "all" ? "All Fuel Types" : fuel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="transmission-filter" className="text-sm font-medium">Transmission</Label>
          <Select value={transmissionFilter} onValueChange={setTransmissionFilter}>
            <SelectTrigger id="transmission-filter" className="mt-1">
              <SelectValue placeholder="Select Transmission" />
            </SelectTrigger>
            <SelectContent>
              {transmissions.map(trans => (
                <SelectItem key={trans} value={trans} className="capitalize">
                  {trans === "all" ? "All Transmissions" : trans}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Vehicle Type Filter */}
        <div>
          <Label htmlFor="type-filter" className="text-sm font-medium">Type</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger id="type-filter" className="mt-1">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              {vehicleTypes.map(type => (
                <SelectItem key={type} value={type} className="capitalize">
                  {type === "all" ? "All Types" : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
} 