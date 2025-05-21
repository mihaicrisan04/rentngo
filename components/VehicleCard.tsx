"use client";

import * as React from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { differenceInDays, format } from "date-fns";
import { Cog, Fuel, CarFront } from "lucide-react";

interface Vehicle {
  _id: Id<"vehicles">;
  make: string;
  model: string;
  year: number;
  type: string;
  pricePerDay: number;
  currency?: string;
  location: string;
  features: string[];
  status: string;
  images: Id<"_storage">[];
  mainImageId?: Id<"_storage">;
  title?: string;
  desc?: string;
  engineCapacity?: number;
  engineType?: string;
  fuelType?: string;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  pickupDate?: Date | null;
  returnDate?: Date | null;
}

function calculatePriceDetails(
  pricePerDay: number,
  pickup?: Date | null,
  restitution?: Date | null
): { totalPrice: number | null; days: number | null } {
  if (pickup && restitution && restitution > pickup) {
    const days = differenceInDays(restitution, pickup);
    const calculatedDays = days === 0 ? 1 : days;
    return { totalPrice: calculatedDays * pricePerDay, days: calculatedDays };
  }
  return { totalPrice: null, days: null };
}

export function VehicleCard({ vehicle, pickupDate, returnDate }: VehicleCardProps) {
  if (!vehicle || typeof vehicle._id !== "string") {
    return <div className="p-4 border rounded-lg shadow-md bg-card text-card-foreground">Invalid vehicle data</div>;
  }

  const imageUrl = vehicle.mainImageId
    ? useQuery(api.vehicles.getImageUrl, { imageId: vehicle.mainImageId })
    : null;

  const { totalPrice, days } = calculatePriceDetails(
    vehicle.pricePerDay,
    pickupDate,
    returnDate
  );
  const currency = vehicle.currency?.toUpperCase() || "EUR";
  const pricePer10Days = vehicle.pricePerDay * 10;

  return (
    <div className="flex flex-col bg-card text-card-foreground overflow-hidden rounded-lg shadow-lg w-full max-w-sm">
      <div className="aspect-[4/3] relative w-full bg-muted overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={vehicle.title || `${vehicle.make} ${vehicle.model}`}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <span className="text-sm">No Image Available</span>
          </div>
        )}
      </div>

      <div className="flex-grow p-4 space-y-4 text-center">
        <h3 className="text-lg font-semibold">
          {vehicle.make} {vehicle.model}
        </h3>

        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-2xl font-bold text-yellow-500">
                {vehicle.pricePerDay}
              </span>
              <span className="text-sm text-muted-foreground"> {currency} / Zi</span>
            </div>
            <div>
              <span className="text-xl font-semibold text-yellow-600">
                {pricePer10Days}
              </span>
              <span className="text-xs text-muted-foreground"> {currency} / 10 Zile</span>
            </div>
          </div>

          {totalPrice !== null && days !== null && (
            <p className="text-sm text-muted-foreground mt-1">
              Total selectat: <span className="font-semibold">{totalPrice} {currency}</span> / {days} Zil{days === 1 ? "a" : "e"}
            </p>
          )}
        </div>

        <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-md text-sm" asChild>
          <a href={`/dashboard/vehicles/${vehicle._id}?pickup=${pickupDate ? format(pickupDate, 'yyyy-MM-dd') : ''}&return=${returnDate ? format(returnDate, 'yyyy-MM-dd') : ''}`}>
            RESERVE NOW
          </a>
        </Button>
      </div>

      <div className="p-3 border-t border-border bg-card">
        <div className="flex justify-around items-center w-full text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <CarFront className="h-4 w-4" />
            <span>{vehicle.year}</span>
          </div>
          <div className="flex items-center self-stretch px-1.5">
            <Separator orientation="vertical" />
          </div>
          <div className="flex items-center space-x-1">
            <Cog className="h-4 w-4" />
            <span>{vehicle.engineCapacity ? `${vehicle.engineCapacity.toFixed(1)} ${vehicle.engineType || ''}` : "N/A"}</span>
          </div>
          <div className="flex items-center self-stretch px-1.5">
            <Separator orientation="vertical" />
          </div>
          <div className="flex items-center space-x-1">
            <Fuel className="h-4 w-4" />
            <span>{vehicle.fuelType || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VehicleCard; 