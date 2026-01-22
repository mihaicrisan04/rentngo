"use client";

import { useState, useEffect, useCallback } from "react";
import { VehicleFilters } from "@/components/features/vehicles/vehicle-filters";
import { VehicleSearchForm } from "@/components/features/vehicles/vehicle-search-form";
import { VehicleListDisplayWithPreloadedImages } from "@/components/features/vehicles/vehicle-list-display-with-preloaded-images";
import { useVehicleSearch } from "@/hooks/use-vehicle-search";
import { Vehicle } from "@/types/vehicle";
import { Skeleton } from "@/components/ui/skeleton";

interface VehicleWithImageUrl extends Vehicle {
  imageUrl: string | null;
  className?: string;
  classDisplayName?: string;
  classSortIndexFromClass?: number;
}

interface CarsPageClientProps {
  initialVehicles: VehicleWithImageUrl[];
}

export function CarsPageClient({ initialVehicles }: CarsPageClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { searchState, updateSearchField } = useVehicleSearch();
  const [displayedVehicles, setDisplayedVehicles] =
    useState<VehicleWithImageUrl[]>(initialVehicles);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFilterChange = useCallback((filteredVehicles: Vehicle[] | null) => {
    if (filteredVehicles === null) {
      setDisplayedVehicles(initialVehicles);
    } else {
      const filteredWithImages = filteredVehicles.map((vehicle) => {
        const original = initialVehicles.find((v) => v._id === vehicle._id);
        return {
          ...vehicle,
          imageUrl: original?.imageUrl ?? null,
          className: original?.className,
          classDisplayName: original?.classDisplayName,
          classSortIndexFromClass: original?.classSortIndexFromClass,
        } as VehicleWithImageUrl;
      });
      setDisplayedVehicles(filteredWithImages);
    }
  }, [initialVehicles]);

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <div className="max-w-6xl mx-auto w-full">
        {isMounted ? (
          <VehicleSearchForm
            searchState={searchState}
            updateSearchField={updateSearchField}
            isLoading={false}
          />
        ) : (
          <div className="mb-6">
            <div className="mb-4 text-center">
              <Skeleton className="h-7 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
            <div className="rounded-lg border bg-card shadow-md p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex flex-col gap-4 w-full lg:w-1/2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex flex-col gap-4 w-full lg:w-1/2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </div>
        )}

        <VehicleFilters
          allVehicles={initialVehicles}
          onFilterChange={handleFilterChange}
        />

        <VehicleListDisplayWithPreloadedImages
          vehicles={displayedVehicles}
          searchState={searchState}
        />
      </div>
    </div>
  );
}