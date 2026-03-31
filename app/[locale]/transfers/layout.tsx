import { Metadata } from "next";
import { buildMetadata, jsonLdScriptContent } from "@/lib/metadata";

interface TransfersLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TransfersLayoutProps): Promise<Metadata> {
  const { locale } = await params;

  return buildMetadata({
    locale,
    path: "/transfers",
    title: {
      ro: "Transfer Aeroport Cluj-Napoca | Servicii Transfer VIP",
      en: "Cluj-Napoca Airport Transfer | VIP Transfer Services",
    },
    description: {
      ro: "Servicii profesionale de transfer în Cluj-Napoca cu Rent'n Go. Transfer aeroport Cluj, transport privat, curse personalizate. Vehicule premium, șoferi profesioniști.",
      en: "Professional transfer services in Cluj-Napoca with Rent'n Go. Cluj airport transfer, private transport, custom routes. Premium vehicles, professional drivers.",
    },
    keywords: {
      ro: "transfer aeroport cluj, transport cluj-napoca, transfer vip cluj, servicii transfer cluj, airport transfer cluj-napoca",
      en: "cluj airport transfer, transport cluj-napoca, vip transfer cluj, transfer services cluj, airport pickup cluj",
    },
    image: { url: "https://rngo.ro/og-transfers.png", width: 1376, height: 768, alt: "Rent'n Go - Transfer Services Cluj-Napoca" },
  });
}

const transferSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Transfer Services Cluj-Napoca",
  alternateName: "Servicii Transfer Cluj-Napoca",
  description:
    "Servicii profesionale de transfer in Cluj-Napoca si imprejurimi cu Rent'n Go. Transfer aeroport Cluj, transport privat, curse personalizate.",
  provider: {
    "@type": "Organization",
    name: "Rent'n Go",
    url: "https://rngo.ro",
    logo: "https://rngo.ro/logo.png",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+40-773-932-961",
      contactType: "customer service",
      areaServed: "Cluj-Napoca",
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
  },
  areaServed: {
    "@type": "State",
    name: "Cluj County",
    containedInPlace: {
      "@type": "Country",
      name: "Romania",
    },
  },
  serviceType: [
    "Airport Transfer",
    "Private Transport",
    "City Transfer",
    "Business Transport",
  ],
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: "https://rngo.ro/transfers",
    serviceSmsNumber: "+40-773-932-961",
    servicePhone: "+40-773-932-961",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Transfer Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Airport Transfer Cluj-Napoca",
          description:
            "Transfer de la si catre Aeroportul International Avram Iancu Cluj-Napoca",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "City Transfer Cluj-Napoca",
          description: "Transport in oras si imprejurimile Cluj-Napoca",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Business Transfer",
          description:
            "Transport corporativ si pentru evenimente de business",
        },
      },
    ],
  },
  url: "https://rngo.ro/transfers",
};

export default function TransfersLayout({ children }: TransfersLayoutProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptContent(transferSchema) }}
      />
      {children}
    </>
  );
}
