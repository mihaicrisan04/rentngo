"use client";

import { useTranslations } from "next-intl";
import Head from "next/head";

export default function TransfersPage() {
  const t = useTranslations("transfersPage");

  // Generate schema markup for transfer services
  const generateTransferServiceSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Transfer Services Cluj-Napoca",
      alternateName: "Servicii Transfer Cluj-Napoca",
      description:
        "Servicii profesionale de transfer în Cluj-Napoca și împrejurimi cu Rent'n Go. Transfer aeroport Cluj, transport privat, curse personalizate. În curând disponibil!",
      provider: {
        "@type": "Organization",
        name: "Rent'n Go",
        url: "https://rngo.com",
        logo: "https://rngo.com/logo.png",
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
        serviceUrl: "https://rngo.com/transfers",
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
                "Transfer de la și către Aeroportul Internațional Avram Iancu Cluj-Napoca",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "City Transfer Cluj-Napoca",
              description: "Transport în oraș și împrejurimile Cluj-Napoca",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Business Transfer",
              description:
                "Transport corporativ și pentru evenimente de business",
            },
          },
        ],
      },
      url: "https://rngo.com/transfers",
    };
  };

  const transferSchema = generateTransferServiceSchema();

  return (
    <>
      <Head>
        <title>Transfer Services Cluj-Napoca | Rent'n Go - În Curând</title>
        <meta
          name="description"
          content="Servicii transfer Cluj-Napoca cu Rent'n Go. Transfer aeroport Cluj, transport privat, curse personalizate. Servicii profesionale de transport în Cluj-Napoca - în curând disponibil!"
        />
        <meta
          name="keywords"
          content="transfer cluj-napoca, transfer aeroport cluj, transport privat cluj, servicii transfer romania, rent n go transfers"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rngo.com/transfers" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(transferSchema),
          }}
        />
      </Head>

      <div className="flex-grow flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold text-center">{t("title")}</h1>
        <p className="text-xl text-muted-foreground text-center mt-4">
          {t("subtitle")}
        </p>
      </div>
    </>
  );
}
