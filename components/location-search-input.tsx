"use client"

import * as React from "react"
import { MapPin } from "lucide-react"
import { autocomplete } from "@/lib/google"
import { PlaceAutocompleteResult } from "@googlemaps/google-maps-services-js"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Label } from "@/components/ui/label"

interface LocationSearchInputProps {
  id: string
  label: string
  placeholder?: string
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function LocationSearchInput({
  id,
  label,
  placeholder = "Enter location...",
  value,
  onValueChange,
  disabled = false,
  className
}: LocationSearchInputProps) {
  const [searchValue, setSearchValue] = React.useState(value)
  const [predictions, setPredictions] = React.useState<PlaceAutocompleteResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const [showDropdown, setShowDropdown] = React.useState(false)

  // Update search value when external value changes
  React.useEffect(() => {
    setSearchValue(value)
  }, [value])

  // Debounced search effect
  React.useEffect(() => {
    if (searchValue.length >= 3) {
      setLoading(true)
      setShowDropdown(true)
      
      const timer = setTimeout(async () => {
        try {
          const results = await autocomplete(searchValue)
          setPredictions(results || [])
        } catch (error) {
          console.error("Error fetching predictions:", error)
          setPredictions([])
        } finally {
          setLoading(false)
        }
      }, 300) // 0.3 second debounce

      return () => clearTimeout(timer)
    } else {
      setPredictions([])
      setLoading(false)
      setShowDropdown(searchValue.length > 0)
    }
  }, [searchValue])

  const handleInputChange = (newValue: string) => {
    setSearchValue(newValue)
    onValueChange(newValue)
    setShowDropdown(newValue.length > 0)
  }

  const handleSelect = (selectedValue: string) => {
    setSearchValue(selectedValue)
    onValueChange(selectedValue)
    setShowDropdown(false)
    setPredictions([])
  }

  const handleInputFocus = () => {
    if (searchValue.length > 0) {
      setShowDropdown(true)
    }
  }

  const handleInputBlur = () => {
    // Delay hiding to allow clicking on predictions
    setTimeout(() => {
      setShowDropdown(false)
    }, 150)
  }

  return (
    <div className={cn("w-full relative", className)}>
      <Label htmlFor={id} className="text-sm font-medium mb-1.5 block">
        {label}
      </Label>
      
      <div className="relative w-full">
        <Command className="rounded-lg border shadow-md overflow-visible w-full">
          <div className="flex items-center border-b px-3 w-full">
            <CommandInput
              placeholder={placeholder}
              value={searchValue}
              onValueChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              disabled={disabled}
              className="h-12 text-base w-full flex-1 min-w-0 px-0"
            />
          </div>
          
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 z-50 bg-popover border border-t-0 rounded-b-lg shadow-lg w-full">
              <CommandList className="max-h-60">
                {loading && searchValue.length >= 3 && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Searching locations...
                  </div>
                )}
                
                {!loading && searchValue.length >= 3 && predictions.length === 0 && (
                  <CommandEmpty>No locations found.</CommandEmpty>
                )}
                
                {!loading && searchValue.length > 0 && searchValue.length < 3 && (
                  <CommandEmpty>Type at least 3 characters to search...</CommandEmpty>
                )}
                
                {!loading && predictions.length > 0 && (
                  <CommandGroup>
                    {predictions.map((prediction) => (
                      <CommandItem
                        key={prediction.place_id}
                        value={prediction.description}
                        onSelect={() => handleSelect(prediction.description)}
                        className="cursor-pointer"
                      >
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-medium truncate">
                            {prediction.structured_formatting?.main_text || prediction.description}
                          </span>
                          {prediction.structured_formatting?.secondary_text && (
                            <span className="text-sm text-muted-foreground truncate">
                              {prediction.structured_formatting.secondary_text}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </div>
          )}
        </Command>
      </div>
    </div>
  )
} 