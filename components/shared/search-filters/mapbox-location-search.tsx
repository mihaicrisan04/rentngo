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
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import {
  suggestLocations,
  retrieveLocation,
  LocationSuggestion,
} from "@/lib/mapbox";

export interface LocationData {
  address: string;
  coordinates: {
    lng: number;
    lat: number;
  };
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
  placeholder,
  value,
  onSelect,
  disabled = false,
  className,
  contentAlign = "start",
}: MapboxLocationSearchProps) {
  const t = useTranslations("search");
  const locale = useLocale();
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<LocationSuggestion[]>(
    [],
  );
  const [loading, setLoading] = React.useState(false);
  const sessionTokenRef = React.useRef<string>(crypto.randomUUID());

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

  React.useEffect(() => {
    if (searchValue.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    // Stale-response guard: without it, fast typing over a slow network can
    // resolve requests out of order and display suggestions for an older
    // query. `loading` is only set inside the debounced callback so each
    // keystroke doesn't flash the loading state before the request even fires.
    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await suggestLocations(
          searchValue,
          sessionTokenRef.current,
          locale,
        );
        if (!cancelled) {
          setSuggestions(results);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [locale, searchValue]);

  const handleSelect = React.useCallback(
    async (suggestion: LocationSuggestion) => {
      try {
        const location = await retrieveLocation(
          suggestion.mapbox_id,
          sessionTokenRef.current,
          locale,
        );
        const address =
          location.fullAddress ||
          location.placeFormatted ||
          location.name ||
          suggestion.full_address ||
          suggestion.place_formatted ||
          suggestion.name;

        onSelect({
          address,
          coordinates: location.coordinates,
        });

        sessionTokenRef.current = crypto.randomUUID();
      } catch (error) {
        console.error("Error retrieving location:", error);
        toast.error(t("locationRetrieveError"));
      }

      setOpen(false);
      setSearchValue("");
      setSuggestions([]);
    },
    [locale, onSelect, t],
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
            contentAlign === "end" && "text-right",
          )}
        >
          {label}
        </Label>
        <div className="flex items-center gap-2 w-full rounded-md border border-destructive bg-background px-3 py-2 text-destructive">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="text-sm">{t("mapboxTokenMissing")}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full",
        contentAlign === "end" && "text-right",
        className,
      )}
    >
      <Label
        htmlFor={id}
        className={cn(
          "text-sm font-medium mb-1.5 block",
          contentAlign === "end" && "text-right",
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
              !value && "text-muted-foreground",
            )}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">
                {value?.address ||
                  placeholder ||
                  t("defaultLocationPlaceholder")}
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
              placeholder={t("locationSearchPlaceholder")}
              value={searchValue}
              onValueChange={setSearchValue}
              className="truncate"
            />
            <CommandList>
              {loading && searchValue.length >= 2 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {t("searchingLocations")}
                </div>
              )}

              {!loading &&
                searchValue.length >= 2 &&
                suggestions.length === 0 && (
                  <CommandEmpty>{t("noLocationsFound")}</CommandEmpty>
                )}

              {!loading && searchValue.length > 0 && searchValue.length < 2 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {t("minimumCharacters")}
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
                    {t("clearSelection")}
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
