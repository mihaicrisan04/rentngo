"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LocationPicker } from "@/components/location-picker";
import { DateTimePicker } from "@/components/date-time-picker";
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

  return (
    <div className="mb-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>
      
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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
               disabledDateRanges={{ before: today }}
               dateState={searchState.pickupDate}
               setDateState={(date) => updateSearchField('pickupDate', date)}
               timeState={searchState.pickupTime || null}
               setTimeState={(time) => updateSearchField('pickupTime', time)}
               minDate={today}
               isLoading={isLoading}
             />
             
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
               disabledDateRanges={searchState.pickupDate ? { before: searchState.pickupDate } : { before: today }}
               isLoading={isLoading || !searchState.pickupDate}
               pickupDate={searchState.pickupDate}
               pickupTime={searchState.pickupTime || null}
             />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 