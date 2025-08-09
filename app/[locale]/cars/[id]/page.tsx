"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { VehicleImageCarouselSkeleton } from "@/components/vehicle/vehicle-image-carousel-skeleton";
import { VehicleSpecifications } from "@/components/vehicle/vehicle-specifications";
import { VehicleSpecificationsSkeleton } from "@/components/vehicle/vehicle-specifications-skeleton";
import { VehiclePricingCard } from "@/components/vehicle/vehicle-pricing-card";
import { VehiclePricingCardSkeleton } from "@/components/vehicle/vehicle-pricing-card-skeleton";
import { PricingTiersTable } from "@/components/vehicle/pricing-tiers-table";
import { PricingTiersTableSkeleton } from "@/components/vehicle/pricing-tiers-table-skeleton";
import { useVehicleDetails } from "@/hooks/useVehicleDetails";
import { formatVehicleName, getVehicleTypeLabel } from "@/lib/vehicleUtils";
import { RentalDetails } from "@/components/rental-details";
import { RentalDetailsSkeleton } from "@/components/rental-details-skeleton";
import { useTranslations } from 'next-intl';
import Head from 'next/head';

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

  // Show skeleton loading state
  if (vehicle === undefined) {
    return (
      <PageLayout className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb skeleton */}
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-12" />
              <span className="text-muted-foreground">/</span>
              <Skeleton className="h-4 w-16" />
              <span className="text-muted-foreground">/</span>
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side skeletons */}
            <div className="space-y-4">
              <VehicleImageCarouselSkeleton />
              <VehicleSpecificationsSkeleton />
            </div>

            {/* Right side skeletons */}
            <div className="space-y-6">
              {/* Vehicle title skeleton */}
              <div>
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>

              {/* Rental details skeleton */}
              <RentalDetailsSkeleton />

              {/* Pricing skeleton */}
              <VehiclePricingCardSkeleton />

              {/* Reserve button skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-4 w-48 mx-auto" />
              </div>
            </div>
          </div>

          {/* Pricing tiers table skeleton */}
          <div className="mt-12">
            <PricingTiersTableSkeleton />
          </div>
        </div>
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

  // Generate schema markup for individual vehicle
  const generateVehicleSchema = () => {
    if (!vehicle) return null;

    return {
      "@context": "https://schema.org",
      "@type": "Vehicle",
      "@id": `https://rngo.com/cars/${vehicle._id}`,
      "name": vehicleName,
      "description": `${vehicleName} disponibil pentru închiriere în Cluj-Napoca. Masini de inchiriat cu Rent'n Go - servicii profesionale de închiriere auto.`,
      "brand": {
        "@type": "Brand",
        "name": vehicle.make
      },
      "model": vehicle.model,
      "vehicleModelDate": vehicle.year?.toString(),
      "bodyType": vehicle.type,
      "numberOfSeats": vehicle.seats,
      "fuelType": vehicle.fuelType || "Petrol",
      "vehicleTransmission": vehicle.transmission || "Manual",
      "vehicleEngine": {
        "@type": "EngineSpecification",
        "fuelType": vehicle.fuelType || "Petrol",
        "engineDisplacement": vehicle.engineCapacity ? `${vehicle.engineCapacity}L` : "1.6L"
      },
      "image": vehicle.images?.map(img => `https://rngo.com${img}`) || ["https://rngo.com/logo.png"],
      "url": `https://rngo.com/cars/${vehicle._id}`,
      "offers": {
        "@type": "Offer",
        "priceCurrency": "EUR",
        "price": priceDetails.basePrice || vehicle.pricingTiers?.[0]?.pricePerDay || "25",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": priceDetails.basePrice || vehicle.pricingTiers?.[0]?.pricePerDay || "25",
          "priceCurrency": "EUR",
          "unitText": "per day"
        },
        "availability": "https://schema.org/InStock",
        "validFrom": new Date().toISOString(),
        "seller": {
          "@type": "Organization",
          "name": "Rent'n Go",
          "url": "https://rngo.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Cluj \"Avram Iancu\" International Airport, Strada Traian Vuia 149-151",
            "addressLocality": "Cluj-Napoca",
            "postalCode": "400397",
            "addressCountry": "RO"
          },
          "telephone": "+40-773-932-961"
        }
      },
      "potentialAction": {
        "@type": "RentAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `https://rngo.com/reservation?vehicleId=${vehicle._id}`,
          "actionPlatform": [
            "https://schema.org/DesktopWebPlatform",
            "https://schema.org/MobileWebPlatform"
          ]
        }
      }
    };
  };

  const vehicleSchema = generateVehicleSchema();

  return (
    <>
      <Head>
        <title>{vehicleName} - Masini de Inchiriat Cluj-Napoca | Rent'n Go</title>
        <meta name="description" content={`Închiriază ${vehicleName} în Cluj-Napoca cu Rent'n Go. ${vehicle.seats} locuri, ${vehicle.fuelType || 'Petrol'}, ${vehicle.transmission || 'Manual'}. Rezervare online rapidă pentru masini de inchiriat Cluj.`} />
        <meta name="keywords" content={`${vehicleName}, masini de inchiriat cluj-napoca, ${vehicle.make} închiriere, car rental ${vehicle.model}, rent ${vehicle.make} cluj`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://rngo.com/cars/${vehicle._id}`} />
        
        {vehicleSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(vehicleSchema)
            }}
          />
        )}
      </Head>
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
    </>
  );
}
