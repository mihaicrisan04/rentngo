import { COMPANY } from "@/lib/company";

/**
 * Shared JSON-LD schema builders built on the canonical `lib/company.ts`
 * constants. All structured-data emissions should use these builders instead
 * of inlining company identity.
 *
 * Serialize the returned objects with `jsonLdScriptContent()` from
 * `lib/metadata.ts` (XSS-safe) before injecting into a <script> tag.
 */

const POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: COMPANY.address.streetAddress,
  addressLocality: COMPANY.address.locality,
  postalCode: COMPANY.address.postalCode,
  addressCountry: COMPANY.address.country,
} as const;

const CUSTOMER_SERVICE_CONTACT_POINT = {
  "@type": "ContactPoint",
  telephone: COMPANY.phone.schema,
  contactType: "customer service",
  availableLanguage: ["Romanian", "English"],
} as const;

/** Stable @id so multiple JSON-LD emissions reference the same entity. */
export const ORGANIZATION_ID = `${COMPANY.baseUrl}/#organization`;

/**
 * LocalBusiness node for the company. `AutoRental` is a subtype of
 * `LocalBusiness` (AutoRental ⊂ AutomotiveBusiness ⊂ LocalBusiness), so this
 * single node serves both purposes.
 */
export function buildAutoRentalSchema(locale: string): Record<string, unknown> {
  const isRomanian = locale === "ro";

  return {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "@id": ORGANIZATION_ID,
    name: COMPANY.name,
    alternateName: COMPANY.alternateName,
    legalName: COMPANY.legalName,
    description: isRomanian
      ? "Servicii profesionale de închiriere auto și transferuri VIP în Cluj-Napoca. Flotă modernă, prețuri competitive, rezervare online."
      : "Professional car rental and VIP transfer services in Cluj-Napoca. Modern fleet, competitive prices, online booking.",
    url: COMPANY.baseUrl,
    logo: COMPANY.logoUrl,
    image: COMPANY.logoUrl,
    telephone: COMPANY.phone.schema,
    email: COMPANY.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.address.streetAddress,
      addressLocality: COMPANY.address.locality,
      addressRegion: COMPANY.address.region,
      postalCode: COMPANY.address.postalCode,
      addressCountry: COMPANY.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: COMPANY.geo.latitude,
      longitude: COMPANY.geo.longitude,
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
      opens: COMPANY.openingHours.opens,
      closes: COMPANY.openingHours.closes,
    },
    priceRange: COMPANY.priceRange,
    currenciesAccepted: COMPANY.currenciesAccepted,
    paymentAccepted: COMPANY.paymentAccepted,
    areaServed: {
      "@type": "City",
      name: "Cluj-Napoca",
      containedInPlace: {
        "@type": "Country",
        name: "Romania",
      },
    },
    sameAs: [...COMPANY.sameAs],
  };
}

/** Organization node used on the about page. */
export function buildOrganizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY.name,
    alternateName: COMPANY.alternateName,
    url: COMPANY.baseUrl,
    logo: COMPANY.logoUrl,
    contactPoint: { ...CUSTOMER_SERVICE_CONTACT_POINT, areaServed: "RO" },
    address: POSTAL_ADDRESS,
    geo: {
      "@type": "GeoCoordinates",
      latitude: COMPANY.geo.latitude,
      longitude: COMPANY.geo.longitude,
    },
    sameAs: [...COMPANY.sameAs],
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: COMPANY.geo.latitude,
        longitude: COMPANY.geo.longitude,
      },
      geoRadius: "50",
    },
    description:
      "Rent'n Go ofera servicii profesionale cu masini de inchiriat Cluj-Napoca. Flota moderna de vehicule si preturi competitive. Experti in inchiriere auto Cluj cu servicii de calitate.",
  };
}

/** Service node for VIP transfers. */
export function buildTransferServiceSchema(): Record<string, unknown> {
  const transfersUrl = `${COMPANY.baseUrl}/transfers`;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Transfer Services Cluj-Napoca",
    alternateName: "Servicii Transfer Cluj-Napoca",
    description:
      "Servicii profesionale de transfer in Cluj-Napoca si imprejurimi cu Rent'n Go. Transfer aeroport Cluj, transport privat, curse personalizate.",
    provider: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: COMPANY.name,
      url: COMPANY.baseUrl,
      logo: COMPANY.logoUrl,
      contactPoint: {
        ...CUSTOMER_SERVICE_CONTACT_POINT,
        areaServed: "Cluj-Napoca",
      },
      address: POSTAL_ADDRESS,
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
      serviceUrl: transfersUrl,
      serviceSmsNumber: COMPANY.phone.schema,
      servicePhone: COMPANY.phone.schema,
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
    url: transfersUrl,
  };
}

/** ContactPage node for the contact page. */
export function buildContactPageSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    mainEntity: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: COMPANY.name,
      telephone: COMPANY.phone.schema,
      email: COMPANY.email,
      address: POSTAL_ADDRESS,
      openingHours: ["Mo-Su 00:00-23:59"],
      contactPoint: [
        { ...CUSTOMER_SERVICE_CONTACT_POINT, areaServed: "Cluj-Napoca" },
        {
          "@type": "ContactPoint",
          email: COMPANY.email,
          contactType: "customer service",
          availableLanguage: ["Romanian", "English"],
        },
      ],
    },
  };
}

/** Seller node embedded in car-detail Offer JSON-LD. */
export function buildAutoRentalSellerSchema(): Record<string, unknown> {
  return {
    "@type": "AutoRental",
    "@id": ORGANIZATION_ID,
    name: COMPANY.name,
    url: COMPANY.baseUrl,
    telephone: COMPANY.phone.schema,
    address: POSTAL_ADDRESS,
  };
}

/** FAQPage node. Answers must be plain text (schema.org expects text/simple HTML). */
export function buildFaqPageSchema(
  items: Array<{ question: string; answer: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
