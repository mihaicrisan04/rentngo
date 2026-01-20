"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LocationPicker } from "@/components/shared/search-filters/location-picker";
import { DateTimePicker } from "@/components/shared/search-filters/date-time-picker";
import { SearchData } from "@/lib/searchStorage";
import { useTranslations } from 'next-intl';

interface VehicleSearchFormProps {
  searchState: SearchData & { isHydrated: boolean };
  updateSearchField: <K extends keyof SearchData>(field: K, value: SearchData[K]) => void;
  isLoading?: boolean;
}

export function VehicleSearchForm({
  searchState,
  updateSearchField,
  isLoading = false,
}: VehicleSearchFormProps) {
  const t = useTranslations('vehicleSearchForm');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calendar open states for sequential flow
  const [pickupCalendarOpen, setPickupCalendarOpen] = React.useState(false);
  const [returnCalendarOpen, setReturnCalendarOpen] = React.useState(false);

  return (
    <div className="mb-6">
      <div className="mb-4 text-center">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>
      
      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Column 1: Pick-up */}
            <div className="flex flex-col gap-4 w-full lg:w-1/2">
              <LocationPicker
                id="deliveryLocation"
                label={t('pickupLocation')}
                value={searchState.deliveryLocation || ""}
                onValueChange={(value) => updateSearchField('deliveryLocation', value)}
                placeholder={t('selectPickup')}
                disabled={isLoading}
              />
              <DateTimePicker
                id="pickupDate"
                label={t('pickupDateTime')}
                disabledDateRanges={(date: Date) => date < today}
                dateState={searchState.pickupDate}
                setDateState={(date) => updateSearchField('pickupDate', date)}
                timeState={searchState.pickupTime || null}
                setTimeState={(time) => updateSearchField('pickupTime', time)}
                minDate={today}
                isLoading={isLoading}
                calendarOpen={pickupCalendarOpen}
                onCalendarOpenChange={setPickupCalendarOpen}
                onDateSelected={() => {
                  setTimeout(() => setReturnCalendarOpen(true), 100);
                }}
                onDateChange={(newDate) => {
                  if (newDate && searchState.returnDate && searchState.returnDate < newDate) {
                    updateSearchField('returnDate', newDate);
                  }
                }}
              />
            </div>

            {/* Column 2: Return */}
            <div className="flex flex-col gap-4 w-full lg:w-1/2">
              <LocationPicker
                id="restitutionLocation"
                label={t('returnLocation')}
                value={searchState.restitutionLocation || ""}
                onValueChange={(value) => updateSearchField('restitutionLocation', value)}
                placeholder={t('selectReturn')}
                disabled={isLoading}
              />
              <DateTimePicker
                id="returnDate"
                label={t('returnDateTime')}
                dateState={searchState.returnDate}
                setDateState={(date) => updateSearchField('returnDate', date)}
                timeState={searchState.returnTime || null}
                setTimeState={(time) => updateSearchField('returnTime', time)}
                minDate={searchState.pickupDate || today}
                disabledDateRanges={(date: Date) => date < (searchState.pickupDate || today)}
                isLoading={isLoading || !searchState.pickupDate}
                pickupDate={searchState.pickupDate}
                pickupTime={searchState.pickupTime || null}
                calendarOpen={returnCalendarOpen}
                onCalendarOpenChange={setReturnCalendarOpen}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
