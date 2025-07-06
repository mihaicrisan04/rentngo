"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { searchStorage } from "@/lib/searchStorage";
import { useTranslations } from 'next-intl';

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push({ time: `${String(hour).padStart(2, "0")}:00`, available: true });
    slots.push({ time: `${String(hour).padStart(2, "0")}:30`, available: true });
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
  disabledDateRanges?: any;
  popoverAlign?: "start" | "center" | "end";
  contentAlign?: 'start' | 'end';
  isLoading?: boolean;
  onDateChange?: (newDate: Date | undefined) => void; // Optional: To handle side effects like updating return date
  // New props for pickup date-time reference
  pickupDate?: Date;
  pickupTime?: string | null;
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
  contentAlign = 'start',
  isLoading = false,
  onDateChange,
  pickupDate,
  pickupTime,
}: DateTimePickerProps) {
  const t = useTranslations('search');

  // Function to check if a time slot should be disabled
  const isTimeSlotDisabled = (timeSlot: string) => {
    // If no pickup date/time or no current date selected, don't disable any slots
    if (!pickupDate || !pickupTime || !dateState) {
      return false;
    }

    // Only restrict times if the selected date is the same as pickup date
    const isSameDate = dateState.toDateString() === pickupDate.toDateString();
    if (!isSameDate) {
      return false;
    }

    // Convert times to comparable format (minutes since midnight)
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const currentSlotMinutes = timeToMinutes(timeSlot);
    const pickupTimeMinutes = timeToMinutes(pickupTime);

    // Disable if current slot is before or equal to pickup time
    return currentSlotMinutes <= pickupTimeMinutes;
  };

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDateState(newDate);
      
      // Save to localStorage based on the component ID
      if (id.includes('pickup')) {
        searchStorage.updateField('pickupDate', newDate);
      } else if (id.includes('return')) {
        searchStorage.updateField('returnDate', newDate);
      }
      
      if (onDateChange) {
        onDateChange(newDate);
      }
    } else {
      // Handle clearing the date
      setDateState(newDate);
      
      if (id.includes('pickup')) {
        searchStorage.updateField('pickupDate', undefined);
      } else if (id.includes('return')) {
        searchStorage.updateField('returnDate', undefined);
      }
    }
  };

  const handleTimeChange = (time: string) => {
    setTimeState(time);
    
    // Save to localStorage based on the component ID
    if (id.includes('pickup')) {
      searchStorage.updateField('pickupTime', time);
    } else if (id.includes('return')) {
      searchStorage.updateField('returnTime', time);
    }
  };

  // Effect to clear return time if it becomes invalid due to pickup time change
  React.useEffect(() => {
    if (timeState && dateState && pickupDate && pickupTime) {
      const isSameDate = dateState.toDateString() === pickupDate.toDateString();
      if (isSameDate && isTimeSlotDisabled(timeState)) {
        // Clear the invalid time
        setTimeState('');
        if (id.includes('return')) {
          searchStorage.updateField('returnTime', '');
        }
      }
    }
  }, [pickupDate, pickupTime, dateState, timeState, id, setTimeState]);

  return (
    <div className={cn("grid gap-1.5 w-full", contentAlign === 'end' && "justify-items-end")}>
      <Label htmlFor={id} className={cn("text-sm font-medium", contentAlign === 'end' && "text-right")}>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal text-base w-full",
              !dateState && "text-muted-foreground"
            )}
            disabled={isLoading}
          >
            <CalendarIcon className="mr-2 h-5 w-5 text-muted-foreground" />
            {dateState ?
              `${format(dateState, "EEE, MMM d")} at ${timeState || t('selectTime')}` :
              <span>{t('pickDateTime')}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-full p-0 flex max-sm:flex-col bg-card shadow-xl border-border" align={popoverAlign}>
          <Calendar
            mode="single"
            selected={dateState}
            onSelect={handleDateChange}
            fromDate={minDate}
            className="p-2 sm:pe-3 border-border max-sm:border-b sm:border-r"
            disabled={disabledDateRanges}
            initialFocus
          />
          <div className="relative w-full max-sm:h-60 sm:w-40 sm:h-[270px]">
            <ScrollArea className="h-full py-2">
              <div className="space-y-2 px-3">
                <div className="flex h-5 shrink-0 items-center">
                  <p className="text-xs font-medium text-muted-foreground">
                    {dateState ? format(dateState, "EEEE, MMM d") : t('selectDateFirst')}
                  </p>
                </div>
                <div className="grid gap-1.5 max-sm:grid-cols-3 sm:grid-cols-2">
                  {timeSlots.map(({ time: timeSlot, available }) => (
                    <Button
                      key={`${id}-time-${timeSlot}`}
                      variant={timeState === timeSlot ? "default" : "outline"}
                      size="sm"
                      className="w-full text-xs h-8"
                      onClick={() => handleTimeChange(timeSlot)}
                      disabled={!available || isLoading || !dateState || isTimeSlotDisabled(timeSlot)}
                    >
                      {timeSlot}
                    </Button>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DateTimePicker; 