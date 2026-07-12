import { COMPANY } from "@/lib/company";

/**
 * Shared JSON-LD schema builders built on the canonical `lib/company.ts`
 * constants. New structured-data emissions should use these builders; the
 * existing inline JSON-LD sites (homepage, about, transfers, contact, car
 * detail, blog) are migrated onto them as part of RNGO-20.
 *
 * Serialize the returned objects with `jsonLdScriptContent()` from
 * `lib/metadata.ts` (XSS-safe) before injecting into a <script> tag.
 */

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

/** FAQPage node. Answers must be plain text (schema.org expects text/simple HTML). */
export function buildFaqPageSchema(
  items: Array<{ question: string; answer: string }>
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
