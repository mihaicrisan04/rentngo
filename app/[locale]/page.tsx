import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { HomePageClient } from "./HomePageClient";
import { Metadata } from "next";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const isRomanian = locale === "ro";

  return {
    title: isRomanian
      ? "Rent'n Go Cluj-Napoca | Masini de Inchiriat Cluj"
      : "Rent'n Go Cluj-Napoca | Car Rentals Cluj",
    description: isRomanian
      ? "Masini de inchiriat Cluj-Napoca cu Rent'n Go. Închiriere auto la prețuri competitive, flotă modernă, rezervare online rapidă. Cel mai bun serviciu de car rentals Cluj-Napoca."
      : "Car rentals Cluj-Napoca with Rent'n Go. Competitive prices, modern fleet, quick online booking. Best car rental service in Cluj-Napoca.",
    keywords: isRomanian
      ? "masini de inchiriat cluj-napoca, car rentals cluj, închiriere auto cluj, rent car cluj-napoca, rental cars cluj"
      : "car rentals cluj-napoca, rent car cluj, car hire cluj, vehicle rental cluj-napoca",
    alternates: {
      canonical: `https://rngo.ro/${locale}`,
      languages: {
        "ro-RO": "https://rngo.ro/ro",
        "en-US": "https://rngo.ro/en",
      },
    },
    openGraph: {
      title: isRomanian
        ? "Rent'n Go Cluj-Napoca | Masini de Inchiriat"
        : "Rent'n Go Cluj-Napoca | Car Rentals",
      description: isRomanian
        ? "Masini de inchiriat Cluj-Napoca cu Rent'n Go. Prețuri competitive și flotă modernă."
        : "Car rentals Cluj-Napoca with Rent'n Go. Competitive prices and modern fleet.",
      type: "website",
      url: `https://rngo.ro/${locale}`,
      siteName: "Rent'n Go Cluj-Napoca",
      locale: isRomanian ? "ro_RO" : "en_US",
      images: [
        {
          url: "https://rngo.ro/logo.png",
          width: 1200,
          height: 630,
          alt: "Rent'n Go Cluj-Napoca - Închiriere Mașini",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: isRomanian
        ? "Rent'n Go Cluj-Napoca | Masini de Inchiriat"
        : "Rent'n Go Cluj-Napoca | Car Rentals",
      description: isRomanian
        ? "Masini de inchiriat Cluj-Napoca cu Rent'n Go."
        : "Car rentals Cluj-Napoca with Rent'n Go.",
      images: ["https://rngo.ro/logo.png"],
    },
  };
}

// Car rental business structured data
function CarRentalSchema({ locale }: { locale: string }) {
  const isRomanian = locale === "ro";
  const schema = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    name: "Rent'n Go",
    alternateName: "Rent'n Go Cluj-Napoca",
    description: isRomanian
      ? "Servicii profesionale de închiriere auto în Cluj-Napoca. Flotă modernă, prețuri competitive, rezervare online."
      : "Professional car rental services in Cluj-Napoca. Modern fleet, competitive prices, online booking.",
    url: "https://rngo.ro",
    logo: "https://rngo.ro/logo.png",
    image: "https://rngo.ro/logo.png",
    telephone: "+40-773-932-961",
    email: "office@rngo.ro",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        'Cluj "Avram Iancu" International Airport, Strada Traian Vuia 149-151',
      addressLocality: "Cluj-Napoca",
      addressRegion: "Cluj",
      postalCode: "400397",
      addressCountry: "RO",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 46.7712,
      longitude: 23.6236,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
    priceRange: "€€",
    currenciesAccepted: "EUR, RON",
    paymentAccepted: "Cash, Credit Card",
    areaServed: {
      "@type": "City",
      name: "Cluj-Napoca",
      containedInPlace: {
        "@type": "Country",
        name: "Romania",
      },
    },
    sameAs: [
      "https://www.facebook.com/share/1Ad82uMtP3/?mibextid=wwXIfr",
      "https://www.instagram.com/rentn_go.ro",
      "https://www.tiktok.com/@rentn.go",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const featuredVehicles = await fetchQuery(api.featuredCars.getFeaturedVehicles);

  let vehicles = featuredVehicles;
  let title = "Featured Cars";

  if (!vehicles || vehicles.length === 0) {
    const fallback = await fetchQuery(api.vehicles.getAll, {
      paginationOpts: { numItems: 3, cursor: null },
    });
    vehicles = fallback?.page || [];
    title = vehicles.length > 0 ? "Our Latest Cars" : "No Cars Available";
  }

  const vehiclesWithImageUrls = await Promise.all(
    vehicles.map(async (vehicle) => {
      let imageUrl: string | null = null;
      if (vehicle.mainImageId) {
        imageUrl = await fetchQuery(api.vehicles.getImageUrl, {
          imageId: vehicle.mainImageId,
        });
      }
      return {
        ...vehicle,
        imageUrl,
      };
    })
  );

  return (
    <>
      <CarRentalSchema locale={locale} />
      <HomePageClient
        initialVehicles={vehiclesWithImageUrls}
        initialTitle={title}
      />
    </>
  );
}
