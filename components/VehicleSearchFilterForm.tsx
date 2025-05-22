"use client";

import * as React from "react";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { Id } from "../convex/_generated/dataModel";
import { useRouter } from 'next/navigation';

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
import { LocationPicker } from "./LocationPicker";
import { DateTimePicker } from "./DateTimePicker";

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
  initialDeliveryLocation?: string;
  initialRestitutionLocation?: string;
  initialPickupDate?: Date;
  initialReturnDate?: Date;
}

const defaultDeliveryLocation = "Aeroport Cluj-Napoca";

export function VehicleSearchFilterForm({
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
  const router = useRouter();

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

    // Construct query parameters
    const params = new URLSearchParams();
    params.append("deliveryLocation", deliveryLocation);
    params.append("pickupDate", Math.floor(pickupDateState.getTime() / 1000).toString());
    params.append("pickupTime", pickupTime);
    params.append("restitutionLocation", restitutionLocation);
    params.append("returnDate", Math.floor(returnDateState.getTime() / 1000).toString());
    params.append("returnTime", returnTime);

    router.push(`/cars?${params.toString()}`);

    setTimeout(() => {
      setIsLoading(false);
      console.log("Search submitted from form with:", { deliveryLocation, pickupDateState, pickupTime, restitutionLocation, returnDateState, returnTime });
    }, 500);
  };

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
              <LocationPicker
                id="deliveryLocation"
                label="Pick-up Location"
                value={deliveryLocation}
                onValueChange={setDeliveryLocation}
                placeholder="Select pick-up location"
                disabled={isLoading}
                contentAlign="end"
              />
              <DateTimePicker
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
                isLoading={isLoading}
                onDateChange={(newDate) => {
                  if (newDate && returnDateState < newDate) {
                    setReturnDateState(newDate);
                  }
                }}
              />
            </div>

            {/* Vertical Separator */}
            <div className="hidden md:flex justify-center py-4">
              <Separator orientation="vertical" className="h-auto" />
            </div>

            {/* Column 2: Return */}
            <div className="flex flex-col gap-4 w-full md:w-1/2 py-4 px-4">
              <LocationPicker
                id="restitutionLocation"
                label="Return Location"
                value={restitutionLocation}
                onValueChange={setRestitutionLocation}
                placeholder="Select return location"
                disabled={isLoading}
                contentAlign="start"
              />
              <DateTimePicker
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
                isLoading={isLoading}
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