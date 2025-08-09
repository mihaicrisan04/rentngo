"use client";

import * as React from "react";
import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { searchStorage } from "@/lib/searchStorage";

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

interface LocationComboboxProps {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  disabled: boolean;
  locations: LocationWithPrice[];
}

const LocationCombobox = ({ id, value, onValueChange, placeholder, disabled, locations }: LocationComboboxProps) => {
  const handleLocationChange = (selectedLocationName: string) => {
    const newValue = selectedLocationName === value ? "" : selectedLocationName;
    onValueChange(newValue);
    
    // Save to localStorage based on the component ID 
    if (id.includes('delivery') || id.includes('pickup')) {
      searchStorage.updateField('deliveryLocation', newValue || undefined);
    } else if (id.includes('restitution') || id.includes('return')) {
      searchStorage.updateField('restitutionLocation', newValue || undefined);
    }
  };

  const selectedLocation = locations.find((loc) => loc.name === value);

  return (
    <Select
      value={value}
      onValueChange={handleLocationChange}
      disabled={disabled}
    >
      <SelectTrigger
        className="text-base w-full px-2"
        id={id}
      >
        <div className="flex items-center w-full min-w-0">
          <MapPin className="mr-2 h-5 w-5 text-muted-foreground flex-shrink-0" />
          <SelectValue placeholder={placeholder} className="truncate">
            {selectedLocation
              ? `${selectedLocation.name} - ${selectedLocation.price} €`
              : placeholder}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {locations.map((loc) => (
          <SelectItem
            key={loc.name}
            value={loc.name}
            className="text-base"
          >
            {loc.name} - {loc.price} €
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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
      <LocationCombobox
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
