"use client"

import * as React from "react"
import { Search, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { LocationSearchInput } from "./location-search-input"
import { DateTimePicker } from "./date-time-picker"

interface TransferSearchData {
  pickupLocation?: string
  dropoffLocation?: string
  pickupDate?: Date
  pickupTime?: string | null
  returnDate?: Date
  returnTime?: string | null
  passengers?: number
  transferType?: 'one-way' | 'round-trip'
}

interface TransferSearchFormProps {
  initialData?: TransferSearchData
}

export function TransferSearchForm({ initialData }: TransferSearchFormProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [pickupLocation, setPickupLocation] = React.useState<string>(initialData?.pickupLocation || "")
  const [dropoffLocation, setDropoffLocation] = React.useState<string>(initialData?.dropoffLocation || "")
  const [pickupDate, setPickupDate] = React.useState<Date | undefined>(initialData?.pickupDate)
  const [pickupTime, setPickupTime] = React.useState<string | null>(initialData?.pickupTime || null)
  const [returnDate, setReturnDate] = React.useState<Date | undefined>(initialData?.returnDate)
  const [returnTime, setReturnTime] = React.useState<string | null>(initialData?.returnTime || null)
  const [passengers, setPassengers] = React.useState<number>(initialData?.passengers || 1)
  const [transferType, setTransferType] = React.useState<'one-way' | 'round-trip'>(initialData?.transferType || 'one-way')
  const [isLoading, setIsLoading] = React.useState(false)



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate required fields
    if (!pickupLocation || !dropoffLocation || !pickupDate || !pickupTime) {
      alert("Please fill in all required fields.")
      setIsLoading(false)
      return
    }

    // Validate return trip fields if round-trip is selected
    if (transferType === 'round-trip' && (!returnDate || !returnTime)) {
      alert("Please fill in return date and time for round-trip transfers.")
      setIsLoading(false)
      return
    }

    // Validate dates
    if (pickupDate && returnDate && transferType === 'round-trip') {
      if (returnDate < pickupDate) {
        alert("Return date must be after pickup date.")
        setIsLoading(false)
        return
      }
    }

    console.log("Transfer search:", {
      pickupLocation,
      dropoffLocation,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
      passengers,
      transferType,
    })

    // Here you would typically navigate to a results page or trigger a search
    // For now, we'll just log the data
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const canSearch = pickupLocation && dropoffLocation && pickupDate && pickupTime && 
    (transferType === 'one-way' || (returnDate && returnTime))

  return (
    <Card className="w-full shadow-xl relative">
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4 lg:p-6 pb-0">
          {/* Transfer Type Selection */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">Transfer Type</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={transferType === 'one-way' ? 'default' : 'outline'}
                onClick={() => setTransferType('one-way')}
                className="flex-1"
              >
                One Way
              </Button>
              <Button
                type="button"
                variant={transferType === 'round-trip' ? 'default' : 'outline'}
                onClick={() => setTransferType('round-trip')}
                className="flex-1"
              >
                Round Trip
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Column 1: Pickup Details */}
            <div className="flex flex-col gap-4 w-full lg:w-1/2">
              <LocationSearchInput
                id="pickupLocation"
                label="Pickup Location"
                placeholder="Enter pickup location..."
                value={pickupLocation}
                onValueChange={setPickupLocation}
                disabled={isLoading}
              />
              <DateTimePicker
                id="pickupDateTime"
                label="Pickup Date & Time"
                dateState={pickupDate}
                setDateState={setPickupDate}
                timeState={pickupTime}
                setTimeState={setPickupTime}
                minDate={today}
                disabledDateRanges={{ before: today }}
                popoverAlign="start"
                contentAlign="start"
                isLoading={isLoading}
                onDateChange={(newDate) => {
                  if (newDate && returnDate && returnDate < newDate) {
                    setReturnDate(newDate)
                  }
                }}
              />
            </div>

            {/* Arrow Separator */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="flex flex-col items-center gap-2">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                {transferType === 'round-trip' && (
                  <ArrowRight className="h-6 w-6 text-muted-foreground rotate-180" />
                )}
              </div>
            </div>

            {/* Column 2: Dropoff Details */}
            <div className="flex flex-col gap-4 w-full lg:w-1/2">
              <LocationSearchInput
                id="dropoffLocation"
                label="Dropoff Location"
                placeholder="Enter dropoff location..."
                value={dropoffLocation}
                onValueChange={setDropoffLocation}
                disabled={isLoading}
              />
              
              {transferType === 'round-trip' && (
                <DateTimePicker
                  id="returnDateTime"
                  label="Return Date & Time"
                  dateState={returnDate}
                  setDateState={setReturnDate}
                  timeState={returnTime}
                  setTimeState={setReturnTime}
                  minDate={pickupDate || today}
                  disabledDateRanges={{ before: pickupDate || today }}
                  popoverAlign="end"
                  contentAlign="start"
                  isLoading={isLoading}
                  pickupDate={pickupDate}
                  pickupTime={pickupTime}
                />
              )}
            </div>
          </div>

          {/* Passengers Selection */}
          <div className="mt-6">
            <Label htmlFor="passengers" className="text-sm font-medium mb-1.5 block">
              Number of Passengers
            </Label>
            <Select value={passengers.toString()} onValueChange={(value) => setPassengers(parseInt(value))}>
              <SelectTrigger className="w-full h-12">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select passengers" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center pt-4 lg:pt-8 sm:pt-6 lg:p-6 md:pt-8">
          <Button 
            type="submit" 
            size="lg" 
            className="w-full lg:w-auto lg:px-12 text-base py-3" 
            disabled={isLoading || !canSearch}
          >
            <Search className="mr-2 h-5 w-5" />
            {isLoading ? "Searching Transfers..." : "Search Transfers"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
} 
