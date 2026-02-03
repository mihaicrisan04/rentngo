import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { HomePageClient } from "./home-page-client";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

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
      ? "Închirieri Auto Aeroport Cluj – Rent a Car Premium în Cluj-Napoca"
      : "Car Rental Cluj-Napoca & Cluj Airport – Premium Rent a Car",
    description: isRomanian
      ? "Servicii de rent a car în Cluj-Napoca și preluare directă din Aeroportul Cluj. Flotă diversificată, prețuri corecte și rezervare rapidă, fără stres."
      : "Reliable car rental in Cluj-Napoca and Cluj Airport, with clean vehicles, transparent pricing and fast pickup. Book in minutes for a smooth, stress-free journey.",
    keywords: isRomanian
      ? "rent a car cluj-napoca, închirieri auto aeroport cluj, mașini de închiriat cluj, închirieri auto cluj-napoca, rent a car cluj"
      : "car rental cluj-napoca, car rental cluj airport, rent a car cluj, car hire cluj-napoca, cluj airport car rental",
    alternates: {
      canonical: `https://rngo.ro/${locale}`,
      languages: {
        "ro-RO": "https://rngo.ro/ro",
        "en-US": "https://rngo.ro/en",
      },
    },
    openGraph: {
      title: isRomanian
        ? "Închirieri Auto Aeroport Cluj – Rent a Car Premium în Cluj-Napoca"
        : "Car Rental Cluj-Napoca & Cluj Airport – Premium Rent a Car",
      description: isRomanian
        ? "Servicii de rent a car în Cluj-Napoca și preluare directă din Aeroportul Cluj, cu flotă diversificată și prețuri corecte."
        : "Reliable car rental in Cluj-Napoca and Cluj Airport with clean vehicles, transparent pricing and fast pickup.",
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
        ? "Închirieri Auto Aeroport Cluj – Rent a Car Premium în Cluj-Napoca"
        : "Car Rental Cluj-Napoca & Cluj Airport – Premium Rent a Car",
      description: isRomanian
        ? "Servicii de rent a car în Cluj-Napoca și preluare directă din Aeroportul Cluj, fără stres."
        : "Reliable car rental in Cluj-Napoca and Cluj Airport with fast pickup and transparent pricing.",
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
      ? "Servicii de rent a car în Cluj-Napoca și preluare directă din Aeroportul Cluj. Flotă diversificată, prețuri corecte și rezervare rapidă."
      : "Car rental services in Cluj-Napoca and Cluj Airport with clean vehicles, transparent pricing and fast booking.",
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
  const t = await getTranslations({ locale, namespace: "homepage" });
  // Query now includes imageUrl directly, eliminating N+1 queries
  const featuredVehicles = await fetchQuery(api.featuredCars.getFeaturedVehicles);

  let vehicles = featuredVehicles;
  let title = t("featuredCarsTitle");

  if (!vehicles || vehicles.length === 0) {
    // Fallback to all vehicles (also includes imageUrl now)
    const allVehicles = await fetchQuery(api.vehicles.getAllVehiclesWithClasses, {});
    vehicles = allVehicles.slice(0, 3);
    title = vehicles.length > 0 ? t("latestCarsTitle") : t("noCarsTitle");
  }

  return (
    <>
      <CarRentalSchema locale={locale} />
      <HomePageClient
        initialVehicles={vehicles}
        initialTitle={title}
      />
    </>
  );
}
