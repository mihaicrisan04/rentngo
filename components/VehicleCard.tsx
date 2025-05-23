"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { differenceInDays } from "date-fns";
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
  deliveryLocation?: string | null;
  restitutionLocation?: string | null;
  pickupTime?: string | null;
  returnTime?: string | null;
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

function buildReservationUrl(vehicleId: string): string {
  const params = new URLSearchParams();
  params.append("vehicleId", vehicleId);
  return `/reservation?${params.toString()}`;
}

function buildCarDetailsUrl(vehicleId: string): string {
  return `/cars/${vehicleId}`;
}

export function VehicleCard({ 
  vehicle, 
  pickupDate, 
  returnDate, 
  deliveryLocation,
  restitutionLocation,
  pickupTime,
  returnTime 
}: VehicleCardProps) {
  // Always call hooks at the top level, before any early returns
  const imageUrl = useQuery(api.vehicles.getImageUrl, 
    vehicle?.mainImageId ? { imageId: vehicle.mainImageId } : "skip"
  );

  if (!vehicle || typeof vehicle._id !== "string") {
    return <div className="p-4 border rounded-lg shadow-md bg-card text-card-foreground">Invalid vehicle data</div>;
  }

  const { totalPrice, days } = calculatePriceDetails(
    vehicle.pricePerDay,
    pickupDate,
    returnDate
  );
  const currency = "EUR";

  const reservationUrl = buildReservationUrl(vehicle._id);

  const carDetailsUrl = buildCarDetailsUrl(vehicle._id);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on the reserve button
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a[href*="reservation"]')) {
      return;
    }
    
    // Navigate to car details page with search parameters
    window.location.href = carDetailsUrl;
  };

  return (
    <div 
      className="flex flex-col bg-card text-card-foreground overflow-hidden rounded-lg shadow-lg w-full max-w-sm cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
      onClick={handleCardClick}
    >
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
              <span className="text-sm text-muted-foreground"> {currency} / Day</span>
            </div>
            {totalPrice !== null && days !== null && (
              <div>
                <span className="text-xl font-semibold text-yellow-600">
                  {totalPrice}
                </span>
                <span className="text-xs text-muted-foreground">
                  {" "}{currency} / {days} Day{days === 1 ? "" : "s"}
                </span>
              </div>
            )}
          </div>
        </div>

        <Button 
          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-md text-sm" 
          asChild
          onClick={(e) => e.stopPropagation()}
        >
          <Link href={reservationUrl}>
            RESERVE NOW
          </Link>
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