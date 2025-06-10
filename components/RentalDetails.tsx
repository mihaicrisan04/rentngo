"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { LocationPicker } from "@/components/LocationPicker";
import { DateTimePicker } from "@/components/DateTimePicker";
import { SearchData } from "@/lib/searchStorage";

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
  // Local state for the components
  const [localDeliveryLocation, setLocalDeliveryLocation] = React.useState(deliveryLocation || "");
  const [localPickupDate, setLocalPickupDate] = React.useState<Date | undefined>(pickupDate);
  const [localPickupTime, setLocalPickupTime] = React.useState(pickupTime || "");
  const [localRestitutionLocation, setLocalRestitutionLocation] = React.useState(restitutionLocation || "");
  const [localReturnDate, setLocalReturnDate] = React.useState<Date | undefined>(returnDate);
  const [localReturnTime, setLocalReturnTime] = React.useState(returnTime || "");

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
          <span>Your Rental Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pickup Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Pick-up Details
            </h4>
            <div className="space-y-4">
              <LocationPicker
                id="pickup-location"
                label="Pick-up Location"
                value={localDeliveryLocation}
                onValueChange={(value) => {
                  setLocalDeliveryLocation(value);
                  handleUpdate('deliveryLocation', value);
                }}
                placeholder="Select pick-up location"
                disabled={false}
              />
              <DateTimePicker
                id="pickup-datetime"
                label="Pick-up Date & Time"
                dateState={localPickupDate}
                disabledDateRanges={{ before: today }}
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
              />
            </div>
          </div>

          {/* Return Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Return Details
            </h4>
            <div className="space-y-4">
              <LocationPicker
                id="return-location"
                label="Return Location"
                value={localRestitutionLocation}
                onValueChange={(value) => {
                  setLocalRestitutionLocation(value);
                  handleUpdate('restitutionLocation', value);
                }}
                placeholder="Select return location"
                disabled={false}
              />
              <DateTimePicker
                id="return-datetime"
                label="Return Date & Time"
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
                disabledDateRanges={localPickupDate ? { before: localPickupDate } : { before: today }}
                isLoading={!localPickupDate}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 