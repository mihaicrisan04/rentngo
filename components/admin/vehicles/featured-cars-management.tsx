"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Vehicle } from "@/types/vehicle";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, X, Car } from "lucide-react";
import { toast } from "sonner";
import { toastWithUndo } from "@/components/admin/shared/undo-toast";
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
    currentVehicle?.mainImageId
      ? { imageId: currentVehicle.mainImageId }
      : "skip",
  );

  return (
    <div className="flex items-center gap-2 rounded-md border p-2">
      <div className="relative h-8 w-11 shrink-0 overflow-hidden rounded bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${currentVehicle?.make} ${currentVehicle?.model}`}
            fill
            className="object-cover"
            sizes="44px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Car className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        )}
      </div>

      <Select
        value={currentVehicle?._id}
        onValueChange={(value) => onSetVehicle(slot, value as Id<"vehicles">)}
        disabled={disabled}
      >
        <SelectTrigger className="h-8 min-w-0 flex-1 text-xs">
          <SelectValue placeholder={`Slot ${slot} — empty`} />
        </SelectTrigger>
        <SelectContent>
          {availableVehicles.map((vehicle) => (
            <SelectItem key={vehicle._id} value={vehicle._id}>
              {vehicle.make} {vehicle.model} ({vehicle.year})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {currentVehicle && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemoveVehicle(slot)}
          disabled={disabled}
          aria-label={`Remove featured car from slot ${slot}`}
          className="h-7 w-7 shrink-0 p-0 text-muted-foreground hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

export function FeaturedCarsManagement() {
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current featured cars
  const featuredCars = useQuery(api.featuredCars.getFeaturedCars);

  // Fetch available vehicles (excluding already featured ones)
  const availableVehicles = useQuery(
    api.featuredCars.getAvailableVehiclesForFeatured,
    {},
  );

  // Mutations
  const setFeaturedCar = useMutation(api.featuredCars.setFeaturedCar);
  const removeFeaturedCar = useMutation(api.featuredCars.removeFeaturedCar);
  const clearAllFeaturedCars = useMutation(
    api.featuredCars.clearAllFeaturedCars,
  );

  // Organize featured cars by slot
  const featuredBySlot = new Map<number, Vehicle>();
  if (featuredCars) {
    featuredCars.forEach((featured) => {
      featuredBySlot.set(featured.slot, featured.vehicle);
    });
  }

  const handleSetVehicle = async (slot: number, vehicleId: Id<"vehicles">) => {
    const previousVehicleId = featuredBySlot.get(slot)?._id;
    setIsLoading(true);
    try {
      await setFeaturedCar({ slot, vehicleId });
      toastWithUndo({
        message: `Featured car slot ${slot} updated`,
        onUndo: () =>
          previousVehicleId
            ? setFeaturedCar({ slot, vehicleId: previousVehicleId })
            : removeFeaturedCar({ slot }),
      });
    } catch (error) {
      console.error("Error setting featured car:", error);
      toast.error(`Failed to set featured car: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveVehicle = async (slot: number) => {
    const previousVehicleId = featuredBySlot.get(slot)?._id;
    setIsLoading(true);
    try {
      await removeFeaturedCar({ slot });
      toastWithUndo({
        message: `Featured car removed from slot ${slot}`,
        onUndo: () =>
          previousVehicleId
            ? setFeaturedCar({ slot, vehicleId: previousVehicleId })
            : Promise.resolve(),
      });
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

  const header = (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-yellow-500" />
        <h2 className="text-sm font-semibold">Featured cars</h2>
        <span className="text-xs text-muted-foreground">
          3 slots shown on the homepage
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleClearAll}
        disabled={isLoading || !featuredCars?.length}
        className="h-7 text-xs"
      >
        Clear all
      </Button>
    </div>
  );

  if (!availableVehicles) {
    return (
      <section className="space-y-2 rounded-lg border p-3">
        {header}
        <div className="grid gap-2 sm:grid-cols-3">
          {[1, 2, 3].map((slot) => (
            <div
              key={slot}
              className="h-[52px] animate-pulse rounded-md bg-muted"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-2 rounded-lg border p-3">
      {header}

      <div className="grid gap-2 sm:grid-cols-3">
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
        <p className="text-xs text-muted-foreground">
          All available vehicles are already featured. Remove one to select a
          different vehicle.
        </p>
      )}
    </section>
  );
}
