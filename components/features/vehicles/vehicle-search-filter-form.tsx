"use client";

import * as React from "react";
import { useToday } from "@/hooks/use-today";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LocationPicker } from "@/components/shared/search-filters/location-picker";
import { DateTimePicker } from "@/components/shared/search-filters/date-time-picker";
import { SearchData } from "@/lib/search-storage";

interface VehicleSearchFilterFormProps {
  searchState: SearchData & { isHydrated: boolean };
  updateSearchField: <K extends keyof SearchData>(
    field: K,
    value: SearchData[K],
  ) => void;
}

export function VehicleSearchFilterForm({
  searchState,
  updateSearchField,
}: VehicleSearchFilterFormProps) {
  const today = useToday();

  const [isLoading, setIsLoading] = React.useState(false);

  // Control which picker is open for sequential flow
  const [pickupCalendarOpen, setPickupCalendarOpen] = React.useState(false);
  const [returnCalendarOpen, setReturnCalendarOpen] = React.useState(false);

  const router = useRouter();
  const t = useTranslations("search");

  const deliveryLocation = searchState.deliveryLocation ?? "";
  const restitutionLocation = searchState.restitutionLocation ?? "";
  const pickupDateState = searchState.pickupDate;
  const pickupTime = searchState.pickupTime ?? null;
  const returnDateState = searchState.returnDate;
  const returnTime = searchState.returnTime ?? null;

  const setDeliveryLocation = (value: string) =>
    updateSearchField("deliveryLocation", value);
  const setRestitutionLocation = (value: string) =>
    updateSearchField("restitutionLocation", value);
  const setPickupDateState = (value: Date | undefined) =>
    updateSearchField("pickupDate", value);
  const setPickupTime = (value: string | null) =>
    updateSearchField("pickupTime", value);
  const setReturnDateState = (value: Date | undefined) =>
    updateSearchField("returnDate", value);
  const setReturnTime = (value: string | null) =>
    updateSearchField("returnTime", value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate dates if both are provided
    if (pickupDateState && returnDateState) {
      if (returnDateState < pickupDateState) {
        alert(t("returnDateAfterPickup"));
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
                label={t("pickupLocation")}
                value={deliveryLocation}
                onValueChange={setDeliveryLocation}
                placeholder={t("selectPickupLocation")}
                disabled={isLoading}
                contentAlign="start"
              />
              <DateTimePicker
                id="pickupDate"
                label={t("pickupDateTime")}
                dateState={pickupDateState}
                setDateState={setPickupDateState}
                timeState={pickupTime}
                setTimeState={setPickupTime}
                minDate={today}
                disabledDateRanges={(date: Date) =>
                  today ? date < today : false
                }
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
                label={t("returnLocation")}
                value={restitutionLocation}
                onValueChange={setRestitutionLocation}
                placeholder={t("selectReturnLocation")}
                disabled={isLoading}
                contentAlign="start"
              />
              <DateTimePicker
                id="returnDate"
                label={t("returnDateTime")}
                dateState={returnDateState}
                setDateState={setReturnDateState}
                timeState={returnTime}
                setTimeState={setReturnTime}
                minDate={pickupDateState || today}
                disabledDateRanges={(date: Date) => {
                  const min = pickupDateState || today;
                  return min ? date < min : false;
                }}
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
          <Button
            type="submit"
            size="lg"
            className="w-full lg:w-auto lg:px-12 text-base py-3"
            disabled={isLoading}
          >
            <Search className="mr-2 h-5 w-5" />
            {isLoading ? t("searchingCars") : t("searchCars")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default VehicleSearchFilterForm;
