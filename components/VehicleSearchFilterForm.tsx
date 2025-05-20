"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search, MapPin, Check, ChevronsUpDown } from "lucide-react";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

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

interface LocationWithPrice {
  name: string;
  price: number;
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

const hardcodedLocations: LocationWithPrice[] = [
  { name: "Aeroport Cluj-Napoca", price: 0 },
  { name: "Alba-Iulia", price: 80 },
  { name: "Bacau", price: 220 },
  { name: "Baia mare", price: 120 },
  { name: "Bistrita", price: 80 },
  { name: "Brasov", price: 180 },
  { name: "Bucuresti", price: 220 },
  { name: "Cluj-Napoca", price: 10 },
  { name: "Floresti", price: 10 },
  { name: "Oradea", price: 120 },
  { name: "Satu mare", price: 120 },
  { name: "Sibiu", price: 120 },
  { name: "Suceava", price: 220 },
  { name: "Targu Mures", price: 70 },
  { name: "Timisoara", price: 200 },
];

const defaultDeliveryLocation = "Aeroport Cluj-Napoca";

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push({ time: `${String(hour).padStart(2, "0")}:00`, available: true });
    slots.push({ time: `${String(hour).padStart(2, "0")}:30`, available: true });
  }
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
  const [restitutionLocation, setRestitutionLocation] = React.useState<string>(initialRestitutionLocation || defaultDeliveryLocation);

  const [pickupDateState, setPickupDateState] = React.useState<Date>(defaultPickupDate);
  const [pickupTime, setPickupTime] = React.useState<string | null>("10:00");

  const [returnDateState, setReturnDateState] = React.useState<Date>(defaultReturnDate);
  const [returnTime, setReturnTime] = React.useState<string | null>("10:00");

  const [isLoading, setIsLoading] = React.useState(false);

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

  const LocationSelectComponent = ({ id, label, value, onValueChange, placeholder, disabled, contentAlign = 'start' } : {
    id: string;
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    disabled: boolean;
    contentAlign?: 'start' | 'end';
  }) => (
    <div className={cn("grid gap-1.5 w-full", contentAlign === 'end' && "justify-items-end")}>
        <Label htmlFor={id} className={cn("text-sm font-medium", contentAlign === 'end' && "text-right")}>{label}</Label>
        <LocationCombobox
          id={id}
          value={value}
          onValueChange={onValueChange}
          placeholder={placeholder}
          disabled={disabled}
          locations={hardcodedLocations}
        />
    </div>
  );

  const LocationCombobox = ({ id, value, onValueChange, placeholder, disabled, locations } : {
    id: string;
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    disabled: boolean;
    locations: LocationWithPrice[];
  }) => {
    const [open, setOpen] = React.useState(false);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="text-base py-2.5 pl-3 pr-3 data-[placeholder]:text-muted-foreground h-10 w-74 justify-between"
            disabled={disabled}
            id={id}
          >
            <div className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
              {value
                ? locations.find((loc) => loc.name === value)?.name + (typeof locations.find((loc) => loc.name === value)?.price === 'number' ? ` - ${locations.find((loc) => loc.name === value)?.price} €` : "")
                : placeholder}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-74 p-0">
          <Command>
            <CommandInput placeholder="Search location..." />
            <CommandList>
              <CommandEmpty>No location found.</CommandEmpty>
              <CommandGroup>
                {locations.map((loc) => (
                  <CommandItem
                    key={loc.name}
                    value={loc.name}
                    onSelect={(currentValue) => {
                      const selectedLocation = locations.find(l => l.name.toLowerCase() === currentValue.toLowerCase());
                      if (selectedLocation) {
                        onValueChange(selectedLocation.name === value ? "" : selectedLocation.name);
                      } else {
                        onValueChange(""); // Or handle as an error/clear
                      }
                      setOpen(false);
                    }}
                    className="text-base"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === loc.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {loc.name} - {loc.price} €
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const DateTimePickerComponent = ({ id, label, dateState, setDateState, timeState, setTimeState, minDate, disabledDateRanges, popoverAlign = "start", contentAlign = 'start' } : {
    id: string;
    label: string;
    dateState: Date | undefined;
    setDateState: (date: Date) => void;
    timeState: string | null;
    setTimeState: (time: string) => void;
    minDate: Date;
    disabledDateRanges: any;
    popoverAlign?: "start" | "center" | "end";
    contentAlign?: 'start' | 'end';
  }) => (
    <div className={cn("grid gap-1.5 w-full", contentAlign === 'end' && "justify-items-end")}>
      <Label htmlFor={id} className={cn("text-sm font-medium", contentAlign === 'end' && "text-right")}>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal text-base py-2.5 pl-3 pr-3 h-10 w-74",
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
          <div className="flex flex-col md:flex-row gap-4">
            {/* Column 1: Pick-up */}
            <div className="flex flex-col gap-4 w-full md:w-1/2 py-4 px-4">
              <LocationSelectComponent
                id="deliveryLocation"
                label="Pick-up Location"
                value={deliveryLocation}
                onValueChange={setDeliveryLocation}
                placeholder="Select pick-up location"
                disabled={isLoading}
                contentAlign="end"
              />
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
                contentAlign="end"
              />
            </div>

            {/* Vertical Separator */}
            <div className="hidden md:flex justify-center py-4">
              <Separator orientation="vertical" className="h-auto" />
            </div>

            {/* Column 2: Return */}
            <div className="flex flex-col gap-4 w-full md:w-1/2 py-4 px-4">
              <LocationSelectComponent
                id="restitutionLocation"
                label="Return Location"
                value={restitutionLocation}
                onValueChange={setRestitutionLocation}
                placeholder="Select return location"
                disabled={isLoading}
                contentAlign="start"
              />
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
                contentAlign="start"
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