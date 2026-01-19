"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LocationPicker } from "../location-picker";
import { DateTimePicker } from "../date-time-picker";
import { searchStorage, SearchData } from "@/lib/searchStorage";



interface VehicleSearchFilterFormProps {
  initialDeliveryLocation?: string;
  initialRestitutionLocation?: string;
  initialPickupDate?: Date;
  initialReturnDate?: Date;
  searchState?: SearchData & { isHydrated: boolean };
  updateSearchField?: <K extends keyof SearchData>(field: K, value: SearchData[K]) => void;
}

export function VehicleSearchFilterForm({
  initialDeliveryLocation,
  initialRestitutionLocation,
  initialPickupDate,
  initialReturnDate,
  searchState,
  updateSearchField,
}: VehicleSearchFilterFormProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Use provided search state or fallback to internal state
  const [internalDeliveryLocation, setInternalDeliveryLocation] = React.useState<string>("");
  const [internalRestitutionLocation, setInternalRestitutionLocation] = React.useState<string>("");
  const [internalPickupDateState, setInternalPickupDateState] = React.useState<Date | undefined>(undefined);
  const [internalPickupTime, setInternalPickupTime] = React.useState<string | null>(null);
  const [internalReturnDateState, setInternalReturnDateState] = React.useState<Date | undefined>(undefined);
  const [internalReturnTime, setInternalReturnTime] = React.useState<string | null>(null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isHydrated, setIsHydrated] = React.useState(false);
  
  // Control which picker is open for sequential flow
  const [pickupCalendarOpen, setPickupCalendarOpen] = React.useState(false);
  const [returnCalendarOpen, setReturnCalendarOpen] = React.useState(false);
  
  const router = useRouter();
  const t = useTranslations('search');

  // Determine which state to use
  const deliveryLocation = searchState?.deliveryLocation ?? internalDeliveryLocation;
  const restitutionLocation = searchState?.restitutionLocation ?? internalRestitutionLocation;
  const pickupDateState = searchState?.pickupDate ?? internalPickupDateState;
  const pickupTime = searchState?.pickupTime ?? internalPickupTime;
  const returnDateState = searchState?.returnDate ?? internalReturnDateState;
  const returnTime = searchState?.returnTime ?? internalReturnTime;

  // Helper functions to update state
  const setDeliveryLocation = (value: string) => {
    if (updateSearchField) {
      updateSearchField('deliveryLocation', value);
    } else {
      setInternalDeliveryLocation(value);
    }
  };

  const setRestitutionLocation = (value: string) => {
    if (updateSearchField) {
      updateSearchField('restitutionLocation', value);
    } else {
      setInternalRestitutionLocation(value);
    }
  };

  const setPickupDateState = (value: Date | undefined) => {
    if (updateSearchField) {
      updateSearchField('pickupDate', value);
    } else {
      setInternalPickupDateState(value);
    }
  };

  const setPickupTime = (value: string | null) => {
    if (updateSearchField) {
      updateSearchField('pickupTime', value);
    } else {
      setInternalPickupTime(value);
    }
  };

  const setReturnDateState = (value: Date | undefined) => {
    if (updateSearchField) {
      updateSearchField('returnDate', value);
    } else {
      setInternalReturnDateState(value);
    }
  };

  const setReturnTime = (value: string | null) => {
    if (updateSearchField) {
      updateSearchField('returnTime', value);
    } else {
      setInternalReturnTime(value);
    }
  };

  // Load data from localStorage after hydration to prevent SSR mismatch (only when using internal state)
  React.useEffect(() => {
    if (searchState && updateSearchField) {
      // If using external state, don't load from localStorage
      setIsHydrated(true);
      return;
    }

    const storedData = searchStorage.load();
    
    // Only update state if there's stored data, otherwise leave empty for user selection
    if (storedData.deliveryLocation) {
      setInternalDeliveryLocation(storedData.deliveryLocation);
    } else if (initialDeliveryLocation) {
      setInternalDeliveryLocation(initialDeliveryLocation);
    }
    
    if (storedData.restitutionLocation) {
      setInternalRestitutionLocation(storedData.restitutionLocation);
    } else if (initialRestitutionLocation) {
      setInternalRestitutionLocation(initialRestitutionLocation);
    }
    
    if (storedData.pickupDate) {
      setInternalPickupDateState(storedData.pickupDate);
    } else if (initialPickupDate) {
      setInternalPickupDateState(initialPickupDate);
    }
    
    if (storedData.returnDate) {
      setInternalReturnDateState(storedData.returnDate);
    } else if (initialReturnDate) {
      setInternalReturnDateState(initialReturnDate);
    }
    
    if (storedData.pickupTime) {
      setInternalPickupTime(storedData.pickupTime);
    }
    
    if (storedData.returnTime) {
      setInternalReturnTime(storedData.returnTime);
    }

    setIsHydrated(true);
  }, [initialDeliveryLocation, initialRestitutionLocation, initialPickupDate, initialReturnDate, searchState, updateSearchField]);

  // Save to localStorage when state changes (only after hydration and when using internal state)
  React.useEffect(() => {
    if (!isHydrated || (searchState && updateSearchField)) return;
    
    searchStorage.save({
      deliveryLocation: internalDeliveryLocation || undefined,
      pickupDate: internalPickupDateState,
      pickupTime: internalPickupTime,
      restitutionLocation: internalRestitutionLocation || undefined,
      returnDate: internalReturnDateState,
      returnTime: internalReturnTime,
    });
  }, [internalDeliveryLocation, internalPickupDateState, internalPickupTime, internalRestitutionLocation, internalReturnDateState, internalReturnTime, isHydrated, searchState, updateSearchField]);

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
                disabledDateRanges={(date: Date) => date < today}
                popoverAlign="start"
                contentAlign="start"
                isLoading={isLoading}
                calendarOpen={pickupCalendarOpen}
                onCalendarOpenChange={setPickupCalendarOpen}
                onDateSelected={() => {
                  // After pickup date is selected, open return date calendar
                  setTimeout(() => {
                    setReturnCalendarOpen(true);
                  }, 100);
                }}
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
                disabledDateRanges={(date: Date) => date < (pickupDateState || today)}
                popoverAlign="start"
                contentAlign="start"
                isLoading={isLoading}
                pickupDate={pickupDateState}
                pickupTime={pickupTime}
                calendarOpen={returnCalendarOpen}
                onCalendarOpenChange={setReturnCalendarOpen}
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
