"use client";

import * as React from "react";
import { MapPin } from "lucide-react";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export interface LocationWithPrice {
  name: string;
  price: number;
}

export const LOCATION_DATA: LocationWithPrice[] = [
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

// Utility function to get location price by name
export const getLocationPrice = (locationName: string): number => {
  const location = LOCATION_DATA.find(loc => loc.name === locationName);
  return location ? location.price : 0;
};

interface LocationSelectProps {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  disabled: boolean;
  locations: LocationWithPrice[];
}

const LocationSelect = ({ id, value, onValueChange, placeholder, disabled, locations }: LocationSelectProps) => {
  return (
    <div className="relative w-full">
      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
      <div className="w-full [&>div]:w-full">
        <NativeSelect
          id={id}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          disabled={disabled}
          className="text-base w-full pl-10 h-[50px]"
        >
          <NativeSelectOption value="" disabled>
            {placeholder}
          </NativeSelectOption>
          {locations.map((loc) => (
            <NativeSelectOption key={loc.name} value={loc.name}>
              {loc.name} - {loc.price} €
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
};

interface LocationPickerProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  disabled: boolean;
  contentAlign?: 'start' | 'end';
}

export function LocationPicker({ id, label, value, onValueChange, placeholder, disabled, contentAlign = 'start' }: LocationPickerProps) {
  return (
    <div className={cn("grid gap-1.5 w-full", contentAlign === 'end' && "justify-items-end")}>
      <Label htmlFor={id} id={id + "-label"} className={cn("text-sm font-medium", contentAlign === 'end' && "text-right")}>{label}</Label>
      <LocationSelect
        id={id}
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        disabled={disabled}
        locations={LOCATION_DATA}
      />
    </div>
  );
}

export default LocationPicker;
