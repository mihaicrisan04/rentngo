"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { VehicleImageCarouselWithPreloadedImages } from "@/components/features/vehicles/vehicle-image-carousel-with-preloaded-images";
import { VehicleSpecifications } from "@/components/features/vehicles/vehicle-specifications";
import { VehiclePricingCard } from "@/components/features/vehicles/vehicle-pricing-card";
import { PricingTiersTable } from "@/components/features/vehicles/pricing-tiers-table";
import {
  formatVehicleName,
  getVehicleTypeLabel,
  calculateVehiclePricingWithSeason,
} from "@/lib/vehicle-utils";
import { RentalDetails } from "@/components/shared/navigation/rental-details";
import { useTranslations } from "next-intl";
import { Vehicle } from "@/types/vehicle";
import React from "react";
import { useVehicleSearch } from "@/hooks/use-vehicle-search";
import { useDateBasedSeasonalPricing } from "@/hooks/use-date-based-seasonal-pricing";

interface CarDetailClientProps {
  vehicle: Vehicle;
  mainImageUrl: string | null;
  imageUrls: Record<string, string>;
}

export function CarDetailClient({
  vehicle,
  mainImageUrl,
  imageUrls,
}: CarDetailClientProps) {
  const t = useTranslations("carDetailPage");
  const tCommon = useTranslations("common");

  const { searchState: rentalState, updateSearchFields } = useVehicleSearch({
    persist: "onUpdate",
  });

  const { multiplier: currentMultiplier } = useDateBasedSeasonalPricing(
    rentalState.pickupDate,
    rentalState.returnDate,
  );

  const priceDetails = calculateVehiclePricingWithSeason(
    vehicle,
    currentMultiplier,
    rentalState.pickupDate,
    rentalState.returnDate,
    rentalState.deliveryLocation,
    rentalState.restitutionLocation,
    rentalState.pickupTime,
    rentalState.returnTime,
  );

  const currency = "EUR";
  // Carry the vehicle in the href so new-tab/cmd-click works; the reservation
  // page moves it into per-tab storage and strips it back to a bare URL.
  const reservationUrl = `/reservation?vehicleId=${vehicle._id}`;

  const vehicleName = formatVehicleName(
    vehicle.make,
    vehicle.model,
    vehicle.year,
  );

  return (
    <div className="py-6 px-4 md:py-10 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">{tCommon("home")}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/cars">{tCommon("cars")}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{vehicleName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Title — full width so both columns start level */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {vehicleName}
          </h1>
          {vehicle.type && (
            <Badge variant="outline" className="mt-3 rounded-lg px-3 py-1">
              {getVehicleTypeLabel(vehicle.type)}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
          {/* Left column — images + specs */}
          <div className="space-y-6">
            <div className="rounded-2xl overflow-hidden">
              <VehicleImageCarouselWithPreloadedImages
                images={vehicle.images}
                mainImageId={vehicle.mainImageId}
                vehicleName={vehicleName}
                mainImageUrl={mainImageUrl}
                imageUrls={imageUrls}
              />
            </div>
            <VehicleSpecifications vehicle={vehicle} />
          </div>

          {/* Right column — rental details + pricing + CTA */}
          <div className="space-y-6">
            <RentalDetails
              deliveryLocation={rentalState.deliveryLocation}
              pickupDate={rentalState.pickupDate}
              pickupTime={rentalState.pickupTime}
              restitutionLocation={rentalState.restitutionLocation}
              returnDate={rentalState.returnDate}
              returnTime={rentalState.returnTime}
              onUpdateDetails={updateSearchFields}
            />

            <VehiclePricingCard
              vehicle={vehicle}
              priceDetails={priceDetails}
              currency={currency}
              deliveryLocation={rentalState.deliveryLocation}
              restitutionLocation={rentalState.restitutionLocation}
              pickupDate={rentalState.pickupDate}
              returnDate={rentalState.returnDate}
            />

            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-[#055E3B] hover:bg-[#055E3B]/80 text-white font-bold py-4 text-lg rounded-xl h-14"
                asChild
              >
                <Link href={reservationUrl}>{t("reserveThisCar")}</Link>
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                {t("reserveDescription")}
              </p>
            </div>
          </div>
        </div>

        {vehicle.pricingTiers && vehicle.pricingTiers.length > 0 && (
          <div className="mt-14">
            <PricingTiersTable
              pricingTiers={vehicle.pricingTiers}
              currency={currency}
              currentDays={priceDetails.days}
              pickupDate={rentalState.pickupDate}
              returnDate={rentalState.returnDate}
            />
          </div>
        )}
      </div>
    </div>
  );
}
