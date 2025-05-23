"use client";

import * as React from "react";
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
import { searchStorage } from "@/lib/searchStorage";

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

  const [allFetchedVehicles, setAllFetchedVehicles] = React.useState<Vehicle[] | null>(null);
  const [displayedVehicles, setDisplayedVehicles] = React.useState<Vehicle[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Search form state - start with empty state to avoid hydration issues
  const [currentDeliveryLocation, setCurrentDeliveryLocation] = React.useState<string>("");
  const [currentPickupDate, setCurrentPickupDate] = React.useState<Date | undefined>(undefined);
  const [currentPickupTime, setCurrentPickupTime] = React.useState<string | null>(null);
  const [currentRestitutionLocation, setCurrentRestitutionLocation] = React.useState<string>("");
  const [currentReturnDate, setCurrentReturnDate] = React.useState<Date | undefined>(undefined);
  const [currentReturnTime, setCurrentReturnTime] = React.useState<string | null>(null);

  const [isHydrated, setIsHydrated] = React.useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Load initial state from localStorage after hydration
  React.useEffect(() => {
    const storedData = searchStorage.load();

    // Only populate fields that exist in localStorage, leave others empty for user selection
    if (storedData.deliveryLocation) {
      setCurrentDeliveryLocation(storedData.deliveryLocation);
    }
    if (storedData.pickupDate) {
      setCurrentPickupDate(storedData.pickupDate);
    }
    if (storedData.pickupTime) {
      setCurrentPickupTime(storedData.pickupTime);
    }
    if (storedData.restitutionLocation) {
      setCurrentRestitutionLocation(storedData.restitutionLocation);
    }
    if (storedData.returnDate) {
      setCurrentReturnDate(storedData.returnDate);
    }
    if (storedData.returnTime) {
      setCurrentReturnTime(storedData.returnTime);
    }

    setIsHydrated(true);
  }, []);

  // Save to localStorage when search criteria changes (only after hydration)
  React.useEffect(() => {
    if (!isHydrated) return;

    searchStorage.save({
      deliveryLocation: currentDeliveryLocation || undefined,
      pickupDate: currentPickupDate,
      pickupTime: currentPickupTime,
      restitutionLocation: currentRestitutionLocation || undefined,
      returnDate: currentReturnDate,
      returnTime: currentReturnTime,
    });
  }, [
    currentDeliveryLocation,
    currentPickupDate,
    currentPickupTime,
    currentRestitutionLocation,
    currentReturnDate,
    currentReturnTime,
    isHydrated,
  ]);

  const executeVehicleSearch = React.useCallback(async (
    pickupLoc: string, 
    pickupDate: Date | undefined, 
    pickupTime: string | null, 
    restitutionLoc: string, 
    returnDate: Date | undefined, 
    returnTime: string | null
  ) => {
    setIsLoading(true);
    setError(null);

    // If no search criteria provided, show all vehicles
    if (!pickupLoc && !pickupDate && !pickupTime && !restitutionLoc && !returnDate && !returnTime) {
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

    // If we have complete search criteria, perform availability search
    if (pickupLoc && pickupDate && pickupTime && restitutionLoc && returnDate && returnTime) {
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
    } else {
      // Partial search criteria - show all vehicles but with message
      try {
        const results = await convex.query(api.vehicles.getAllVehicles, {});
        setAllFetchedVehicles(results as Vehicle[]);
        setDisplayedVehicles(results as Vehicle[]); 
        setError("Complete your search criteria above to check availability for specific dates.");
      } catch (err) {
        console.error("Failed to fetch all vehicles:", err);
        setError("Failed to load vehicles. Please try refreshing or contact support.");
        setAllFetchedVehicles(null);
        setDisplayedVehicles(null);
      } finally {
        setIsLoading(false);
      }
    }
  }, [convex]);

  // Execute search when state changes (only after hydration)
  React.useEffect(() => {
    if (!isHydrated) return;

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
    isHydrated,
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
                  value={currentDeliveryLocation}
                  onValueChange={setCurrentDeliveryLocation}
                  placeholder="Select pick-up"
                  disabled={isLoading}
                />
                <DateTimePicker
                  id="currentPickupDate"
                  label="Pick-up Date & Time"
                  disabledDateRanges={{ before: today }}
                  dateState={currentPickupDate}
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
                  value={currentRestitutionLocation}
                  onValueChange={setCurrentRestitutionLocation}
                  placeholder="Select return"
                  disabled={isLoading}
                />
                <DateTimePicker
                  id="currentReturnDate"
                  label="Return Date & Time"
                  dateState={currentReturnDate}
                  setDateState={(newDate) => {
                    if (newDate) {
                      if (currentPickupDate && newDate.getTime() < currentPickupDate.getTime()) {
                        setCurrentReturnDate(currentPickupDate);
                      } else {
                        setCurrentReturnDate(newDate);
                      }
                    } else {
                      setCurrentReturnDate(undefined);
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

          {error && (
            <div className="text-center mb-4">
              <p className={error.includes("Complete your search") ? "text-yellow-600" : "text-destructive"}>{error}</p>
            </div>
          )}
          
          <VehicleList
            vehicles={displayedVehicles}
            isLoading={isLoading}
            pickupDate={currentPickupDate || null}
            returnDate={currentReturnDate || null}
            deliveryLocation={currentDeliveryLocation || null}
            restitutionLocation={currentRestitutionLocation || null}
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