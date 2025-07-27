"use client";

import { VehicleCard } from "@/components/vehicle/vehicle-card";
import { VehicleCardSkeleton } from "@/components/vehicle/vehicle-card-skeleton";
import { Vehicle, VehicleClass } from "@/types/vehicle";
import { SearchData } from "@/lib/searchStorage";
import { useTranslations } from 'next-intl';
import { Separator } from "@/components/ui/separator";

interface VehicleListDisplayProps {
  vehicles: Vehicle[] | null;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  searchState: SearchData;
}

// Helper function to format class names for display
function formatClassName(className: VehicleClass | undefined): string {
  if (!className) return "Unclassified";
  
  return className
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to group vehicles by class
function groupVehiclesByClass(vehicles: Vehicle[]): Record<string, Vehicle[]> {
  const grouped: Record<string, Vehicle[]> = {};
  
  vehicles.forEach((vehicle) => {
    if (!vehicle || typeof vehicle._id !== 'string') {
      console.warn("Skipping invalid vehicle data:", vehicle);
      return;
    }
    
    const vehicleClass = vehicle.class || 'unclassified';
    if (!grouped[vehicleClass]) {
      grouped[vehicleClass] = [];
    }
    grouped[vehicleClass].push(vehicle);
  });
  
  return grouped;
}

// Define the order of vehicle classes for consistent display
const classOrder: (VehicleClass | 'unclassified')[] = [
  'economy',
  'compact', 
  'intermediate',
  'standard',
  'full-size',
  'premium',
  'luxury',
  'sport',
  'super-sport',
  'supercars',
  'business',
  'executive',
  'commercial',
  'convertible',
  'van',
  'unclassified'
];

function VehicleClassSection({
  className,
  vehicles,
  searchState,
}: {
  className: VehicleClass | 'unclassified';
  vehicles: Vehicle[];
  searchState: SearchData;
}) {
  const displayName = formatClassName(className as VehicleClass);
  
  return (
    <div className="mb-12">
      {/* Class header with separator line */}
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-foreground whitespace-nowrap">
          {displayName}
        </h2>
        <Separator className="flex-1" />
      </div>
      
      {/* Vehicles grid for this class */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
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
  vehicles: Vehicle[];
  searchState: SearchData;
}) {
  const groupedVehicles = groupVehiclesByClass(vehicles);
  
  // Sort classes according to our defined order and only show classes that have vehicles
  const availableClasses = classOrder.filter(className => 
    groupedVehicles[className] && groupedVehicles[className].length > 0
  );
  
  return (
    <div>
      {availableClasses.map((className) => (
        <VehicleClassSection
          key={className}
          className={className}
          vehicles={groupedVehicles[className]}
          searchState={searchState}
        />
      ))}
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

function getDisplayTitle(vehicles: Vehicle[] | null, isLoading: boolean, error: string | null, t: any): string {
  if (isLoading) return t('loadingVehicles');
  if (error) return t('errorLoadingVehicles');
  if (!vehicles || vehicles.length === 0) return t('noCarsFound');
  return t('availableCars');
}

export function VehicleListDisplay({
  vehicles,
  isLoading,
  isHydrated,
  error,
  searchState,
}: VehicleListDisplayProps) {
  const t = useTranslations('vehicleListDisplay');
  const displayTitle = getDisplayTitle(vehicles, isLoading, error, t);

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
          {t('couldNotLoadVehicles')}
        </p>
      )}

      {/* Show empty state */}
      {isHydrated && !isLoading && vehicles !== null && vehicles.length === 0 && (
        <p className="text-center text-muted-foreground">
          {t('noVehiclesFoundMessage')}
        </p>
      )}

      {/* Show vehicles */}
      {isHydrated && !isLoading && vehicles && vehicles.length > 0 && (
        <VehiclesByClass vehicles={vehicles} searchState={searchState} />
      )}
    </div>
  );
} 
