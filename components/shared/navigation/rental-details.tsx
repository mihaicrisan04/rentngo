"use client";

import * as React from "react";
import { useToday } from "@/hooks/use-today";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { LocationPicker } from "@/components/shared/search-filters/location-picker";
import { DateTimePicker } from "@/components/shared/search-filters/date-time-picker";
import { SearchData } from "@/lib/search-storage";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("rentalDetails");

  // Calendar open states for sequential flow
  const [pickupCalendarOpen, setPickupCalendarOpen] = React.useState(false);
  const [returnCalendarOpen, setReturnCalendarOpen] = React.useState(false);

  const today = useToday();

  const handleUpdate = React.useCallback(
    (updates: Partial<SearchData>) => {
      onUpdateDetails?.(updates);
    },
    [onUpdateDetails],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>{t("title")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {/* Pickup Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {t("pickupDetails")}
            </h4>
            <div className="space-y-4">
              <LocationPicker
                id="pickup-location"
                label={t("pickupLocation")}
                value={deliveryLocation || ""}
                onValueChange={(value) =>
                  handleUpdate({ deliveryLocation: value })
                }
                placeholder={t("selectPickupLocation")}
                disabled={false}
              />
              <DateTimePicker
                id="pickup-datetime"
                label={t("pickupDateTime")}
                dateState={pickupDate}
                setDateState={(date) => {
                  // Auto-adjust return date if needed
                  if (
                    date &&
                    returnDate &&
                    date.getTime() > returnDate.getTime()
                  ) {
                    handleUpdate({ pickupDate: date, returnDate: date });
                  } else {
                    handleUpdate({ pickupDate: date });
                  }
                }}
                timeState={pickupTime || ""}
                setTimeState={(time) => handleUpdate({ pickupTime: time })}
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
              {t("returnDetails")}
            </h4>
            <div className="space-y-4">
              <LocationPicker
                id="return-location"
                label={t("returnLocation")}
                value={restitutionLocation || ""}
                onValueChange={(value) =>
                  handleUpdate({ restitutionLocation: value })
                }
                placeholder={t("selectReturnLocation")}
                disabled={false}
              />
              <DateTimePicker
                id="return-datetime"
                label={t("returnDateTime")}
                dateState={returnDate}
                setDateState={(date) => {
                  if (
                    date &&
                    pickupDate &&
                    date.getTime() < pickupDate.getTime()
                  ) {
                    handleUpdate({ returnDate: pickupDate });
                  } else {
                    handleUpdate({ returnDate: date });
                  }
                }}
                timeState={returnTime || ""}
                setTimeState={(time) => handleUpdate({ returnTime: time })}
                minDate={pickupDate || today}
                isLoading={!pickupDate}
                pickupDate={pickupDate}
                pickupTime={pickupTime || ""}
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
