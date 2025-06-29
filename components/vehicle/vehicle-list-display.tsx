"use client";

import { VehicleCard } from "@/components/vehicle-card";
import { VehicleCardSkeleton } from "@/components/vehicle-card-skeleton";
import { Vehicle } from "@/types/vehicle";
import { SearchData } from "@/lib/searchStorage";

interface VehicleListDisplayProps {
  vehicles: Vehicle[] | null;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  searchState: SearchData;
}

function VehicleGrid({
  vehicles,
  searchState,
}: {
  vehicles: Vehicle[];
  searchState: SearchData;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => {
        if (!vehicle || typeof vehicle._id !== 'string') {
          console.warn("Skipping invalid vehicle data:", vehicle);
          return null;
        }
        return (
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
        );
      })}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }, (_, index) => (
        <VehicleCardSkeleton key={index} />
      ))}
    </div>
  );
}

function getDisplayTitle(vehicles: Vehicle[] | null, isLoading: boolean, error: string | null): string {
  if (isLoading) return "Loading Vehicles...";
  if (error) return "Error Loading Vehicles";
  if (!vehicles || vehicles.length === 0) return "No Cars Found";
  return "Available Cars";
}

export function VehicleListDisplay({
  vehicles,
  isLoading,
  isHydrated,
  error,
  searchState,
}: VehicleListDisplayProps) {
  const displayTitle = getDisplayTitle(vehicles, isLoading, error);

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-center">
        {displayTitle}
      </h1>

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
          Could not load vehicles. Please try searching again.
        </p>
      )}

      {/* Show empty state */}
      {isHydrated && !isLoading && vehicles !== null && vehicles.length === 0 && (
        <p className="text-center text-muted-foreground">
          No vehicles found matching your criteria. Try broadening your search or check back later.
        </p>
      )}

      {/* Show vehicles */}
      {isHydrated && !isLoading && vehicles && vehicles.length > 0 && (
        <VehicleGrid vehicles={vehicles} searchState={searchState} />
      )}
    </div>
  );
} 