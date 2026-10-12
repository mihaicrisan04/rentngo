import type { NextConfig } from "next";
import { CARS_SEGMENT } from "./localized-routes";

type Redirect = Awaited<
  ReturnType<NonNullable<NextConfig["redirects"]>>
>[number];

const LOCALES = ["ro", "en"] as const;

/** Every old /cars URL, and the other locale's fleet segment, to the localized one. */
function fleetRedirects(): Redirect[] {
  return [
    {
      source: "/cars/:path*",
      destination: `/ro/${CARS_SEGMENT.ro}/:path*`,
      permanent: true,
    },
    ...LOCALES.flatMap((locale) => {
      const otherLocale = locale === "ro" ? "en" : "ro";
      return ["cars", CARS_SEGMENT[otherLocale]].map((segment) => ({
        source: `/${locale}/${segment}/:path*`,
        destination: `/${locale}/${CARS_SEGMENT[locale]}/:path*`,
        permanent: true,
      }));
    }),
  ];
}

/** CMS page ids of the pre-2025 PrestaShop site (`/<locale>/content/<id>-<slug>`). */
const PRESTASHOP_CONTENT_PAGES: Record<string, string> = {
  "2": "terms",
  "3": "terms",
  "4": "about",
  "5": "terms",
  "7": "transfers",
  "8": "terms",
};

/**
 * URLs of the old PrestaShop site that Google still crawls. Product and
 * category pages land on the fleet: the old product ids do not map onto
 * today's cars.
 */
function prestashopRedirects(): Redirect[] {
  return LOCALES.flatMap((locale) => {
    const fleet = `/${locale}/${CARS_SEGMENT[locale]}`;
    return [
      {
        source: `/${locale}/:category(\\d+-[^/]+)`,
        destination: fleet,
        permanent: true,
      },
      {
        source: `/${locale}/:category((?!blog/)[^/]+)/:product(\\d+-[^/]+\\.html)`,
        destination: fleet,
        permanent: true,
      },
      {
        source: `/${locale}/content/6-:slug`,
        destination: fleet,
        permanent: true,
      },
      ...Object.entries(PRESTASHOP_CONTENT_PAGES).map(([id, page]) => ({
        source: `/${locale}/content/${id}-:slug`,
        destination: `/${locale}/${page}`,
        permanent: true,
      })),
      ...["contact-us", "contactati-ne", "contact-ne"].map((slug) => ({
        source: `/${locale}/${slug}`,
        destination: `/${locale}/contact`,
        permanent: true,
      })),
    ];
  });
}

export function permanentRedirects(): Redirect[] {
  return [...fleetRedirects(), ...prestashopRedirects()];
}
