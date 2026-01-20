"use client";

import { VehicleCardWithPreloadedImage } from "@/components/features/vehicles/vehicle-card-with-preloaded-image";
import { Vehicle } from "@/types/vehicle";
import { SearchData } from "@/lib/searchStorage";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";

interface VehicleWithImageUrl extends Vehicle {
  imageUrl: string | null;
  className?: string;
  classDisplayName?: string;
  classSortIndexFromClass?: number;
  classSortIndex?: number;
}

interface VehicleListDisplayWithPreloadedImagesProps {
  vehicles: VehicleWithImageUrl[];
  searchState: SearchData;
}

function groupVehiclesByClass(
  vehicles: VehicleWithImageUrl[]
): Record<string, VehicleWithImageUrl[]> {
  const grouped: Record<string, VehicleWithImageUrl[]> = {
    other: [],
  };

  vehicles.forEach((vehicle) => {
    if (!vehicle || typeof vehicle._id !== "string") {
      console.warn("Skipping invalid vehicle data:", vehicle);
      return;
    }

    const classKey = vehicle.className || "other";

    if (!grouped[classKey]) {
      grouped[classKey] = [];
    }
    grouped[classKey].push(vehicle);
  });

  return grouped;
}

function sortVehiclesInClass(
  vehicles: VehicleWithImageUrl[]
): VehicleWithImageUrl[] {
  return [...vehicles].sort((a, b) => {
    const aSortIndex = a.classSortIndex ?? 999999;
    const bSortIndex = b.classSortIndex ?? 999999;
    return aSortIndex - bSortIndex;
  });
}

function getOrderedClasses(vehicles: VehicleWithImageUrl[]): Array<{
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
  vehicles: VehicleWithImageUrl[];
  searchState: SearchData;
}) {
  const sortedVehicles = sortVehiclesInClass(vehicles);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold text-foreground whitespace-nowrap">
          {displayName}
        </h2>
        <Separator className="flex-1" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedVehicles.map((vehicle) => (
          <VehicleCardWithPreloadedImage
            key={vehicle._id}
            vehicle={vehicle}
            preloadedImageUrl={vehicle.imageUrl}
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
  vehicles: VehicleWithImageUrl[];
  searchState: SearchData;
}) {
  const groupedVehicles = groupVehiclesByClass(vehicles);
  const orderedClasses = getOrderedClasses(vehicles);

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

export function VehicleListDisplayWithPreloadedImages({
  vehicles,
  searchState,
}: VehicleListDisplayWithPreloadedImagesProps) {
  const t = useTranslations("vehicleListDisplay");

  if (!vehicles || vehicles.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        {t("noVehiclesFoundMessage")}
      </p>
    );
  }

  return (
    <div>
      <VehiclesByClass vehicles={vehicles} searchState={searchState} />
    </div>
  );
}