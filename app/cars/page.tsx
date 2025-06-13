"use client";

import { VehicleFilters } from "@/components/VehicleFilters";
import { PageLayout } from "@/components/layout/PageLayout";
import { VehicleSearchForm } from "@/components/vehicle/VehicleSearchForm";
import { VehicleListDisplay } from "@/components/vehicle/VehicleListDisplay";
import { useVehicleSearch } from "@/hooks/useVehicleSearch";
import { useVehicleList } from "@/hooks/useVehicleList";
import { Vehicle } from "@/types/vehicle";

export default function CarsPage() {
  // Use custom hooks for state management
  const { searchState, updateSearchField, isValidSearchPeriod } = useVehicleSearch();
  const { allVehicles, displayedVehicles, isLoading, error, setDisplayedVehicles } = useVehicleList(searchState.isHydrated);

  return (
    <PageLayout className="p-4 md:p-8 flex flex-col gap-8">
      <div className="max-w-7xl mx-auto w-full">
        <VehicleSearchForm
          searchState={searchState}
          updateSearchField={updateSearchField}
          isLoading={isLoading}
        />
        
        <VehicleFilters 
          allVehicles={allVehicles} 
          onFilterChange={setDisplayedVehicles} 
        />
        
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