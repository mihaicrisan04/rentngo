import { Metadata } from "next";
import { buildMetadata, jsonLdScriptContent } from "@/lib/metadata";

interface AboutLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AboutLayoutProps): Promise<Metadata> {
  const { locale } = await params;

  return buildMetadata({
    locale,
    path: "/about",
    title: {
      ro: "Despre Rent'n Go - Masini de Inchiriat Cluj-Napoca",
      en: "About Rent'n Go - Car Rentals Cluj-Napoca",
    },
    description: {
      ro: "Află mai multe despre Rent'n Go, liderul în masini de inchiriat Cluj-Napoca. Servicii profesionale de închiriere auto în Cluj cu experiență de peste 5 ani.",
      en: "Learn more about Rent'n Go, the leader in car rentals in Cluj-Napoca. Professional car rental services in Cluj with over 5 years of experience.",
    },
    keywords: {
      ro: "despre rent n go, masini de inchiriat cluj-napoca, car rentals cluj-napoca, istoric companie închiriere auto",
      en: "about rent n go, car rentals cluj-napoca, car hire cluj, rental company history",
    },
  });
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Rent'n Go",
  alternateName: "Rent'n Go Cluj-Napoca",
  url: "https://rngo.ro",
  logo: "https://rngo.ro/logo.png",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+40-773-932-961",
    contactType: "customer service",
    areaServed: "RO",
    availableLanguage: ["Romanian", "English"],
  },
  address: {
    "@type": "PostalAddress",
    streetAddress:
      'Cluj "Avram Iancu" International Airport, Strada Traian Vuia 149-151',
    addressLocality: "Cluj-Napoca",
    postalCode: "400397",
    addressCountry: "RO",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 46.7712,
    longitude: 23.6236,
  },
  sameAs: [
    "https://www.facebook.com/share/1Ad82uMtP3/?mibextid=wwXIfr",
    "https://www.instagram.com/rentn_go.ro",
    "https://www.tiktok.com/@rentn.go",
  ],
  serviceArea: {
    "@type": "GeoCircle",
    geoMidpoint: {
      "@type": "GeoCoordinates",
      latitude: 46.7712,
      longitude: 23.6236,
    },
    geoRadius: "50",
  },
  description:
    "Rent'n Go ofera servicii profesionale cu masini de inchiriat Cluj-Napoca. Flota moderna de vehicule si preturi competitive. Experti in inchiriere auto Cluj cu servicii de calitate.",
};

export default function AboutLayout({ children }: AboutLayoutProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptContent(organizationSchema) }}
      />
      {children}
    </>
  );
}
