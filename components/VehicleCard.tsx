"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Cog, Fuel, CarFront } from "lucide-react";
import { Vehicle } from "@/types/vehicle";
import { calculateVehiclePricing, buildReservationUrl } from "@/lib/vehicleUtils";

interface VehicleCardProps {
  vehicle: Vehicle;
  pickupDate?: Date | null;
  returnDate?: Date | null;
  deliveryLocation?: string | null;
  restitutionLocation?: string | null;
  pickupTime?: string | null;
  returnTime?: string | null;
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

  const priceDetails = calculateVehiclePricing(
    vehicle.pricePerDay,
    pickupDate,
    returnDate,
    deliveryLocation || undefined,
    restitutionLocation || undefined,
    pickupTime,
    returnTime
  );

  const currency = "EUR";

  const reservationUrl = buildReservationUrl(vehicle._id);

  const carDetailsUrl = buildCarDetailsUrl(vehicle._id);

  const handleImageClick = () => {
    // Navigate to car details page
    window.location.href = carDetailsUrl;
  };

  return (
    <div 
      className="flex flex-col bg-accent text-card-foreground overflow-hidden rounded-lg shadow-lg w-full max-w-sm transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
    >
      <div 
        className="aspect-[4/3] relative w-full bg-muted overflow-hidden cursor-pointer"
        onClick={handleImageClick}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
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
            {priceDetails.totalPrice !== null && priceDetails.days !== null && (
              <div>
                <span className="text-xl font-semibold text-yellow-600">
                  {priceDetails.totalPrice}
                </span>
                <span className="text-xs text-muted-foreground">
                  {" "}{currency} / {priceDetails.days} Day{priceDetails.days === 1 ? "" : "s"}
                </span>
                {priceDetails.totalLocationFees > 0 && (
                  <div className="text-xs text-muted-foreground/60">
                    +{priceDetails.totalLocationFees} {currency} fees
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <Button 
          // #055E3B
          className="w-full bg-[#055E3B] hover:bg-[#055E3B]/80 text-white font-bold py-3 rounded-md text-sm" 
          asChild
        >
          <Link href={reservationUrl}>
            RESERVE NOW
          </Link>
        </Button>
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex justify-around items-center w-full text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <CarFront className="h-4 w-4" />
            <span>{vehicle.year || "N/A"}</span>
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