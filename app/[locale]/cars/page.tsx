"use client";

import { VehicleFilters } from "@/components/vehicle/vehicle-filters";
import { VehicleFiltersSkeleton } from "@/components/vehicle/vehicle-filters-skeleton";
import { VehicleSearchForm } from "@/components/vehicle/vehicle-search-form";
import { VehicleSearchFormSkeleton } from "@/components/vehicle/vehicle-search-form-skeleton";
import { VehicleListDisplay } from "@/components/vehicle/vehicle-list-display";
import { useVehicleSearch } from "@/hooks/useVehicleSearch";
import { useVehicleList } from "@/hooks/useVehicleList";
import Head from "next/head";
// import { useTranslations } from "next-intl";

export default function CarsPage() {
  // Use custom hooks for state management
  const { searchState, updateSearchField } = useVehicleSearch();
  const { allVehicles, displayedVehicles, isLoading, error, setDisplayedVehicles } = useVehicleList(searchState.isHydrated);
  // const t = useTranslations();

  // Generate schema markup for vehicle listings
  const generateVehicleListSchema = () => {
    if (!displayedVehicles || displayedVehicles.length === 0) return null;

    const vehicleItems = displayedVehicles.slice(0, 20).map((vehicle) => ({
      "@type": "Vehicle",
      "@id": `https://rngo.ro/cars/${vehicle._id}`,
      "name": `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
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
      "offers": {
        "@type": "Offer",
        "priceCurrency": "EUR",
        "price": vehicle.pricingTiers?.[0]?.pricePerDay || "25",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": vehicle.pricingTiers?.[0]?.pricePerDay || "25",
          "priceCurrency": "EUR",
          "unitText": "per day"
        },
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "Rent'n Go",
          "url": "https://rngo.ro"
        }
      },
      "url": `https://rngo.ro/cars/${vehicle._id}`,
      "image": vehicle.images?.[0] ? `https://rngo.ro${vehicle.images[0]}` : "https://rngo.ro/logo.png"
    }));

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Masini de Inchiriat Cluj-Napoca | Car Rentals",
      "description": "Flota completă de masini de inchiriat în Cluj-Napoca cu prețuri competitive. Vehicule moderne pentru toate nevoile tale.",
      "url": "https://rngo.ro/cars",
      "numberOfItems": vehicleItems.length,
      "itemListElement": vehicleItems.map((vehicle, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": vehicle
      })),
      "provider": {
        "@type": "Organization",
        "name": "Rent'n Go",
        "url": "https://rngo.ro",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Cluj \"Avram Iancu\" International Airport, Strada Traian Vuia 149-151",
          "addressLocality": "Cluj-Napoca",
          "postalCode": "400397",
          "addressCountry": "RO"
        },
        "telephone": "+40-773-932-961"
      }
    };
  };

  const vehicleSchema = generateVehicleListSchema();

  return (
    <>
      <Head>
        <title>Masini de Inchiriat Cluj-Napoca | Rent&apos;n Go</title>
        <meta name="description" content="Găsește masini de inchiriat Cluj-Napoca cu Rent'n Go. Flotă largă de vehicule moderne, prețuri competitive, rezervare online rapidă. Car rentals Cluj-Napoca disponibile 24/7." />
        <meta name="keywords" content="masini de inchiriat cluj-napoca, car rentals cluj, închiriere auto cluj, rent car cluj-napoca, vehicule închiriere cluj" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rngo.ro/cars" />

        {vehicleSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(vehicleSchema)
            }}
          />
        )}
      </Head>
      <div className="p-4 md:p-6 flex flex-col gap-6">
        <div className="max-w-6xl mx-auto w-full">
          {/* Search Form - show skeleton while loading or not hydrated */}
          {(!searchState.isHydrated || isLoading) ? (
            <VehicleSearchFormSkeleton />
          ) : (
            <VehicleSearchForm
              searchState={searchState}
              updateSearchField={updateSearchField}
              isLoading={isLoading}
            />
          )}

          {/* Filters - show skeleton while loading or when vehicles aren't loaded */}
          {(!searchState.isHydrated || isLoading || !allVehicles) ? (
            <VehicleFiltersSkeleton />
          ) : (
            <VehicleFilters
              allVehicles={allVehicles}
              onFilterChange={setDisplayedVehicles}
            />
          )}

          {/* Vehicle List Display - already has internal skeleton handling */}
          <VehicleListDisplay
            vehicles={displayedVehicles}
            isLoading={isLoading}
            isHydrated={searchState.isHydrated}
            error={error}
            searchState={searchState}
          />
        </div>
      </div>
    </>
  );
}
