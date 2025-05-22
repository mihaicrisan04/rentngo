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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";

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

function VehicleList({
  vehicles,
  isLoading,
  pickupDate,
  returnDate,
}: {
  vehicles: Vehicle[] | null;
  isLoading: boolean;
  pickupDate?: Date | null;
  returnDate?: Date | null;
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
        return <VehicleCard key={vehicle._id} vehicle={vehicle} pickupDate={pickupDate} returnDate={returnDate} />;
      })}
    </div>
  );
}

export default function CarsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const convex = useConvex();

  const [allFetchedVehicles, setAllFetchedVehicles] = React.useState<Vehicle[] | null>(null);
  const [displayedVehicles, setDisplayedVehicles] = React.useState<Vehicle[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [currentDeliveryLocation, setCurrentDeliveryLocation] = React.useState<string | null>(null);
  const [currentPickupDate, setCurrentPickupDate] = React.useState<Date | null>(null);
  const [currentPickupTime, setCurrentPickupTime] = React.useState<string | null>(null);
  const [currentRestitutionLocation, setCurrentRestitutionLocation] = React.useState<string | null>(null);
  const [currentReturnDate, setCurrentReturnDate] = React.useState<Date | null>(null);
  const [currentReturnTime, setCurrentReturnTime] = React.useState<string | null>(null);
  const [initialPopulationComplete, setInitialPopulationComplete] = React.useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Helper function to sanitize time strings from URL params
  const sanitizeTime = (timeStr: string | null): string | null => {
    if (!timeStr) return null;
    // Matches HH:MM at the beginning of the string
    const match = timeStr.match(/^(\d{2}:\d{2})/); 
    return match ? match[1] : null; // Returns "HH:MM" or null
  };

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

  // Effect for initial population from URL and initial search
  React.useEffect(() => {
    const deliveryLocParam = searchParams.get("deliveryLocation");
    const pickupDateStrParam = searchParams.get("pickupDate");
    const rawPickupTimeParam = searchParams.get("pickupTime"); // Raw value from URL
    const restitutionLocParam = searchParams.get("restitutionLocation");
    const returnDateStrParam = searchParams.get("returnDate");
    const rawReturnTimeParam = searchParams.get("returnTime"); // Raw value from URL

    const sanitizedPickupTime = sanitizeTime(rawPickupTimeParam); // Sanitize
    const sanitizedReturnTime = sanitizeTime(rawReturnTimeParam); // Sanitize

    const initialPickupD = pickupDateStrParam ? new Date(parseInt(pickupDateStrParam, 10) * 1000) : null;
    const initialReturnD = returnDateStrParam ? new Date(parseInt(returnDateStrParam, 10) * 1000) : null;

    setCurrentDeliveryLocation(deliveryLocParam);
    setCurrentPickupDate(initialPickupD);
    setCurrentPickupTime(sanitizedPickupTime); // Use sanitized value
    setCurrentRestitutionLocation(restitutionLocParam || deliveryLocParam); // Default return to delivery if not specified
    setCurrentReturnDate(initialReturnD);
    setCurrentReturnTime(sanitizedReturnTime); // Use sanitized value
    
    setInitialPopulationComplete(true);
    // Trigger initial search with populated or null values
    executeVehicleSearch(
        deliveryLocParam, 
        initialPickupD, 
        sanitizedPickupTime, // Pass sanitized value
        restitutionLocParam || deliveryLocParam, 
        initialReturnD, 
        sanitizedReturnTime // Pass sanitized value
    );

  }, [searchParams, executeVehicleSearch]); // executeVehicleSearch is memoized

  React.useEffect(() => {
    if (initialPopulationComplete) {
      executeVehicleSearch(
        currentDeliveryLocation,
        currentPickupDate,
        currentPickupTime,
        currentRestitutionLocation,
        currentReturnDate,
        currentReturnTime
      );
    }
  }, [
    initialPopulationComplete,
    currentDeliveryLocation,
    currentPickupDate,
    currentPickupTime,
    currentRestitutionLocation,
    currentReturnDate,
    currentReturnTime,
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