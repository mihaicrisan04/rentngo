"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Cog, Fuel, CarFront, Icon } from "lucide-react";
import { gearbox } from '@lucide/lab';
import { Vehicle } from "@/types/vehicle";
import { buildReservationUrl, calculateVehiclePricingWithSeason, getPriceForDurationWithSeason } from "@/lib/vehicleUtils";
import { getBasePricePerDay } from "@/types/vehicle";
import { useSeasonalPricing } from "@/hooks/useSeasonalPricing";
import { useTranslations, useLocale } from 'next-intl';

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
  const t = useTranslations('vehicleCard');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  
  const imageUrl = useQuery(api.vehicles.getImageUrl, 
    vehicle?.mainImageId ? { imageId: vehicle.mainImageId } : "skip"
  );

  const { multiplier: currentMultiplier } = useSeasonalPricing();


  if (!vehicle || typeof vehicle._id !== "string") {
    return <div className="p-4 border rounded-lg shadow-md bg-card text-card-foreground">{tCommon('invalidData')}</div>;
  }

  const priceDetails = calculateVehiclePricingWithSeason(
    vehicle,
    currentMultiplier,
    pickupDate,
    returnDate,
    deliveryLocation || undefined,
    restitutionLocation || undefined,
    pickupTime,
    returnTime
  );

  // Calculate the current price per day based on rental duration
  const currentPricePerDay = React.useMemo(() => {
    if (priceDetails.days) {
      return getPriceForDurationWithSeason(vehicle, priceDetails.days, currentMultiplier);
    }
    // Use the base price tier (lowest minDays + highest pricePerDay) with seasonal adjustment
    const basePrice = getBasePricePerDay(vehicle);
    return Math.round(basePrice * currentMultiplier);
  }, [vehicle, priceDetails.days, currentMultiplier]);

  const currency = "EUR";

  const reservationUrl = buildReservationUrl(vehicle._id);

  const carDetailsUrl = buildCarDetailsUrl(vehicle._id);

  const handleImageClick = () => {
    // Navigate to car details page
    window.location.href = carDetailsUrl;
  };

  return (
    <div 
      className="relative flex flex-col bg-accent text-card-foreground overflow-hidden rounded-lg shadow-lg w-full max-w-sm transition-all duration-300 hover:shadow-xl hover:scale-105 group before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-primary/20 before:scale-110 before:opacity-0 before:transition-all before:duration-300 group-hover:before:opacity-100 before:pointer-events-none"
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
            <span className="text-sm">{tCommon('noImage')}</span>
          </div>
        )}
      </div>

      <div className="flex-grow p-4 space-y-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          <h3 className="text-lg font-semibold">
            {vehicle.make} {vehicle.model}
          </h3>
          <span className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Icon iconNode={gearbox} className="h-3 w-3" />
            <span>{vehicle.transmission || t('notAvailable')}</span>
          </span>
        </div>

        {/* Only show pricing when dates are selected */}
        {pickupDate && returnDate && (
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-2xl font-bold text-yellow-500">
                  {currentPricePerDay}
                </span>
                <span className="text-sm text-muted-foreground"> {currency} {t('perDay')}</span>
              </div>
              {priceDetails.totalPrice !== null && priceDetails.days !== null && (
                <div>
                  <span className="text-xl font-semibold text-yellow-600">
                    {priceDetails.totalPrice}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {" "}{currency} / {t('totalFor', { 
                      days: priceDetails.days, 
                      plural: locale === 'ro' ? ((priceDetails.days === 1) ? "" : "le") : ((priceDetails.days === 1) ? "" : "s") 
                    })}
                  </span>
                  {priceDetails.totalLocationFees > 0 && (
                    <div className="text-xs text-muted-foreground/60">
                      +{priceDetails.totalLocationFees} {currency} {t('fees')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <Button 
          // #055E3B
          className="w-full bg-[#055E3B] hover:bg-[#055E3B]/80 text-white font-bold py-3 rounded-md text-sm" 
          asChild
        >
          <Link href={reservationUrl}>
            {t('bookNow')}
          </Link>
        </Button>
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex justify-around items-center w-full text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <CarFront className="h-4 w-4" />
            <span>{vehicle.year || t('notAvailable')}</span>
          </div>
          <div className="flex items-center self-stretch px-1.5">
            <Separator orientation="vertical" />
          </div>
          <div className="flex items-center space-x-1">
            <Cog className="h-4 w-4" />
            <span>{vehicle.engineCapacity ? `${vehicle.engineCapacity.toFixed(1)} ${vehicle.engineType || ''}` : t('notAvailable')}</span>
          </div>
          <div className="flex items-center self-stretch px-1.5">
            <Separator orientation="vertical" />
          </div>
          <div className="flex items-center space-x-1">
            <Fuel className="h-4 w-4" />
            <span>{vehicle.fuelType || t('notAvailable')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VehicleCard; 
