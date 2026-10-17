"use client";

import * as React from "react";
import { useToday } from "@/hooks/use-today";
import { useTranslations } from "next-intl";
import { AlertCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationPicker } from "@/components/shared/search-filters/location-picker";
import { DateTimePicker } from "@/components/shared/search-filters/date-time-picker";
import type { FormErrors } from "@/lib/reservation-schema";

interface RentalDetailsCardProps {
  deliveryLocation: string;
  onDeliveryLocationChange: (value: string) => void;
  pickupDate: Date | undefined;
  onPickupDateChange: (date: Date | undefined) => void;
  pickupTime: string | null;
  onPickupTimeChange: (time: string | null) => void;
  restitutionLocation: string;
  onRestitutionLocationChange: (value: string) => void;
  returnDate: Date | undefined;
  onReturnDateChange: (date: Date | undefined) => void;
  returnTime: string | null;
  onReturnTimeChange: (time: string | null) => void;
  pickupCalendarOpen: boolean;
  onPickupCalendarOpenChange: (open: boolean) => void;
  returnCalendarOpen: boolean;
  onReturnCalendarOpenChange: (open: boolean) => void;
  errors?: FormErrors["rentalDetails"];
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-red-500 mt-1 flex items-center">
      <AlertCircle className="h-4 w-4 mr-1" />
      {message}
    </p>
  );
}

export const RentalDetailsCard = React.memo(function RentalDetailsCard({
  deliveryLocation,
  onDeliveryLocationChange,
  pickupDate,
  onPickupDateChange,
  pickupTime,
  onPickupTimeChange,
  restitutionLocation,
  onRestitutionLocationChange,
  returnDate,
  onReturnDateChange,
  returnTime,
  onReturnTimeChange,
  pickupCalendarOpen,
  onPickupCalendarOpenChange,
  returnCalendarOpen,
  onReturnCalendarOpenChange,
  errors,
}: RentalDetailsCardProps) {
  const t = useTranslations("reservationPage");

  const today = useToday();

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>{t("rentalDetails.title")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pickup Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {t("rentalDetails.pickupDetails")}
            </h4>
            <div className="space-y-4">
              <div>
                <LocationPicker
                  id="res-pickup-location"
                  label={t("rentalDetails.pickupLocation")}
                  value={deliveryLocation}
                  onValueChange={onDeliveryLocationChange}
                  placeholder={t("rentalDetails.selectPickupLocation")}
                  disabled={false}
                />
                <FieldError message={errors?.deliveryLocation} />
              </div>
              <div>
                <DateTimePicker
                  id="res-pickup-datetime"
                  label={t("rentalDetails.pickupDateTime")}
                  dateState={pickupDate}
                  setDateState={onPickupDateChange}
                  timeState={pickupTime}
                  setTimeState={onPickupTimeChange}
                  minDate={today}
                  isLoading={false}
                  calendarOpen={pickupCalendarOpen}
                  onCalendarOpenChange={onPickupCalendarOpenChange}
                  onDateSelected={() => {
                    setTimeout(() => onReturnCalendarOpenChange(true), 100);
                  }}
                />
                <FieldError message={errors?.pickupDate} />
                <FieldError message={errors?.pickupTime} />
              </div>
            </div>
          </div>

          {/* Return Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {t("rentalDetails.returnDetails")}
            </h4>
            <div className="space-y-4">
              <div>
                <LocationPicker
                  id="res-return-location"
                  label={t("rentalDetails.returnLocation")}
                  value={restitutionLocation}
                  onValueChange={onRestitutionLocationChange}
                  placeholder={t("rentalDetails.selectReturnLocation")}
                  disabled={false}
                />
                <FieldError message={errors?.restitutionLocation} />
              </div>
              <div>
                <DateTimePicker
                  id="res-return-datetime"
                  label={t("rentalDetails.returnDateTime")}
                  dateState={returnDate}
                  setDateState={onReturnDateChange}
                  timeState={returnTime}
                  setTimeState={onReturnTimeChange}
                  minDate={pickupDate || today}
                  isLoading={!pickupDate}
                  pickupDate={pickupDate}
                  pickupTime={pickupTime}
                  calendarOpen={returnCalendarOpen}
                  onCalendarOpenChange={onReturnCalendarOpenChange}
                />
                <FieldError message={errors?.returnDate} />
                <FieldError message={errors?.returnTime} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
