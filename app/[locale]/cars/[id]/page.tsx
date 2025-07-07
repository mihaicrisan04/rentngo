"use client";

import * as React from "react";
import { useParams } from "next/navigation";
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
import { PageLayout } from "@/components/layout/page-layout";
import { VehicleImageCarousel } from "@/components/vehicle/vehicle-image-carrousel";
import { VehicleSpecifications } from "@/components/vehicle/vehicle-specifications";
import { VehiclePricingCard } from "@/components/vehicle/vehicle-pricing-card";
import { PricingTiersTable } from "@/components/vehicle/pricing-tiers-table";
import { useVehicleDetails } from "@/hooks/useVehicleDetails";
import { formatVehicleName, getVehicleTypeLabel } from "@/lib/vehicleUtils";
import { RentalDetails } from "@/components/rental-details";
import { useTranslations } from 'next-intl';

export default function CarDetailPage() {
  const params = useParams();
  const vehicleId = params.id as string;
  const t = useTranslations('carDetailPage');

  // Use custom hook for vehicle details and state management
  const {
    vehicle,
    rentalState,
    priceDetails,
    updateRentalDetails,
    buildReservationUrl
  } = useVehicleDetails(vehicleId);

  const currency = "EUR";
  const reservationUrl = buildReservationUrl();

  if (vehicle === undefined) {
    return (
      <PageLayout className="flex items-center justify-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </PageLayout>
    );
  }

  if (vehicle === null) {
    return (
      <PageLayout className="flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('vehicleNotFound.title')}</h1>
          <p className="text-muted-foreground mb-6">{t('vehicleNotFound.description')}</p>
          <Link href="/cars">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('vehicleNotFound.backToCars')}
            </Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const vehicleName = formatVehicleName(vehicle.make, vehicle.model, vehicle.year);

  return (
    <PageLayout className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb navigation */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">{t('breadcrumb.home')}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/cars">{t('breadcrumb.cars')}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {vehicleName}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vehicle Images */}
          <div className="space-y-4">
            <VehicleImageCarousel
              images={vehicle.images}
              mainImageId={vehicle.mainImageId}
              vehicleName={vehicleName}
            />
            <VehicleSpecifications vehicle={vehicle} />
          </div>

          {/* Vehicle Details */}
          <div className="space-y-6">
            {/* Vehicle Title */}
            <div>
              <h1 className="text-3xl font-bold">
                {vehicleName}
              </h1>
              {vehicle.type && (
                <Badge variant="outline" className="mt-2">
                  {getVehicleTypeLabel(vehicle.type)}
                </Badge>
              )}
            </div>

            {/* Rental Details Component */}
            <RentalDetails
              deliveryLocation={rentalState.deliveryLocation}
              pickupDate={rentalState.pickupDate}
              pickupTime={rentalState.pickupTime}
              restitutionLocation={rentalState.restitutionLocation}
              returnDate={rentalState.returnDate}
              returnTime={rentalState.returnTime}
              onUpdateDetails={updateRentalDetails}
            />

            {/* Pricing */}
            <VehiclePricingCard
              vehicle={vehicle}
              priceDetails={priceDetails}
              currency={currency}
              deliveryLocation={rentalState.deliveryLocation}
              restitutionLocation={rentalState.restitutionLocation}
            />

            {/* Reserve Button */}
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="w-full bg-[#055E3B] hover:bg-[#055E3B]/80 text-white font-bold py-4 text-lg"
                asChild
              >
                <Link href={reservationUrl}>
                  {t('reserveThisCar')}
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                {t('reserveDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Tiers Table - Full Width Below Main Content */}
        {vehicle.pricingTiers && vehicle.pricingTiers.length > 0 && (
          <div className="mt-12">
            <PricingTiersTable 
              pricingTiers={vehicle.pricingTiers}
              currency={currency}
              currentDays={priceDetails.days}
            />
          </div>
        )}
      </div>
    </PageLayout>
  );
}