"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search, MapPin } from "lucide-react";
import { Id } from "../convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Define the expected shape of a vehicle object (can be refined)
interface Vehicle {
  _id: Id<"vehicles">;
  make: string;
  model: string;
  year: number;
  type: string;
  pricePerDay: number;
  location: string; // This will be the primary search field for location
  features: string[];
  status: string;
  images: Id<"_storage">[];
  mainImageId?: Id<"_storage">;
}

interface VehicleSearchFilterFormProps {
  onSearchSubmit: (searchParams: {
    deliveryLocation: string;
    pickupDate: Date;
    pickupTime: string;
    restitutionLocation: string;
    returnDate: Date;
    returnTime: string;
  }) => void;
  initialDeliveryLocation?: string;
  initialRestitutionLocation?: string;
  initialPickupDate?: Date;
  initialReturnDate?: Date;
}

const hardcodedLocations = [
  "Cluj-Napoca Airport",
  "Cluj-Napoca City Center",
  "Iulius Mall Cluj",
  "Sigma Shopping Center",
  "Vivo! Cluj-Napoca",
  "Floresti Central",
  "Baciu Industrial Park",
  "Apahida East Gate",
  "Turda Salt Mine Entrance",
  "Gara Cluj-Napoca"
];

const defaultDeliveryLocation = "Cluj-Napoca Airport";

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push({ time: `${String(hour).padStart(2, "0")}:00`, available: true });
    slots.push({ time: `${String(hour).padStart(2, "0")}:30`, available: true });
  }
  slots.filter(s => parseInt(s.time.split(":")[0]) < 8).forEach(s => s.available = false);
  return slots;
};

const timeSlots = generateTimeSlots();

export function VehicleSearchFilterForm({
  onSearchSubmit,
  initialDeliveryLocation = defaultDeliveryLocation,
  initialRestitutionLocation,
  initialPickupDate,
  initialReturnDate,
}: VehicleSearchFilterFormProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const defaultPickupDate = initialPickupDate || new Date(new Date().setDate(today.getDate() + 1));
  const defaultReturnDate = initialReturnDate || new Date(new Date(defaultPickupDate).setDate(defaultPickupDate.getDate() + 7));

  const [deliveryLocation, setDeliveryLocation] = React.useState<string>(initialDeliveryLocation);
  const [restitutionLocation, setRestitutionLocation] = React.useState<string>(initialRestitutionLocation || initialDeliveryLocation);

  const [pickupDateState, setPickupDateState] = React.useState<Date>(defaultPickupDate);
  const [pickupTime, setPickupTime] = React.useState<string | null>("10:00");

  const [returnDateState, setReturnDateState] = React.useState<Date>(defaultReturnDate);
  const [returnTime, setReturnTime] = React.useState<string | null>("10:00");

  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (initialRestitutionLocation === undefined || initialRestitutionLocation === deliveryLocation) {
        if (!initialRestitutionLocation) {
             setRestitutionLocation(deliveryLocation);
        }
    }
  }, [deliveryLocation, initialRestitutionLocation]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!deliveryLocation || !pickupDateState || !pickupTime || !restitutionLocation || !returnDateState || !returnTime) {
      alert("Please fill in all required fields including times.");
      setIsLoading(false);
      return;
    }

    if (returnDateState < pickupDateState) {
      alert("Return date must be after or the same as pick-up date.");
      setIsLoading(false);
      return;
    }
    if (returnDateState.getTime() === pickupDateState.getTime() && returnTime <= pickupTime) {
      alert("Return time must be after pick-up time if dates are the same.");
      setIsLoading(false);
      return;
    }

    onSearchSubmit({
      deliveryLocation,
      pickupDate: pickupDateState,
      pickupTime,
      restitutionLocation,
      returnDate: returnDateState,
      returnTime,
    });

    setTimeout(() => {
      setIsLoading(false);
      console.log("Search submitted from form with:", { deliveryLocation, pickupDateState, pickupTime, restitutionLocation, returnDateState, returnTime });
    }, 500);
  };

  const LocationSelectComponent = ({ id, label, value, onValueChange, placeholder, disabled } : {
    id: string;
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    disabled: boolean;
  }) => (
    <div className="grid gap-1.5 w-full">
        <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
        <Select onValueChange={onValueChange} defaultValue={value} disabled={disabled}>
            <SelectTrigger id={id} className="text-base py-2.5 pl-3 pr-3 data-[placeholder]:text-muted-foreground">
                <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {hardcodedLocations.map(loc => (
                    <SelectItem key={loc} value={loc} className="text-base">
                        {loc}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
  );

  const DateTimePickerComponent = ({ id, label, dateState, setDateState, timeState, setTimeState, minDate, disabledDateRanges, popoverAlign = "start" } : any) => (
    <div className="grid gap-1.5 w-full">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal text-base py-2.5 pl-3 pr-3",
              !dateState && "text-muted-foreground"
            )}
            disabled={isLoading}
          >
            <CalendarIcon className="mr-2 h-5 w-5 text-muted-foreground" />
            {dateState ? 
              `${format(dateState, "EEE, MMM d")} at ${timeState || "Select time"}` :
              <span>Pick a date & time</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex max-sm:flex-col bg-card shadow-xl border-border" align={popoverAlign}>
          <Calendar
            mode="single"
            selected={dateState}
            onSelect={(newDate) => {
              if (newDate) {
                setDateState(newDate);
                if (id === "pickupDate" && returnDateState < newDate) {
                    setReturnDateState(newDate);
                }
              }
            }}
            className="p-2 sm:pe-3 border-border max-sm:border-b sm:border-r"
            disabled={disabledDateRanges}
            initialFocus
          />
          <div className="relative w-full max-sm:min-h-[180px] sm:w-40">
            <ScrollArea className="h-full py-2 max-h-60 sm:max-h-[270px]">
              <div className="space-y-2 px-3">
                <div className="flex h-5 shrink-0 items-center">
                  <p className="text-xs font-medium text-muted-foreground">
                    {dateState ? format(dateState, "EEEE, MMM d") : "Select a date first"}
                  </p>
                </div>
                <div className="grid gap-1.5 max-sm:grid-cols-3 sm:grid-cols-2">
                  {timeSlots.map(({ time: timeSlot, available }) => (
                    <Button
                      key={`${id}-time-${timeSlot}`}
                      variant={timeState === timeSlot ? "default" : "outline"}
                      size="sm"
                      className="w-full text-xs h-8"
                      onClick={() => setTimeState(timeSlot)}
                      disabled={!available || isLoading || !dateState}
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


  return (
    <Card className="w-full shadow-xl relative">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl font-bold text-center">Rent Your Ideal Car</CardTitle>
        <CardDescription className="text-center text-muted-foreground text-sm md:text-base">
          Find the perfect vehicle for your dates and locations.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/4">
              <LocationSelectComponent
                id="deliveryLocation"
                label="Pick-up Location"
                value={deliveryLocation}
                onValueChange={setDeliveryLocation}
                placeholder="Select pick-up location"
                disabled={isLoading}
              />
            </div>

            <div className="w-full md:w-1/4">
              <DateTimePickerComponent
                id="pickupDate"
                label="Pick-up Date & Time"
                dateState={pickupDateState}
                setDateState={setPickupDateState}
                timeState={pickupTime}
                setTimeState={setPickupTime}
                minDate={today}
                disabledDateRanges={{ before: today }}
                popoverAlign="start"
              />
            </div>
            
            <div className="w-full md:w-1/4">
                <LocationSelectComponent
                    id="restitutionLocation"
                    label="Return Location"
                    value={restitutionLocation}
                    onValueChange={setRestitutionLocation}
                    placeholder="Select return location"
                    disabled={isLoading}
                />
            </div>

            <div className="w-full md:w-1/4">
              <DateTimePickerComponent
                id="returnDate"
                label="Return Date & Time"
                dateState={returnDateState}
                setDateState={setReturnDateState}
                timeState={returnTime}
                setTimeState={setReturnTime}
                minDate={pickupDateState || today}
                disabledDateRanges={{ before: pickupDateState || today }}
                popoverAlign="end"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-6 md:pt-8 p-4 md:p-6">
          <Button type="submit" size="lg" className="w-full md:w-auto md:px-12 text-base py-3" disabled={isLoading}>
            <Search className="mr-2 h-5 w-5" />
            {isLoading ? "Searching Cars..." : "Search Cars"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default VehicleSearchFilterForm; 