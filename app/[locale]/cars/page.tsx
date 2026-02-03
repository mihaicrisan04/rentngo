import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { CarsPageClient } from "./cars-page-client";
import { Metadata } from "next";

interface CarsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: CarsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isRomanian = locale === "ro";

  return {
    title: isRomanian
      ? "Mașini de Închiriat în Cluj-Napoca – Rent a Car Premium | Rent’n Go"
      : "Car Rental in Cluj-Napoca & Cluj Airport | Rent’n Go",
    description: isRomanian
      ? "Alege din flota Rent’n Go cele mai bine întreținute mașini pentru rent a car în Cluj-Napoca sau preluare direct din Aeroportul Cluj. Rezervare rapidă, prețuri transparente și servicii premium, fără surprize."
      : "Browse our full selection of rental cars in Cluj-Napoca and at Cluj Airport. Enjoy fast booking, transparent pricing and clean, well-maintained vehicles ready for your trip.",
    keywords: isRomanian
      ? "mașini de închiriat cluj-napoca, rent a car cluj, închirieri auto aeroport cluj, închiriere auto cluj-napoca, flota rent a car cluj"
      : "car rental cluj-napoca, cluj airport car rental, rent a car cluj, cars for rent cluj, car hire cluj-napoca",
    alternates: {
      canonical: `https://rngo.ro/${locale}/cars`,
      languages: {
        "ro-RO": "https://rngo.ro/ro/cars",
        "en-US": "https://rngo.ro/en/cars",
      },
    },
    openGraph: {
      title: isRomanian
        ? "Mașini de Închiriat în Cluj-Napoca – Rent a Car Premium"
        : "Car Rental in Cluj-Napoca & Cluj Airport",
      description: isRomanian
        ? "Flotă bine întreținută pentru rent a car în Cluj-Napoca și preluare directă din Aeroportul Cluj."
        : "Clean, well-maintained rental cars in Cluj-Napoca and fast pickup at Cluj Airport.",
      type: "website",
      url: `https://rngo.ro/${locale}/cars`,
      siteName: "Rent'n Go Cluj-Napoca",
      locale: isRomanian ? "ro_RO" : "en_US",
      images: [
        {
          url: "https://rngo.ro/logo.png",
          width: 1200,
          height: 630,
          alt: isRomanian
            ? "Rent'n Go - Masini de Inchiriat Cluj-Napoca"
            : "Rent'n Go - Car Rentals Cluj-Napoca",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: isRomanian
        ? "Mașini de Închiriat în Cluj-Napoca – Rent a Car Premium"
        : "Car Rental in Cluj-Napoca & Cluj Airport",
      description: isRomanian
        ? "Alege rent a car în Cluj-Napoca cu preluare rapidă din Aeroportul Cluj."
        : "Fast booking for car rentals in Cluj-Napoca and at Cluj Airport.",
      images: ["https://rngo.ro/logo.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CarsPage() {
  // Query now includes imageUrl directly, eliminating N+1 queries
  const vehicles = await fetchQuery(api.vehicles.getAllVehiclesWithClasses, {});

  return <CarsPageClient initialVehicles={vehicles} />;
}
