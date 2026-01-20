"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { TransferSearchForm } from "@/components/features/transfers/transfer-search-form";
import { Car, Shield, Clock, MapPin } from "lucide-react";

export default function TransfersPage() {
  const t = useTranslations("transferPage");

  const generateTransferServiceSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Transfer Services Cluj-Napoca",
      alternateName: "Servicii Transfer Cluj-Napoca",
      description:
        "Servicii profesionale de transfer în Cluj-Napoca și împrejurimi cu Rent'n Go. Transfer aeroport Cluj, transport privat, curse personalizate.",
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
      url: "https://rngo.ro/transfers",
    };
  };

  const transferSchema = generateTransferServiceSchema();

  const features = [
    {
      id: "premium",
      icon: Car,
      title: "Premium Vehicles",
      description: "Travel in comfort with our luxury fleet",
    },
    {
      id: "safe",
      icon: Shield,
      title: "Safe & Reliable",
      description: "Professional drivers with verified backgrounds",
    },
    {
      id: "ontime",
      icon: Clock,
      title: "On-Time Service",
      description: "Punctual pickups and drop-offs guaranteed",
    },
    {
      id: "destination",
      icon: MapPin,
      title: "Any Destination",
      description: "Airport transfers and city-to-city routes",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(transferSchema) }}
      />
      <div className="grow flex flex-col bg-linear-to-b from-background to-muted/30">
        {/* Hero Section */}
      <section className="relative py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8 lg:mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              {t("title")}
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto">
            <TransferSearchForm />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8">
            {t("howItWorks.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">{t("howItWorks.step1.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("howItWorks.step1.description")}
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">{t("howItWorks.step2.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("howItWorks.step2.description")}
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">{t("howItWorks.step3.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("howItWorks.step3.description")}
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
