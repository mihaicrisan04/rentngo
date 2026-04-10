import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { CarDetailClient } from "./car-detail-client";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata, jsonLdScriptContent } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

function VehicleStructuredData({
  vehicle,
  imageUrl,
  locale,
}: {
  vehicle: {
    _id: string;
    slug?: string;
    make: string;
    model: string;
    year?: number;
    type?: string;
    seats?: number;
    fuelType?: string;
    transmission?: string;
    features?: string[];
    pricingTiers?: { minDays: number; maxDays: number | null; pricePerDay: number }[];
    pricePerDay?: number;
  };
  imageUrl: string;
  locale: string;
}) {
  const isRomanian = locale === "ro";
  const vehicleName = `${vehicle.make} ${vehicle.model}${vehicle.year ? ` ${vehicle.year}` : ""}`;
  const urlSlug = vehicle.slug || vehicle._id;

  let pricePerDay = 0;
  if (vehicle.pricingTiers && vehicle.pricingTiers.length > 0) {
    const sortedTiers = [...vehicle.pricingTiers].sort((a, b) => a.minDays - b.minDays);
    pricePerDay = sortedTiers[0].pricePerDay;
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": ["Product", "Car"],
    name: vehicleName,
    description: isRomanian
      ? `Închiriază ${vehicleName} în Cluj-Napoca. ${vehicle.seats || 5} locuri, ${vehicle.fuelType || "Petrol"}, ${vehicle.transmission || "Manual"}.`
      : `Rent ${vehicleName} in Cluj-Napoca. ${vehicle.seats || 5} seats, ${vehicle.fuelType || "Petrol"}, ${vehicle.transmission || "Manual"}.`,
    image: imageUrl,
    brand: {
      "@type": "Brand",
      name: vehicle.make,
    },
    model: vehicle.model,
    vehicleModelDate: vehicle.year?.toString(),
    bodyType: vehicle.type || "Car",
    fuelType: vehicle.fuelType || "Petrol",
    vehicleTransmission: vehicle.transmission === "Automatic" ? "AutomaticTransmission" : "ManualTransmission",
    seatingCapacity: vehicle.seats || 5,
    numberOfDoors: 4,
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: pricePerDay,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      availability: "https://schema.org/InStock",
      url: `https://rngo.ro/${locale}/cars/${urlSlug}`,
      seller: {
        "@type": "AutoRental",
        name: "Rent'n Go",
        url: "https://rngo.ro",
        telephone: "+40-773-932-961",
        address: {
          "@type": "PostalAddress",
          streetAddress: 'Cluj "Avram Iancu" International Airport, Strada Traian Vuia 149-151',
          addressLocality: "Cluj-Napoca",
          postalCode: "400397",
          addressCountry: "RO",
        },
      },
      itemCondition: "https://schema.org/UsedCondition",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: pricePerDay,
        priceCurrency: "EUR",
        unitCode: "DAY",
        unitText: isRomanian ? "pe zi" : "per day",
      },
    },
    ...(vehicle.features && vehicle.features.length > 0
      ? {
          additionalProperty: vehicle.features.map((feature) => ({
            "@type": "PropertyValue",
            name: "Feature",
            value: feature,
          })),
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdScriptContent(schema) }}
    />
  );
}

function BreadcrumbStructuredData({
  vehicleName,
  slug,
  locale,
}: {
  vehicleName: string;
  slug: string;
  locale: string;
}) {
  const isRomanian = locale === "ro";
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isRomanian ? "Acasă" : "Home",
        item: `https://rngo.ro/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: isRomanian ? "Mașini" : "Cars",
        item: `https://rngo.ro/${locale}/cars`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: vehicleName,
        item: `https://rngo.ro/${locale}/cars/${slug}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdScriptContent(breadcrumbData) }}
    />
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;

  try {
    const vehicle = await fetchQuery(api.vehicles.getBySlug, { slug });

    if (!vehicle) {
      return {
        title: locale === "ro" ? "Vehicul Negăsit" : "Vehicle Not Found",
      };
    }

    const vehicleName = `${vehicle.make} ${vehicle.model}${vehicle.year ? ` ${vehicle.year}` : ""}`;
    const seats = vehicle.seats || 5;
    const fuelType = vehicle.fuelType || "Petrol";
    const transmission = vehicle.transmission || "Manual";

    let imageUrl = "https://rngo.ro/logo.png";
    if (vehicle.mainImageId) {
      const fetchedImageUrl = await fetchQuery(api.vehicles.getImageUrl, {
        imageId: vehicle.mainImageId,
      });
      if (fetchedImageUrl) {
        imageUrl = fetchedImageUrl;
      }
    }

    return buildMetadata({
      locale,
      path: `/cars/${slug}`,
      title: {
        ro: `${vehicleName} - Masini de Inchiriat Cluj-Napoca`,
        en: `${vehicleName} - Car Rentals Cluj-Napoca`,
      },
      description: {
        ro: `Închiriază ${vehicleName} în Cluj-Napoca cu Rent'n Go. ${seats} locuri, ${fuelType}, ${transmission}. Rezervare online rapidă pentru masini de inchiriat Cluj.`,
        en: `Rent ${vehicleName} in Cluj-Napoca with Rent'n Go. ${seats} seats, ${fuelType}, ${transmission}. Quick online booking for car rentals Cluj.`,
      },
      keywords: {
        ro: `${vehicleName}, masini de inchiriat cluj-napoca, ${vehicle.make} închiriere, car rental ${vehicle.model}, rent ${vehicle.make} cluj`,
        en: `${vehicleName}, car rentals cluj-napoca, rent ${vehicle.make}, ${vehicle.model} rental, hire ${vehicle.make} cluj`,
      },
      image: { url: imageUrl, width: 1200, height: 630, alt: vehicleName },
    });
  } catch {
    return {
      title: locale === "ro" ? "Vehicul" : "Vehicle",
    };
  }
}

export async function generateStaticParams() {
  const vehicles = await fetchQuery(api.vehicles.getAllVehicles);
  const slugs = vehicles.filter((v) => v.slug).map((v) => v.slug!);
  return slugs.flatMap((slug) => [
    { locale: "ro", slug },
    { locale: "en", slug },
  ]);
}

export default async function CarDetailPage({ params }: PageProps) {
  const { slug, locale } = await params;

  const vehicle = await fetchQuery(api.vehicles.getBySlug, { slug });

  if (!vehicle) {
    notFound();
  }

  let mainImageUrl: string | null = null;
  if (vehicle.mainImageId) {
    mainImageUrl = await fetchQuery(api.vehicles.getImageUrl, {
      imageId: vehicle.mainImageId,
    });
  }

  const imageUrls: Record<string, string> = {};
  if (vehicle.images && vehicle.images.length > 0) {
    const urls = await Promise.all(
      vehicle.images.map(async (imageId) => {
        const url = await fetchQuery(api.vehicles.getImageUrl, {
          imageId,
        });
        return { imageId: imageId.toString(), url };
      })
    );
    urls.forEach(({ imageId, url }) => {
      if (url) {
        imageUrls[imageId] = url;
      }
    });
  }

  const vehicleName = `${vehicle.make} ${vehicle.model}${vehicle.year ? ` ${vehicle.year}` : ""}`;

  return (
    <>
      <VehicleStructuredData
        vehicle={{
          _id: vehicle._id,
          slug: vehicle.slug,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          type: vehicle.type,
          seats: vehicle.seats,
          fuelType: vehicle.fuelType,
          transmission: vehicle.transmission,
          features: vehicle.features,
          pricingTiers: vehicle.pricingTiers,
        }}
        imageUrl={mainImageUrl || "https://rngo.ro/logo.png"}
        locale={locale}
      />
      <BreadcrumbStructuredData
        vehicleName={vehicleName}
        slug={slug}
        locale={locale}
      />
      <CarDetailClient
        vehicle={vehicle}
        mainImageUrl={mainImageUrl}
        imageUrls={imageUrls}
      />
    </>
  );
}
