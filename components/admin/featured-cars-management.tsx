"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Vehicle } from "@/types/vehicle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, X, Car } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface FeaturedCarSlotProps {
  slot: number;
  currentVehicle?: Vehicle;
  availableVehicles: Vehicle[];
  onSetVehicle: (slot: number, vehicleId: Id<"vehicles">) => void;
  onRemoveVehicle: (slot: number) => void;
  disabled?: boolean;
}

function FeaturedCarSlot({
  slot,
  currentVehicle,
  availableVehicles,
  onSetVehicle,
  onRemoveVehicle,
  disabled = false,
}: FeaturedCarSlotProps) {
  const imageUrl = useQuery(
    api.vehicles.getImageUrl,
    currentVehicle?.mainImageId ? { imageId: currentVehicle.mainImageId } : "skip"
  );

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <CardTitle className="text-sm">Slot {slot}</CardTitle>
          </div>
          {currentVehicle && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemoveVehicle(slot)}
              disabled={disabled}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentVehicle ? (
          <div className="space-y-3">
            {/* Current Vehicle Display */}
            <div className="flex items-start gap-3">
              <div className="w-16 h-12 relative rounded-md overflow-hidden bg-muted flex-shrink-0">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={`${currentVehicle.make} ${currentVehicle.model}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Car className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {currentVehicle.make} {currentVehicle.model}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {currentVehicle.year} • {currentVehicle.pricingTiers && currentVehicle.pricingTiers.length > 0 ? currentVehicle.pricingTiers[0].pricePerDay : (currentVehicle.pricePerDay || 'N/A')} EUR/day
                </p>
                <div className="flex gap-1 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {currentVehicle.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {currentVehicle.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Change Vehicle Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Change Vehicle
              </label>
              <Select
                onValueChange={(value) => onSetVehicle(slot, value as Id<"vehicles">)}
                disabled={disabled}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select different vehicle..." />
                </SelectTrigger>
                <SelectContent>
                  {availableVehicles.map((vehicle) => (
                    <SelectItem key={vehicle._id} value={vehicle._id}>
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          /* Empty Slot */
          <div className="space-y-3">
            <div className="flex items-center justify-center h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <div className="text-center">
                <Star className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No featured car</p>
              </div>
            </div>

            {/* Select Vehicle Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Select Vehicle
              </label>
              <Select
                onValueChange={(value) => onSetVehicle(slot, value as Id<"vehicles">)}
                disabled={disabled}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Choose a vehicle..." />
                </SelectTrigger>
                <SelectContent>
                  {availableVehicles.map((vehicle) => (
                    <SelectItem key={vehicle._id} value={vehicle._id}>
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function FeaturedCarsManagement() {
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current featured cars
  const featuredCars = useQuery(api.featuredCars.getFeaturedCars);
  
  // Fetch available vehicles (excluding already featured ones)
  const availableVehicles = useQuery(api.featuredCars.getAvailableVehiclesForFeatured, {});

  // Mutations
  const setFeaturedCar = useMutation(api.featuredCars.setFeaturedCar);
  const removeFeaturedCar = useMutation(api.featuredCars.removeFeaturedCar);
  const clearAllFeaturedCars = useMutation(api.featuredCars.clearAllFeaturedCars);

  // Organize featured cars by slot
  const featuredBySlot = new Map<number, Vehicle>();
  if (featuredCars) {
    featuredCars.forEach((featured) => {
      featuredBySlot.set(featured.slot, featured.vehicle);
    });
  }

  const handleSetVehicle = async (slot: number, vehicleId: Id<"vehicles">) => {
    setIsLoading(true);
    try {
      await setFeaturedCar({ slot, vehicleId });
      toast.success(`Featured car slot ${slot} updated successfully`);
    } catch (error) {
      console.error("Error setting featured car:", error);
      toast.error(`Failed to set featured car: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveVehicle = async (slot: number) => {
    setIsLoading(true);
    try {
      await removeFeaturedCar({ slot });
      toast.success(`Featured car removed from slot ${slot}`);
    } catch (error) {
      console.error("Error removing featured car:", error);
      toast.error(`Failed to remove featured car: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all featured cars?")) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await clearAllFeaturedCars();
      toast.success(`Cleared ${result.cleared} featured cars`);
    } catch (error) {
      console.error("Error clearing featured cars:", error);
      toast.error(`Failed to clear featured cars: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!availableVehicles) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Featured Cars</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Featured Cars</CardTitle>
            <CardDescription>
              Manage the 3 featured vehicles displayed on the homepage
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={isLoading || !featuredCars?.length}
            >
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((slot) => {
            const currentVehicle = featuredBySlot.get(slot);
            
            // Get available vehicles for this slot (including current if editing)
            const availableForSlot = currentVehicle 
              ? [currentVehicle, ...availableVehicles]
              : availableVehicles;

            return (
              <FeaturedCarSlot
                key={slot}
                slot={slot}
                currentVehicle={currentVehicle}
                availableVehicles={availableForSlot}
                onSetVehicle={handleSetVehicle}
                onRemoveVehicle={handleRemoveVehicle}
                disabled={isLoading}
              />
            );
          })}
        </div>

        {availableVehicles.length === 0 && featuredCars?.length === 3 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              All available vehicles are already featured. Remove a featured car to select a different one.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
