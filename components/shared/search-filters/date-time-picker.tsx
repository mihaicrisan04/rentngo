"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { searchStorage } from "@/lib/search-storage";
import { useTranslations } from "next-intl";

const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
    slots.push(`${String(hour).padStart(2, "0")}:30`);
  }
  return slots;
};

const timeSlots = generateTimeSlots();

interface DateTimePickerProps {
  id: string;
  label: string;
  dateState: Date | undefined;
  setDateState: (date: Date | undefined) => void;
  timeState: string | null;
  setTimeState: (time: string) => void;
  minDate?: Date;
  disabledDateRanges?: { from: Date; to: Date }[] | ((date: Date) => boolean);
  popoverAlign?: "start" | "center" | "end";
  contentAlign?: "start" | "end";
  isLoading?: boolean;
  onDateChange?: (newDate: Date | undefined) => void;
  pickupDate?: Date;
  pickupTime?: string | null;
  calendarOpen?: boolean;
  onCalendarOpenChange?: (open: boolean) => void;
  onDateSelected?: () => void;
}

export function DateTimePicker({
  id,
  label,
  dateState,
  setDateState,
  timeState,
  setTimeState,
  minDate,
  disabledDateRanges,
  popoverAlign = "start",
  contentAlign = "start",
  isLoading = false,
  onDateChange,
  pickupDate,
  pickupTime,
  calendarOpen: controlledCalendarOpen,
  onCalendarOpenChange,
  onDateSelected,
}: DateTimePickerProps) {
  const t = useTranslations("search");
  const [internalCalendarOpen, setInternalCalendarOpen] = React.useState(false);

  // Use controlled or internal state
  const calendarOpen = controlledCalendarOpen ?? internalCalendarOpen;

  const setCalendarOpen = (open: boolean) => {
    if (onCalendarOpenChange) {
      onCalendarOpenChange(open);
    } else {
      setInternalCalendarOpen(open);
    }
  };

  const isTimeSlotDisabled = React.useCallback(
    (timeSlot: string) => {
      if (!dateState) return false;

      const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const today = new Date();
      const isToday = dateState.toDateString() === today.toDateString();

      if (isToday) {
        const currentTimeMinutes = today.getHours() * 60 + today.getMinutes();
        const slotTimeMinutes = timeToMinutes(timeSlot);

        // Disable if the slot time has already passed
        if (slotTimeMinutes <= currentTimeMinutes) return true;
      }

      if (!pickupDate || !pickupTime) return false;

      const isSamePickup =
        dateState.toDateString() === pickupDate.toDateString();
      if (!isSamePickup) return false;

      const currentSlotMinutes = timeToMinutes(timeSlot);
      const pickupTimeMinutes = timeToMinutes(pickupTime);

      return currentSlotMinutes <= pickupTimeMinutes;
    },
    [dateState, pickupDate, pickupTime]
  );

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      const validatedDate = searchStorage.validateDate(newDate) || newDate;
      setDateState(validatedDate);

      if (id.includes("pickup")) {
        searchStorage.updateField("pickupDate", validatedDate);
      } else if (id.includes("return")) {
        searchStorage.updateField("returnDate", validatedDate);
      }

      if (onDateChange) {
        onDateChange(validatedDate);
      }
    } else {
      setDateState(newDate);

      if (id.includes("pickup")) {
        searchStorage.updateField("pickupDate", undefined);
      } else if (id.includes("return")) {
        searchStorage.updateField("returnDate", undefined);
      }
    }
    setCalendarOpen(false);

    // Notify parent that date was selected
    if (newDate && onDateSelected) {
      onDateSelected();
    }
  };

  const handleTimeChange = (time: string) => {
    setTimeState(time);

    if (id.includes("pickup")) {
      searchStorage.updateField("pickupTime", time);
    } else if (id.includes("return")) {
      searchStorage.updateField("returnTime", time);
    }
  };

  React.useEffect(() => {
    if (timeState && dateState && pickupDate && pickupTime) {
      const isSameDate = dateState.toDateString() === pickupDate.toDateString();
      if (isSameDate && isTimeSlotDisabled(timeState)) {
        setTimeState("");
        if (id.includes("return")) {
          searchStorage.updateField("returnTime", "");
        }
      }
    }
  }, [
    pickupDate,
    pickupTime,
    dateState,
    timeState,
    id,
    setTimeState,
    isTimeSlotDisabled,
  ]);

  React.useEffect(() => {
    if (dateState) {
      const validatedDate = searchStorage.validateDate(dateState);
      if (validatedDate && validatedDate.getTime() !== dateState.getTime()) {
        setDateState(validatedDate);
        if (id.includes("pickup")) {
          searchStorage.updateField("pickupDate", validatedDate);
        } else if (id.includes("return")) {
          searchStorage.updateField("returnDate", validatedDate);
        }
      }
    }
  }, [dateState, id, setDateState]);

  return (
    <div
      className={cn(
        "grid gap-1.5 w-full",
        contentAlign === "end" && "justify-items-end"
      )}
    >
      <Label
        htmlFor={id}
        className={cn(
          "text-sm font-medium",
          contentAlign === "end" && "text-right"
        )}
      >
        {label}
      </Label>
      <div className="flex items-center gap-2 w-full rounded-md border border-input bg-background dark:bg-popover px-2 py-1.5">
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              id={id}
              variant="outline"
              className={cn(
                "gap-1 font-normal",
                !dateState && "text-muted-foreground"
              )}
              disabled={isLoading}
            >
              <CalendarIcon className="size-4 text-muted-foreground" />
              {dateState ? (
                <span>{format(dateState, "EEE, MMM d")}</span>
              ) : (
                <span>{t("selectDate")}</span>
              )}
              <ChevronDownIcon className="size-4 text-muted-foreground opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align={popoverAlign}>
            <Calendar
              mode="single"
              selected={dateState}
              onSelect={handleDateChange}
              fromDate={minDate}
              captionLayout="dropdown"
              disabled={disabledDateRanges}
              fromYear={new Date().getFullYear()}
              toYear={new Date().getFullYear() + 20}
              autoFocus
            />
          </PopoverContent>
        </Popover>

        <span className="text-sm text-muted-foreground">{t("at")}</span>

        <Button
          variant="outline"
          className={cn(
            "gap-1 font-normal",
            !timeState && "text-muted-foreground"
          )}
          disabled={isLoading || !dateState}
          asChild
        >
          <div className="relative">
            <select
              value={timeState || ""}
              onChange={(e) => handleTimeChange(e.target.value)}
              disabled={isLoading || !dateState}
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            >
              <option value="" disabled>
                {t("selectTime")}
              </option>
              {timeSlots.map((slot) => (
                <option
                  key={`${id}-time-${slot}`}
                  value={slot}
                  disabled={isTimeSlotDisabled(slot)}
                >
                  {slot}
                </option>
              ))}
            </select>
            <span>{timeState || t("selectTime")}</span>
            <ChevronDownIcon className="size-4 text-muted-foreground opacity-50" />
          </div>
        </Button>
      </div>
    </div>
  );
}

export default DateTimePicker;
