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
      ? "Masini de Inchiriat Cluj-Napoca | Rent'n Go"
      : "Car Rentals Cluj-Napoca | Rent'n Go",
    description: isRomanian
      ? "Găsește masini de inchiriat Cluj-Napoca cu Rent'n Go. Flotă largă de vehicule moderne, prețuri competitive, rezervare online rapidă. Car rentals Cluj-Napoca disponibile 24/7."
      : "Find car rentals in Cluj-Napoca with Rent'n Go. Wide fleet of modern vehicles, competitive prices, quick online booking. Car rentals Cluj-Napoca available 24/7.",
    keywords: isRomanian
      ? "masini de inchiriat cluj-napoca, car rentals cluj, închiriere auto cluj, rent car cluj-napoca, vehicule închiriere cluj"
      : "car rentals cluj-napoca, rent car cluj, car hire cluj, vehicle rental cluj-napoca, cars for rent cluj",
    alternates: {
      canonical: `https://rngo.ro/${locale}/cars`,
      languages: {
        "ro-RO": "https://rngo.ro/ro/cars",
        "en-US": "https://rngo.ro/en/cars",
      },
    },
    openGraph: {
      title: isRomanian
        ? "Masini de Inchiriat Cluj-Napoca | Rent'n Go"
        : "Car Rentals Cluj-Napoca | Rent'n Go",
      description: isRomanian
        ? "Găsește masini de inchiriat Cluj-Napoca cu Rent'n Go. Flotă largă de vehicule moderne."
        : "Find car rentals in Cluj-Napoca with Rent'n Go. Wide fleet of modern vehicles.",
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
        ? "Masini de Inchiriat Cluj-Napoca | Rent'n Go"
        : "Car Rentals Cluj-Napoca | Rent'n Go",
      description: isRomanian
        ? "Găsește masini de inchiriat Cluj-Napoca cu Rent'n Go."
        : "Find car rentals in Cluj-Napoca with Rent'n Go.",
      images: ["https://rngo.ro/logo.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CarsPage() {
  const vehicles = await fetchQuery(api.vehicles.getAllVehiclesWithClasses, {});

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

  return <CarsPageClient initialVehicles={vehiclesWithImageUrls} />;
}