import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { CarsPageClient } from "./cars-page-client";
import { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";

interface CarsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: CarsPageProps): Promise<Metadata> {
  const { locale } = await params;

  return buildMetadata({
    locale,
    path: "/cars",
    title: {
      ro: "Masini de Inchiriat Cluj-Napoca",
      en: "Car Rentals Cluj-Napoca",
    },
    description: {
      ro: "Găsește masini de inchiriat Cluj-Napoca cu Rent'n Go. Flotă largă de vehicule moderne, prețuri competitive, rezervare online rapidă. Car rentals Cluj-Napoca disponibile 24/7.",
      en: "Find car rentals in Cluj-Napoca with Rent'n Go. Wide fleet of modern vehicles, competitive prices, quick online booking. Car rentals Cluj-Napoca available 24/7.",
    },
    keywords: {
      ro: "masini de inchiriat cluj-napoca, car rentals cluj, închiriere auto cluj, rent car cluj-napoca, vehicule închiriere cluj",
      en: "car rentals cluj-napoca, rent car cluj, car hire cluj, vehicle rental cluj-napoca, cars for rent cluj",
    },
  });
}

export default async function CarsPage() {
  const vehicles = await fetchQuery(api.vehicles.getAllVehiclesWithClasses, {});

  return <CarsPageClient initialVehicles={vehicles} />;
}
