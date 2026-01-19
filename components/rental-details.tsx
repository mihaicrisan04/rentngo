"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { LocationPicker } from "@/components/location-picker";
import { DateTimePicker } from "@/components/date-time-picker";
import { SearchData } from "@/lib/searchStorage";
import { useTranslations } from 'next-intl';

interface RentalDetailsProps {
  deliveryLocation?: string;
  pickupDate?: Date;
  pickupTime?: string | null;
  restitutionLocation?: string;
  returnDate?: Date;
  returnTime?: string | null;
  onUpdateDetails?: (updates: Partial<SearchData>) => void;
}

export function RentalDetails({
  deliveryLocation,
  pickupDate,
  pickupTime,
  restitutionLocation,
  returnDate,
  returnTime,
  onUpdateDetails,
}: RentalDetailsProps) {
  const t = useTranslations('rentalDetails');
  
  // Local state for the components
  const [localDeliveryLocation, setLocalDeliveryLocation] = React.useState(deliveryLocation || "");
  const [localPickupDate, setLocalPickupDate] = React.useState<Date | undefined>(pickupDate);
  const [localPickupTime, setLocalPickupTime] = React.useState(pickupTime || "");
  const [localRestitutionLocation, setLocalRestitutionLocation] = React.useState(restitutionLocation || "");
  const [localReturnDate, setLocalReturnDate] = React.useState<Date | undefined>(returnDate);
  const [localReturnTime, setLocalReturnTime] = React.useState(returnTime || "");

  // Calendar open states for sequential flow
  const [pickupCalendarOpen, setPickupCalendarOpen] = React.useState(false);
  const [returnCalendarOpen, setReturnCalendarOpen] = React.useState(false);

  // Sync local state with props when they change (after localStorage load)
  React.useEffect(() => {
    setLocalDeliveryLocation(deliveryLocation || "");
  }, [deliveryLocation]);

  React.useEffect(() => {
    setLocalPickupDate(pickupDate);
  }, [pickupDate]);

  React.useEffect(() => {
    setLocalPickupTime(pickupTime || "");
  }, [pickupTime]);

  React.useEffect(() => {
    setLocalRestitutionLocation(restitutionLocation || "");
  }, [restitutionLocation]);

  React.useEffect(() => {
    setLocalReturnDate(returnDate);
  }, [returnDate]);

  React.useEffect(() => {
    setLocalReturnTime(returnTime || "");
  }, [returnTime]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Update parent when local state changes
  const handleUpdate = React.useCallback((field: string, value: string | Date | undefined) => {
    if (onUpdateDetails) {
      const updates: Record<string, string | Date | undefined> = {};
      updates[field] = value;
      onUpdateDetails(updates);
    }
  }, [onUpdateDetails]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>{t('title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {/* Pickup Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {t('pickupDetails')}
            </h4>
            <div className="space-y-4">
              <LocationPicker
                id="pickup-location"
                label={t('pickupLocation')}
                value={localDeliveryLocation}
                onValueChange={(value) => {
                  setLocalDeliveryLocation(value);
                  handleUpdate('deliveryLocation', value);
                }}
                placeholder={t('selectPickupLocation')}
                disabled={false}
              />
              <DateTimePicker
                id="pickup-datetime"
                label={t('pickupDateTime')}
                dateState={localPickupDate}
                setDateState={(date) => {
                  setLocalPickupDate(date);
                  handleUpdate('pickupDate', date);
                  // Auto-adjust return date if needed
                  if (date && localReturnDate && date.getTime() > localReturnDate.getTime()) {
                    setLocalReturnDate(date);
                    handleUpdate('returnDate', date);
                  }
                }}
                timeState={localPickupTime}
                setTimeState={(time) => {
                  setLocalPickupTime(time);
                  handleUpdate('pickupTime', time);
                }}
                minDate={today}
                isLoading={false}
                calendarOpen={pickupCalendarOpen}
                onCalendarOpenChange={setPickupCalendarOpen}
                onDateSelected={() => {
                  setTimeout(() => setReturnCalendarOpen(true), 100);
                }}
              />
            </div>
          </div>

          {/* Return Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {t('returnDetails')}
            </h4>
            <div className="space-y-4">
              <LocationPicker
                id="return-location"
                label={t('returnLocation')}
                value={localRestitutionLocation}
                onValueChange={(value) => {
                  setLocalRestitutionLocation(value);
                  handleUpdate('restitutionLocation', value);
                }}
                placeholder={t('selectReturnLocation')}
                disabled={false}
              />
              <DateTimePicker
                id="return-datetime"
                label={t('returnDateTime')}
                dateState={localReturnDate}
                setDateState={(date) => {
                  if (date) {
                    if (localPickupDate && date.getTime() < localPickupDate.getTime()) {
                      setLocalReturnDate(localPickupDate);
                      handleUpdate('returnDate', localPickupDate);
                    } else {
                      setLocalReturnDate(date);
                      handleUpdate('returnDate', date);
                    }
                  } else {
                    setLocalReturnDate(undefined);
                    handleUpdate('returnDate', undefined);
                  }
                }}
                timeState={localReturnTime}
                setTimeState={(time) => {
                  setLocalReturnTime(time);
                  handleUpdate('returnTime', time);
                }}
                minDate={localPickupDate || today}
                isLoading={!localPickupDate}
                pickupDate={localPickupDate}
                pickupTime={localPickupTime}
                calendarOpen={returnCalendarOpen}
                onCalendarOpenChange={setReturnCalendarOpen}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 