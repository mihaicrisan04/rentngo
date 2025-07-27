"use client";

import { VehicleFilters } from "@/components/vehicle/vehicle-filters";
import { VehicleFiltersSkeleton } from "@/components/vehicle/vehicle-filters-skeleton";
import { PageLayout } from "@/components/layout/page-layout";
import { VehicleSearchForm } from "@/components/vehicle/vehicle-search-form";
import { VehicleSearchFormSkeleton } from "@/components/vehicle/vehicle-search-form-skeleton";
import { VehicleListDisplay } from "@/components/vehicle/vehicle-list-display";
import { useVehicleSearch } from "@/hooks/useVehicleSearch";
import { useVehicleList } from "@/hooks/useVehicleList";

export default function CarsPage() {
  // Use custom hooks for state management
  const { searchState, updateSearchField } = useVehicleSearch();
  const { allVehicles, displayedVehicles, isLoading, error, setDisplayedVehicles } = useVehicleList(searchState.isHydrated);

  return (
    <PageLayout className="p-4 md:p-8 flex flex-col gap-8">
      <div className="max-w-7xl mx-auto w-full">
        {/* Search Form - show skeleton while loading or not hydrated */}
        {(!searchState.isHydrated || isLoading) ? (
          <VehicleSearchFormSkeleton />
        ) : (
          <VehicleSearchForm
            searchState={searchState}
            updateSearchField={updateSearchField}
            isLoading={isLoading}
          />
        )}
        
        {/* Filters - show skeleton while loading or when vehicles aren't loaded */}
        {(!searchState.isHydrated || isLoading || !allVehicles) ? (
          <VehicleFiltersSkeleton />
        ) : (
          <VehicleFilters 
            allVehicles={allVehicles} 
            onFilterChange={setDisplayedVehicles} 
          />
        )}
        
        {/* Vehicle List Display - already has internal skeleton handling */}
        <VehicleListDisplay
          vehicles={displayedVehicles}
          isLoading={isLoading}
          isHydrated={searchState.isHydrated}
          error={error}
          searchState={searchState}
        />
      </div>
    </PageLayout>
  );
} 
