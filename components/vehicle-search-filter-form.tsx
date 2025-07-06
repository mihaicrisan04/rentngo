"use client";

import * as React from "react";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { Id } from "../convex/_generated/dataModel";
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { LocationPicker } from "./location-picker";
import { DateTimePicker } from "./date-time-picker";
import { searchStorage } from "@/lib/searchStorage";

// Define the expected shape of a vehicle object (can be refined)
interface Vehicle {
  _id: Id<"vehicles">;
  make: string;
  model: string;
  year: number;
  type: string;
  pricePerDay: number;
  location: string; // This will be the primary search field for location
  features: string[];
  status: string;
  images: Id<"_storage">[];
  mainImageId?: Id<"_storage">;
}

interface VehicleSearchFilterFormProps {
  initialDeliveryLocation?: string;
  initialRestitutionLocation?: string;
  initialPickupDate?: Date;
  initialReturnDate?: Date;
}

export function VehicleSearchFilterForm({
  initialDeliveryLocation,
  initialRestitutionLocation,
  initialPickupDate,
  initialReturnDate,
}: VehicleSearchFilterFormProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start with empty/default state to avoid hydration mismatch
  const [deliveryLocation, setDeliveryLocation] = React.useState<string>("");
  const [restitutionLocation, setRestitutionLocation] = React.useState<string>("");
  const [pickupDateState, setPickupDateState] = React.useState<Date | undefined>(undefined);
  const [pickupTime, setPickupTime] = React.useState<string | null>(null);
  const [returnDateState, setReturnDateState] = React.useState<Date | undefined>(undefined);
  const [returnTime, setReturnTime] = React.useState<string | null>(null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isHydrated, setIsHydrated] = React.useState(false);
  const router = useRouter();
  const t = useTranslations('search');

  // Load data from localStorage after hydration to prevent SSR mismatch
  React.useEffect(() => {
    const storedData = searchStorage.load();
    
    // Only update state if there's stored data, otherwise leave empty for user selection
    if (storedData.deliveryLocation) {
      setDeliveryLocation(storedData.deliveryLocation);
    } else if (initialDeliveryLocation) {
      setDeliveryLocation(initialDeliveryLocation);
    }
    
    if (storedData.restitutionLocation) {
      setRestitutionLocation(storedData.restitutionLocation);
    } else if (initialRestitutionLocation) {
      setRestitutionLocation(initialRestitutionLocation);
    }
    
    if (storedData.pickupDate) {
      setPickupDateState(storedData.pickupDate);
    } else if (initialPickupDate) {
      setPickupDateState(initialPickupDate);
    }
    
    if (storedData.returnDate) {
      setReturnDateState(storedData.returnDate);
    } else if (initialReturnDate) {
      setReturnDateState(initialReturnDate);
    }
    
    if (storedData.pickupTime) {
      setPickupTime(storedData.pickupTime);
    }
    
    if (storedData.returnTime) {
      setReturnTime(storedData.returnTime);
    }

    setIsHydrated(true);
  }, [initialDeliveryLocation, initialRestitutionLocation, initialPickupDate, initialReturnDate]);

  // Save to localStorage when state changes (only after hydration)
  React.useEffect(() => {
    if (!isHydrated) return;
    
    searchStorage.save({
      deliveryLocation: deliveryLocation || undefined,
      pickupDate: pickupDateState,
      pickupTime,
      restitutionLocation: restitutionLocation || undefined,
      returnDate: returnDateState,
      returnTime,
    });
  }, [deliveryLocation, pickupDateState, pickupTime, restitutionLocation, returnDateState, returnTime, isHydrated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate dates if both are provided
    if (pickupDateState && returnDateState) {
      if (returnDateState < pickupDateState) {
        alert(t('returnDateAfterPickup'));
        setIsLoading(false);
        return;
      }
      // Time validation is now handled automatically by DateTimePicker component
    }

    // Navigate to cars page regardless of completeness - the cars page will handle partial data
    router.push("/cars");

    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <Card className="w-full shadow-xl relative">
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4 lg:p-6 pb-0">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Column 1: Pick-up */}
            <div className="flex flex-col gap-4 w-full lg:w-1/2">
              <LocationPicker
                id="deliveryLocation"
                label={t('pickupLocation')}
                value={deliveryLocation}
                onValueChange={setDeliveryLocation}
                placeholder={t('selectPickupLocation')}
                disabled={isLoading}
                contentAlign="start"
              />
              <DateTimePicker
                id="pickupDate"
                label={t('pickupDateTime')}
                dateState={pickupDateState}
                setDateState={setPickupDateState}
                timeState={pickupTime}
                setTimeState={setPickupTime}
                minDate={today}
                disabledDateRanges={{ before: today }}
                popoverAlign="start"
                contentAlign="start"
                isLoading={isLoading}
                onDateChange={(newDate) => {
                  if (newDate && returnDateState && returnDateState < newDate) {
                    setReturnDateState(newDate);
                  }
                }}
              />
            </div>

            {/* Vertical Separator */}
            <div className="hidden lg:flex justify-center items-center">
              <Separator orientation="vertical" className="h-auto" />
            </div>

            {/* Column 2: Return */}
            <div className="flex flex-col gap-4 w-full lg:w-1/2">
              <LocationPicker
                id="restitutionLocation"
                label={t('returnLocation')}
                value={restitutionLocation}
                onValueChange={setRestitutionLocation}
                placeholder={t('selectReturnLocation')}
                disabled={isLoading}
                contentAlign="start"
              />
              <DateTimePicker
                id="returnDate"
                label={t('returnDateTime')}
                dateState={returnDateState}
                setDateState={setReturnDateState}
                timeState={returnTime}
                setTimeState={setReturnTime}
                minDate={pickupDateState || today}
                disabledDateRanges={{ before: pickupDateState || today }}
                popoverAlign="end"
                contentAlign="start"
                isLoading={isLoading}
                pickupDate={pickupDateState}
                pickupTime={pickupTime}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-4 lg:pt-8 sm:pt-6 lg:p-6 md:pt-8">
          <Button type="submit" size="lg" className="w-full lg:w-auto lg:px-12 text-base py-3" disabled={isLoading}>
            <Search className="mr-2 h-5 w-5" />
            {isLoading ? t('searchingCars') : t('searchCars')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default VehicleSearchFilterForm; 