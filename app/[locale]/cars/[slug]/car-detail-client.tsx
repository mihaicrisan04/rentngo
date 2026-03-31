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
import { ArrowLeft } from "lucide-react";
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
import React, { useState, useEffect, useCallback } from "react";
import { searchStorage, SearchData } from "@/lib/search-storage";
import { useDateBasedSeasonalPricing } from "@/hooks/use-date-based-seasonal-pricing";



interface RentalState extends SearchData {
  isHydrated: boolean;
}

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

  const [rentalState, setRentalState] = useState<RentalState>({
    deliveryLocation: searchStorage.getDefaultLocation(),
    pickupDate: undefined,
    pickupTime: null,
    restitutionLocation: searchStorage.getDefaultLocation(),
    returnDate: undefined,
    returnTime: null,
    isHydrated: false,
  });

  const { multiplier: currentMultiplier } = useDateBasedSeasonalPricing(
    rentalState.pickupDate,
    rentalState.returnDate
  );

  useEffect(() => {
    const storedData = searchStorage.load();
    setRentalState((prev) => ({
      ...prev,
      ...storedData,
      isHydrated: true,
    }));
  }, []);

  const priceDetails = calculateVehiclePricingWithSeason(
    vehicle,
    currentMultiplier,
    rentalState.pickupDate,
    rentalState.returnDate,
    rentalState.deliveryLocation,
    rentalState.restitutionLocation,
    rentalState.pickupTime,
    rentalState.returnTime
  );

  const updateRentalDetails = useCallback((updates: Partial<SearchData>) => {
    setRentalState((prev) => {
      const newState = { ...prev, ...updates };

      if (prev.isHydrated) {
        searchStorage.save(updates);
      }

      return newState;
    });
  }, []);

  const buildReservationUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.append("vehicleId", vehicle._id);
    return `/reservation?${params.toString()}`;
  }, [vehicle._id]);

  const currency = "EUR";
  const reservationUrl = buildReservationUrl();

  const vehicleName = formatVehicleName(
    vehicle.make,
    vehicle.model,
    vehicle.year
  );

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {t("vehicleNotFound.title")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t("vehicleNotFound.description")}
          </p>
          <Link href="/cars">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("vehicleNotFound.backToCars")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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

          {/* Right column — details + pricing + CTA */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {vehicleName}
              </h1>
              {vehicle.type && (
                <Badge variant="outline" className="mt-3 rounded-lg px-3 py-1">
                  {getVehicleTypeLabel(vehicle.type)}
                </Badge>
              )}
            </div>

            <RentalDetails
              deliveryLocation={rentalState.deliveryLocation}
              pickupDate={rentalState.pickupDate}
              pickupTime={rentalState.pickupTime}
              restitutionLocation={rentalState.restitutionLocation}
              returnDate={rentalState.returnDate}
              returnTime={rentalState.returnTime}
              onUpdateDetails={updateRentalDetails}
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
