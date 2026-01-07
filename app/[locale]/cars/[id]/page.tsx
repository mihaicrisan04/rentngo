import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { CarDetailClient } from "./CarDetailClient";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

// Vehicle structured data component for SEO
function VehicleStructuredData({
  vehicle,
  imageUrl,
  locale,
}: {
  vehicle: {
    _id: string;
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

  // Calculate base price from pricing tiers or fallback to pricePerDay
  let pricePerDay = vehicle.pricePerDay || 0;
  if (vehicle.pricingTiers && vehicle.pricingTiers.length > 0) {
    // Get the tier with lowest minDays (base price tier)
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
      url: `https://rngo.ro/${locale}/cars/${vehicle._id}`,
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const isRomanian = locale === "ro";

  try {
    const vehicle = await fetchQuery(api.vehicles.getById, {
      id: id as Id<"vehicles">,
    });

    if (!vehicle) {
      return {
        title: isRomanian
          ? "Vehicul Negăsit | Rent'n Go"
          : "Vehicle Not Found | Rent'n Go",
        description: isRomanian
          ? "Vehiculul solicitat nu a fost găsit."
          : "The requested vehicle could not be found.",
      };
    }

    const vehicleName = `${vehicle.make} ${vehicle.model}${vehicle.year ? ` ${vehicle.year}` : ""}`;
    const seats = vehicle.seats || 5;
    const fuelType = vehicle.fuelType || "Petrol";
    const transmission = vehicle.transmission || "Manual";

    // Get image URL for OG tags
    let imageUrl = "https://rngo.ro/logo.png";
    if (vehicle.mainImageId) {
      const fetchedImageUrl = await fetchQuery(api.vehicles.getImageUrl, {
        imageId: vehicle.mainImageId,
      });
      if (fetchedImageUrl) {
        imageUrl = fetchedImageUrl;
      }
    }

    const title = isRomanian
      ? `${vehicleName} - Masini de Inchiriat Cluj-Napoca | Rent'n Go`
      : `${vehicleName} - Car Rentals Cluj-Napoca | Rent'n Go`;

    const description = isRomanian
      ? `Închiriază ${vehicleName} în Cluj-Napoca cu Rent'n Go. ${seats} locuri, ${fuelType}, ${transmission}. Rezervare online rapidă pentru masini de inchiriat Cluj.`
      : `Rent ${vehicleName} in Cluj-Napoca with Rent'n Go. ${seats} seats, ${fuelType}, ${transmission}. Quick online booking for car rentals Cluj.`;

    const keywords = isRomanian
      ? `${vehicleName}, masini de inchiriat cluj-napoca, ${vehicle.make} închiriere, car rental ${vehicle.model}, rent ${vehicle.make} cluj`
      : `${vehicleName}, car rentals cluj-napoca, rent ${vehicle.make}, ${vehicle.model} rental, hire ${vehicle.make} cluj`;

    return {
      title,
      description,
      keywords,
      alternates: {
        canonical: `https://rngo.ro/${locale}/cars/${id}`,
        languages: {
          "ro-RO": `https://rngo.ro/ro/cars/${id}`,
          "en-US": `https://rngo.ro/en/cars/${id}`,
        },
      },
      openGraph: {
        title,
        description,
        type: "website",
        url: `https://rngo.ro/${locale}/cars/${id}`,
        siteName: "Rent'n Go Cluj-Napoca",
        locale: isRomanian ? "ro_RO" : "en_US",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: vehicleName,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch {
    return {
      title: isRomanian ? "Vehicul | Rent'n Go" : "Vehicle | Rent'n Go",
      description: isRomanian
        ? "Închiriere auto în Cluj-Napoca"
        : "Car rental in Cluj-Napoca",
    };
  }
}

export default async function CarDetailPage({ params }: PageProps) {
  const { id, locale } = await params;

  const vehicle = await fetchQuery(api.vehicles.getById, {
    id: id as Id<"vehicles">,
  });

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

  return (
    <>
      <VehicleStructuredData
        vehicle={{
          _id: vehicle._id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          type: vehicle.type,
          seats: vehicle.seats,
          fuelType: vehicle.fuelType,
          transmission: vehicle.transmission,
          features: vehicle.features,
          pricingTiers: vehicle.pricingTiers,
          pricePerDay: vehicle.pricePerDay,
        }}
        imageUrl={mainImageUrl || "https://rngo.ro/logo.png"}
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