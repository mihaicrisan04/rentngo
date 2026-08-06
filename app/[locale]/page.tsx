import { fetchStaticQuery } from "@/lib/convex-static";
import { api } from "@/convex/_generated/api";
import { HomePageClient } from "./home-page-client";
import { Metadata } from "next";
import { buildMetadata, jsonLdScriptContent } from "@/lib/metadata";
import { buildAutoRentalSchema } from "@/lib/structured-data";
import { getTranslations } from "next-intl/server";
import { cacheLife } from "next/cache";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;

  return buildMetadata({
    locale,
    path: "",
    title: {
      ro: "Rent'n Go Cluj-Napoca | Masini de Inchiriat Cluj",
      en: "Rent'n Go Cluj-Napoca | Car Rentals Cluj",
    },
    description: {
      ro: "Masini de inchiriat Cluj-Napoca cu Rent'n Go. Închiriere auto la prețuri competitive, flotă modernă, rezervare online rapidă. Cel mai bun serviciu de car rentals Cluj-Napoca.",
      en: "Car rentals Cluj-Napoca with Rent'n Go. Competitive prices, modern fleet, quick online booking. Best car rental service in Cluj-Napoca.",
    },
    keywords: {
      ro: "masini de inchiriat cluj-napoca, car rentals cluj, închiriere auto cluj, rent car cluj-napoca, rental cars cluj",
      en: "car rentals cluj-napoca, rent car cluj, car hire cluj, vehicle rental cluj-napoca",
    },
  });
}

function CarRentalSchema({ locale }: { locale: string }) {
  const schema = buildAutoRentalSchema(locale);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdScriptContent(schema) }}
    />
  );
}

// Cached per locale; re-generated in the background so featured-car changes
// show up without a redeploy.
export default async function HomePage({ params }: HomePageProps) {
  "use cache";
  cacheLife("hours");
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "homepage" });
  const featuredVehicles = await fetchStaticQuery(api.featuredCars.getFeaturedVehicles);

  let vehicles = featuredVehicles;
  let title = t("featuredCars");

  if (!vehicles || vehicles.length === 0) {
    const allVehicles = await fetchStaticQuery(api.vehicles.getAllVehiclesWithClasses, {});
    vehicles = allVehicles.slice(0, 3);
    title = vehicles.length > 0 ? t("ourLatestCars") : t("noCarsAvailable");
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
