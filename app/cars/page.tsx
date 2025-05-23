"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import Image from "next/image";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { VehicleCard } from "@/components/VehicleCard";
import { VehicleFilters } from "@/components/VehicleFilters";
import { Card, CardContent } from "@/components/ui/card";

import { LocationPicker } from "@/components/LocationPicker";
import { DateTimePicker } from "@/components/DateTimePicker";

interface Vehicle {
  _id: Id<"vehicles">;
  make: string;
  model: string;
  year: number;
  type: string;
  pricePerDay: number;
  currency?: string;
  location: string;
  features: string[];
  status: string;
  images: Id<"_storage">[];
  mainImageId?: Id<"_storage">;
  title?: string;
  desc?: string;
  engineCapacity?: number;
  engineType?: string;
  fuelType?: string;
}

// URL State Management (shareable search criteria)
interface URLSearchState {
  deliveryLocation?: string;
  pickupDate?: string; // Unix timestamp
  pickupTime?: string;
  restitutionLocation?: string;
  returnDate?: string; // Unix timestamp
  returnTime?: string;
}

// UI State Management (local preferences)
interface UISearchState {
  filtersExpanded?: boolean;
  sortBy?: string;
  viewMode?: 'grid' | 'list';
}

// Utility functions for state management
const useSearchStateManager = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Debounced URL update function
  const updateURLDebounced = React.useCallback(
    debounce((newState: URLSearchState) => {
      const params = new URLSearchParams();
      
      Object.entries(newState).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });

      const paramString = params.toString();
      const newUrl = `/cars${paramString ? `?${paramString}` : ''}`;
      router.replace(newUrl);
    }, 300),
    [router]
  );

  // Read URL state
  const getURLState = React.useCallback((): URLSearchState => {
    return {
      deliveryLocation: searchParams.get("deliveryLocation") || undefined,
      pickupDate: searchParams.get("pickupDate") || undefined,
      pickupTime: searchParams.get("pickupTime") || undefined,
      restitutionLocation: searchParams.get("restitutionLocation") || undefined,
      returnDate: searchParams.get("returnDate") || undefined,
      returnTime: searchParams.get("returnTime") || undefined,
    };
  }, [searchParams]);

  // Update URL state
  const setURLState = React.useCallback((newState: URLSearchState) => {
    updateURLDebounced(newState);
  }, [updateURLDebounced]);

  // Read UI state from localStorage
  const getUIState = React.useCallback((): UISearchState => {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem('carSearchUIState');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  // Update UI state in localStorage
  const setUIState = React.useCallback((newState: Partial<UISearchState>) => {
    if (typeof window === 'undefined') return;
    
    try {
      const current = getUIState();
      const updated = { ...current, ...newState };
      localStorage.setItem('carSearchUIState', JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save UI state to localStorage:', error);
    }
  }, [getUIState]);

  return {
    getURLState,
    setURLState,
    getUIState,
    setUIState,
  };
};

// Debounce utility function
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function VehicleList({
  vehicles,
  isLoading,
  pickupDate,
  returnDate,
  deliveryLocation,
  restitutionLocation,
  pickupTime,
  returnTime,
}: {
  vehicles: Vehicle[] | null;
  isLoading: boolean;
  pickupDate?: Date | null;
  returnDate?: Date | null;
  deliveryLocation?: string | null;
  restitutionLocation?: string | null;
  pickupTime?: string | null;
  returnTime?: string | null;
}) {
  if (isLoading) {
    return <p className="text-center text-muted-foreground">Searching for available cars...</p>;
  }
  if (vehicles === null && !isLoading) {
    return <p className="text-center text-destructive">Could not load vehicles. Please try searching again.</p>;
  }
  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    return <p className="text-center text-muted-foreground">No vehicles found matching your criteria. Try broadening your search or check back later.</p>;
  }

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
            pickupDate={pickupDate} 
            returnDate={returnDate}
            deliveryLocation={deliveryLocation}
            restitutionLocation={restitutionLocation}
            pickupTime={pickupTime}
            returnTime={returnTime}
          />
        );
      })}
    </div>
  );
}

export default function CarsPage() {
  const convex = useConvex();
  const { getURLState, setURLState, getUIState } = useSearchStateManager();

  const [allFetchedVehicles, setAllFetchedVehicles] = React.useState<Vehicle[] | null>(null);
  const [displayedVehicles, setDisplayedVehicles] = React.useState<Vehicle[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Search form state - derived from URL parameters
  const [currentDeliveryLocation, setCurrentDeliveryLocation] = React.useState<string | null>(null);
  const [currentPickupDate, setCurrentPickupDate] = React.useState<Date | null>(null);
  const [currentPickupTime, setCurrentPickupTime] = React.useState<string | null>(null);
  const [currentRestitutionLocation, setCurrentRestitutionLocation] = React.useState<string | null>(null);
  const [currentReturnDate, setCurrentReturnDate] = React.useState<Date | null>(null);
  const [currentReturnTime, setCurrentReturnTime] = React.useState<string | null>(null);

  const [initialStateLoaded, setInitialStateLoaded] = React.useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Helper function to sanitize time strings from URL params
  const sanitizeTime = (timeStr: string | null): string | null => {
    if (!timeStr) return null;
    const match = timeStr.match(/^(\d{2}:\d{2})/); 
    return match ? match[1] : null;
  };

  // Load initial state from URL and localStorage
  React.useEffect(() => {
    const urlState = getURLState();

    // Restore search form state from URL
    setCurrentDeliveryLocation(urlState.deliveryLocation || null);
    setCurrentPickupDate(urlState.pickupDate ? new Date(parseInt(urlState.pickupDate) * 1000) : null);
    setCurrentPickupTime(sanitizeTime(urlState.pickupTime || null));
    setCurrentRestitutionLocation(urlState.restitutionLocation || urlState.deliveryLocation || null);
    setCurrentReturnDate(urlState.returnDate ? new Date(parseInt(urlState.returnDate) * 1000) : null);
    setCurrentReturnTime(sanitizeTime(urlState.returnTime || null));

    setInitialStateLoaded(true);
  }, [getURLState, getUIState]);

  // Update URL when search criteria changes
  React.useEffect(() => {
    if (!initialStateLoaded) return;

    const urlState: URLSearchState = {};
    
    if (currentDeliveryLocation) {
      urlState.deliveryLocation = currentDeliveryLocation;
    }
    if (currentPickupDate) {
      urlState.pickupDate = Math.floor(currentPickupDate.getTime() / 1000).toString();
    }
    if (currentPickupTime) {
      urlState.pickupTime = currentPickupTime;
    }
    if (currentRestitutionLocation) {
      urlState.restitutionLocation = currentRestitutionLocation;
    }
    if (currentReturnDate) {
      urlState.returnDate = Math.floor(currentReturnDate.getTime() / 1000).toString();
    }
    if (currentReturnTime) {
      urlState.returnTime = currentReturnTime;
    }

    setURLState(urlState);
  }, [
    currentDeliveryLocation,
    currentPickupDate,
    currentPickupTime,
    currentRestitutionLocation,
    currentReturnDate,
    currentReturnTime,
    initialStateLoaded,
    setURLState
  ]);

  const executeVehicleSearch = React.useCallback(async (
    pickupLoc: string | null, 
    pickupDate: Date | null, 
    pickupTime: string | null, 
    restitutionLoc: string | null, 
    returnDate: Date | null, 
    returnTime: string | null
  ) => {
    setIsLoading(true);
    setError(null);

    if (!pickupLoc || !pickupDate || !pickupTime || !restitutionLoc || !returnDate || !returnTime) {
      try {
        const results = await convex.query(api.vehicles.getAllVehicles, {});
        setAllFetchedVehicles(results as Vehicle[]);
        setDisplayedVehicles(results as Vehicle[]); 
      } catch (err) {
        console.error("Failed to fetch all vehicles:", err);
        setError("Failed to load vehicles. Please try refreshing or contact support.");
        setAllFetchedVehicles(null);
        setDisplayedVehicles(null);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (returnDate.getTime() < pickupDate.getTime()) {
      setError("Return date must be after or the same as pick-up date.");
      setIsLoading(false);
      setAllFetchedVehicles([]);
      setDisplayedVehicles([]);
      return;
    }
    if (returnDate.getTime() === pickupDate.getTime() && returnTime <= pickupTime) {
      setError("Return time must be after pick-up time for same-day rentals.");
      setIsLoading(false);
      setAllFetchedVehicles([]);
      setDisplayedVehicles([]);
      return;
    }

    const startDateTimestamp = Math.floor(pickupDate.getTime() / 1000);
    const endDateTimestamp = Math.floor(returnDate.getTime() / 1000);

    try {
      const results = await convex.query(api.vehicles.searchAvailableVehicles, {
        startDate: startDateTimestamp,
        endDate: endDateTimestamp,
      });
      setAllFetchedVehicles(results as Vehicle[]);
      setDisplayedVehicles(results as Vehicle[]);
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
      setError("Failed to load vehicles. Please try your search again or contact support.");
      setAllFetchedVehicles(null);
      setDisplayedVehicles(null);
    } finally {
      setIsLoading(false);
    }
  }, [convex]);

  // Execute search when state changes
  React.useEffect(() => {
    if (!initialStateLoaded) return;

    executeVehicleSearch(
      currentDeliveryLocation,
      currentPickupDate,
      currentPickupTime,
      currentRestitutionLocation,
      currentReturnDate,
      currentReturnTime
    );
  }, [
    currentDeliveryLocation,
    currentPickupDate,
    currentPickupTime,
    currentRestitutionLocation,
    currentReturnDate,
    currentReturnTime,
    initialStateLoaded,
    executeVehicleSearch
  ]);

  return (
    <div className="relative flex flex-col min-h-screen">
      <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />

      <main className="p-4 md:p-8 flex flex-col gap-8 flex-grow">
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold">Find Your Vehicle</h1>
            <p className="text-muted-foreground">Select your rental details below.</p>
          </div>
          <Card className="mb-8 shadow-md">
            <CardContent className="">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <LocationPicker
                  id="currentDeliveryLocation"
                  label="Pick-up Location"
                  value={currentDeliveryLocation || ""}
                  onValueChange={setCurrentDeliveryLocation}
                  placeholder="Select pick-up"
                  disabled={isLoading}
                />
                <DateTimePicker
                  id="currentPickupDate"
                  label="Pick-up Date & Time"
                  disabledDateRanges={{ before: today }}
                  dateState={currentPickupDate || undefined}
                  setDateState={setCurrentPickupDate}
                  timeState={currentPickupTime}
                  setTimeState={setCurrentPickupTime}
                  minDate={today}
                  isLoading={isLoading}
                  onDateChange={(newDate) => {
                    if (newDate && currentReturnDate && newDate.getTime() > currentReturnDate.getTime()) {
                      setCurrentReturnDate(newDate);
                    }
                  }}
                />
                <LocationPicker
                  id="currentRestitutionLocation"
                  label="Return Location"
                  value={currentRestitutionLocation || ""}
                  onValueChange={setCurrentRestitutionLocation}
                  placeholder="Select return"
                  disabled={isLoading}
                />
                <DateTimePicker
                  id="currentReturnDate"
                  label="Return Date & Time"
                  dateState={currentReturnDate || undefined}
                  setDateState={(newDate) => {
                    if (newDate) {
                      if (currentPickupDate && newDate.getTime() < currentPickupDate.getTime()) {
                        setCurrentReturnDate(currentPickupDate);
                      } else {
                        setCurrentReturnDate(newDate);
                      }
                    } else {
                      setCurrentReturnDate(null);
                    }
                  }}
                  timeState={currentReturnTime}
                  setTimeState={setCurrentReturnTime}
                  minDate={currentPickupDate || today}
                  disabledDateRanges={currentPickupDate ? { before: currentPickupDate } : { before: today }}
                  isLoading={isLoading || !currentPickupDate}
                />
              </div>
            </CardContent>
          </Card>
          
          <VehicleFilters allVehicles={allFetchedVehicles} onFilterChange={setDisplayedVehicles} />
          
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-center">
            {isLoading ? "Finding Your Ride..." : (displayedVehicles && displayedVehicles.length > 0 ? "Available Cars" : "No Cars Found")}
          </h1>

          {error && <p className="text-center text-destructive mb-4">{error}</p>}
          
          <VehicleList
            vehicles={displayedVehicles}
            isLoading={isLoading}
            pickupDate={currentPickupDate}
            returnDate={currentReturnDate}
            deliveryLocation={currentDeliveryLocation}
            restitutionLocation={currentRestitutionLocation}
            pickupTime={currentPickupTime}
            returnTime={currentReturnTime}
          />
        </div>
      </main>

      <Footer
        logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />}
        brandName=""
      />
    </div>
  );
} 