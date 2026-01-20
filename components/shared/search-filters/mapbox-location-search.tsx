"use client";

import * as React from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

export interface LocationData {
  address: string;
  coordinates: {
    lng: number;
    lat: number;
  };
}

interface MapboxSuggestion {
  mapbox_id: string;
  name: string;
  full_address?: string;
  place_formatted?: string;
  address?: string;
}

interface MapboxLocationSearchProps {
  id: string;
  label: string;
  placeholder?: string;
  value?: LocationData | null;
  onSelect: (location: LocationData | null) => void;
  disabled?: boolean;
  className?: string;
  contentAlign?: "start" | "end";
}

export function MapboxLocationSearch({
  id,
  label,
  placeholder = "Enter location...",
  value,
  onSelect,
  disabled = false,
  className,
  contentAlign = "start",
}: MapboxLocationSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<MapboxSuggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const sessionTokenRef = React.useRef<string>(crypto.randomUUID());

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

  React.useEffect(() => {
    if (searchValue.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: searchValue,
          access_token: accessToken,
          session_token: sessionTokenRef.current,
          language: "en",
          country: "RO",
          types: "address,poi,place",
          proximity: "23.5912,46.7712",
          limit: "5",
        });

        const response = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/suggest?${params}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch suggestions");
        }

        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchValue, accessToken]);

  const handleSelect = React.useCallback(
    async (suggestion: MapboxSuggestion) => {
      try {
        const params = new URLSearchParams({
          access_token: accessToken,
          session_token: sessionTokenRef.current,
        });

        const response = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}?${params}`
        );

        if (!response.ok) {
          throw new Error("Failed to retrieve location details");
        }

        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const coords = feature.geometry.coordinates;
          const address =
            feature.properties.full_address ||
            feature.properties.place_formatted ||
            feature.properties.name ||
            suggestion.full_address ||
            suggestion.name;

          onSelect({
            address,
            coordinates: {
              lng: coords[0],
              lat: coords[1],
            },
          });

          sessionTokenRef.current = crypto.randomUUID();
        }
      } catch (error) {
        console.error("Error retrieving location:", error);
        const address =
          suggestion.full_address ||
          suggestion.place_formatted ||
          suggestion.name;
        onSelect({
          address,
          coordinates: { lng: 0, lat: 0 },
        });
      }

      setOpen(false);
      setSearchValue("");
      setSuggestions([]);
    },
    [accessToken, onSelect]
  );

  const handleClear = React.useCallback(() => {
    onSelect(null);
    setSearchValue("");
    setSuggestions([]);
  }, [onSelect]);

  if (!accessToken) {
    return (
      <div className={cn("w-full", className)}>
        <Label
          htmlFor={id}
          className={cn(
            "text-sm font-medium mb-1.5 block",
            contentAlign === "end" && "text-right"
          )}
        >
          {label}
        </Label>
        <div className="flex items-center gap-2 w-full rounded-md border border-destructive bg-background px-3 py-2 text-destructive">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="text-sm">Mapbox token not configured</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full",
        contentAlign === "end" && "text-right",
        className
      )}
    >
      <Label
        htmlFor={id}
        className={cn(
          "text-sm font-medium mb-1.5 block",
          contentAlign === "end" && "text-right"
        )}
      >
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between h-[50px] text-base font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">
                {value?.address || placeholder}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) max-w-[calc(100vw-2rem)] p-0 overflow-hidden"
          align={contentAlign}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search for a location..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="truncate"
            />
            <CommandList>
              {loading && searchValue.length >= 2 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Searching locations...
                </div>
              )}

              {!loading && searchValue.length >= 2 && suggestions.length === 0 && (
                <CommandEmpty>No locations found.</CommandEmpty>
              )}

              {!loading && searchValue.length > 0 && searchValue.length < 2 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Type at least 2 characters to search...
                </div>
              )}

              {!loading && suggestions.length > 0 && (
                <CommandGroup>
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion.mapbox_id}
                      value={suggestion.mapbox_id}
                      onSelect={() => handleSelect(suggestion)}
                      className="cursor-pointer overflow-hidden"
                    >
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                        <span className="font-medium truncate block">
                          {suggestion.name}
                        </span>
                        {suggestion.place_formatted && (
                          <span className="text-sm text-muted-foreground truncate block">
                            {suggestion.place_formatted}
                          </span>
                        )}
                      </div>
                      {value?.address === suggestion.full_address && (
                        <Check className="ml-2 h-4 w-4 shrink-0" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {value && (
                <CommandGroup>
                  <CommandItem
                    onSelect={handleClear}
                    className="cursor-pointer text-destructive"
                  >
                    Clear selection
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default MapboxLocationSearch;