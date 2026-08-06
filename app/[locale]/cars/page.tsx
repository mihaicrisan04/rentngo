import { fetchStaticQuery } from "@/lib/convex-static";
import { api } from "@/convex/_generated/api";
import { CarsPageClient } from "./cars-page-client";
import { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { cacheLife } from "next/cache";

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
      ro: "Mașini de Închiriat Cluj-Napoca",
      en: "Car Rentals Cluj-Napoca",
    },
    description: {
      ro: "Găsește mașini de închiriat Cluj-Napoca cu Rent'n Go. Flotă largă de vehicule moderne, prețuri competitive, rezervare online rapidă. Car rentals Cluj-Napoca disponibile 24/7.",
      en: "Find car rentals in Cluj-Napoca with Rent'n Go. Wide fleet of modern vehicles, competitive prices, quick online booking. Car rentals Cluj-Napoca available 24/7.",
    },
    keywords: {
      ro: "mașini de închiriat cluj-napoca, car rentals cluj, închiriere auto cluj, rent car cluj-napoca, vehicule închiriere cluj",
      en: "car rentals cluj-napoca, rent car cluj, car hire cluj, vehicle rental cluj-napoca, cars for rent cluj",
    },
    image: { url: "https://rngo.ro/og-cars.png", width: 1376, height: 768, alt: "Rent'n Go - Mașini de Închiriat Cluj-Napoca" },
  });
}

// Cached; re-generated in the background so fleet changes show up without a
// redeploy.
export default async function CarsPage() {
  "use cache";
  cacheLife("hours");
  const vehicles = await fetchStaticQuery(api.vehicles.getAllVehiclesWithClasses, {});

  return <CarsPageClient initialVehicles={vehicles} />;
}
