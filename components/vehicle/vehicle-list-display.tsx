"use client";

import { VehicleCard } from "@/components/vehicle/vehicle-card";
import { VehicleCardSkeleton } from "@/components/vehicle/vehicle-card-skeleton";
import { Vehicle } from "@/types/vehicle";
import { SearchData } from "@/lib/searchStorage";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";

interface VehicleListDisplayProps {
  vehicles: Vehicle[] | null;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  searchState: SearchData;
}

// Extended vehicle type with class information
interface VehicleWithClass extends Vehicle {
  className?: string;
  classDisplayName?: string;
  classSortIndexFromClass?: number;
  classSortIndex?: number;
}

// Helper function to group vehicles by class
function groupVehiclesByClass(
  vehicles: VehicleWithClass[],
): Record<string, VehicleWithClass[]> {
  const grouped: Record<string, VehicleWithClass[]> = {
    other: [], // Fallback for vehicles without a class
  };

  vehicles.forEach((vehicle) => {
    if (!vehicle || typeof vehicle._id !== "string") {
      console.warn("Skipping invalid vehicle data:", vehicle);
      return;
    }

    // Use className from the database (fetched via the new query)
    const classKey = vehicle.className || "other";

    if (!grouped[classKey]) {
      grouped[classKey] = [];
    }
    grouped[classKey].push(vehicle);
  });

  return grouped;
}

// Helper function to sort vehicles within a class by classSortIndex
function sortVehiclesInClass(vehicles: VehicleWithClass[]): VehicleWithClass[] {
  return [...vehicles].sort((a, b) => {
    const aSortIndex = a.classSortIndex ?? 999999;
    const bSortIndex = b.classSortIndex ?? 999999;
    return aSortIndex - bSortIndex;
  });
}

// Helper function to get unique classes in order
function getOrderedClasses(vehicles: VehicleWithClass[]): Array<{
  key: string;
  displayName: string;
  sortIndex: number;
}> {
  const classMap = new Map<
    string,
    { displayName: string; sortIndex: number }
  >();

  vehicles.forEach((vehicle) => {
    const classKey = vehicle.className || "other";

    if (!classMap.has(classKey)) {
      classMap.set(classKey, {
        displayName: vehicle.classDisplayName || vehicle.className || "Other",
        sortIndex: vehicle.classSortIndexFromClass ?? 999999,
      });
    }
  });

  // Convert to array and sort by sortIndex
  const classArray = Array.from(classMap.entries()).map(([key, value]) => ({
    key,
    displayName: value.displayName,
    sortIndex: value.sortIndex,
  }));

  return classArray.sort((a, b) => a.sortIndex - b.sortIndex);
}

function VehicleClassSection({
  displayName,
  vehicles,
  searchState,
}: {
  displayName: string;
  vehicles: VehicleWithClass[];
  searchState: SearchData;
}) {
  // Sort vehicles within this class by their classSortIndex
  const sortedVehicles = sortVehiclesInClass(vehicles);

  return (
    <div className="mb-8">
      {/* Class header with separator line */}
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold text-foreground whitespace-nowrap">
          {displayName}
        </h2>
        <Separator className="flex-1" />
      </div>

      {/* Vehicles grid for this class */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedVehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle._id}
            vehicle={vehicle}
            pickupDate={searchState.pickupDate || null}
            returnDate={searchState.returnDate || null}
            deliveryLocation={searchState.deliveryLocation || null}
            restitutionLocation={searchState.restitutionLocation || null}
            pickupTime={searchState.pickupTime}
            returnTime={searchState.returnTime}
          />
        ))}
      </div>
    </div>
  );
}

function VehiclesByClass({
  vehicles,
  searchState,
}: {
  vehicles: VehicleWithClass[];
  searchState: SearchData;
}) {
  const groupedVehicles = groupVehiclesByClass(vehicles);
  const orderedClasses = getOrderedClasses(vehicles);

  // Filter to only show classes that have vehicles
  const availableClasses = orderedClasses.filter((classInfo) => {
    const vehiclesInClass = groupedVehicles[classInfo.key];
    return vehiclesInClass && vehiclesInClass.length > 0;
  });

  return (
    <div>
      {availableClasses.map((classInfo) => {
        const vehiclesInClass = groupedVehicles[classInfo.key];
        return (
          <VehicleClassSection
            key={classInfo.key}
            displayName={classInfo.displayName}
            vehicles={vehiclesInClass || []}
            searchState={searchState}
          />
        );
      })}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }, (_, index) => (
        <VehicleCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function VehicleListDisplay({
  vehicles,
  isLoading,
  isHydrated,
  error,
  searchState,
}: VehicleListDisplayProps) {
  const t = useTranslations("vehicleListDisplay");

  return (
    <div>
      {/* <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-center">
        {displayTitle}
      </h1> */}

      {error && (
        <div className="text-center mb-4">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {/* Show skeleton loading while not hydrated or while loading */}
      {(!isHydrated || isLoading) && <LoadingSkeleton />}

      {/* Show error state */}
      {isHydrated && !isLoading && vehicles === null && error && (
        <p className="text-center text-destructive">
          {t("couldNotLoadVehicles")}
        </p>
      )}

      {/* Show empty state */}
      {isHydrated &&
        !isLoading &&
        vehicles !== null &&
        vehicles.length === 0 && (
          <p className="text-center text-muted-foreground">
            {t("noVehiclesFoundMessage")}
          </p>
        )}

      {/* Show vehicles */}
      {isHydrated && !isLoading && vehicles && vehicles.length > 0 && (
        <VehiclesByClass
          vehicles={vehicles as VehicleWithClass[]}
          searchState={searchState}
        />
      )}
    </div>
  );
}
