"use client";

import * as React from "react";
import { MapPin, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [open, setOpen] = React.useState(false);

  const handleLocationChange = (selectedLocationName: string) => {
    const newValue = selectedLocationName === value ? "" : selectedLocationName;
    onValueChange(newValue);
    
    // Save to localStorage based on the component ID (only if there's a value)
    if (newValue) {
      if (id.includes('delivery') || id.includes('pickup')) {
        searchStorage.updateField('deliveryLocation', newValue);
      } else if (id.includes('restitution') || id.includes('return')) {
        searchStorage.updateField('restitutionLocation', newValue);
      }
    } else {
      // Clear from localStorage if value is empty
      if (id.includes('delivery') || id.includes('pickup')) {
        searchStorage.updateField('deliveryLocation', undefined);
      } else if (id.includes('restitution') || id.includes('return')) {
        searchStorage.updateField('restitutionLocation', undefined);
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="text-base py-2.5 pl-3 pr-3 data-[placeholder]:text-muted-foreground h-10 w-full justify-between"
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
      <PopoverContent className="w-full max-w-full p-0">
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
                      handleLocationChange(selectedLocation.name);
                    } else {
                      handleLocationChange(""); // Or handle as an error/clear
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