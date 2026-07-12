import { fetchStaticQuery } from "@/lib/convex-static";
import { api } from "@/convex/_generated/api";
import { HomePageClient } from "./home-page-client";
import { Metadata } from "next";
import { buildMetadata, jsonLdScriptContent } from "@/lib/metadata";
import { getTranslations } from "next-intl/server";

// Statically prerendered per locale; re-generated in the background so
// featured-car changes show up without a redeploy.
export const revalidate = 3600;

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
      dangerouslySetInnerHTML={{ __html: jsonLdScriptContent(schema) }}
    />
  );
}

export default async function HomePage({ params }: HomePageProps) {
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
