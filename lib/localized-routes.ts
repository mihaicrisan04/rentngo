import type { Locale } from "../i18n";

/**
 * Keyword-rich public URLs for the fleet. The app route stays `app/[locale]/cars`;
 * the middleware rewrites these external paths onto it, and next.config
 * permanently redirects the old `/cars` URLs here.
 */
export const CARS_SEGMENT = {
  ro: "masini-de-inchiriat-cluj-napoca",
  en: "car-rental-cluj-napoca",
} as const satisfies Record<Locale, string>;

/** next-intl `pathnames` config: internal route → external path per locale. */
export const LOCALIZED_PATHNAMES = {
  "/cars": { ro: `/${CARS_SEGMENT.ro}`, en: `/${CARS_SEGMENT.en}` },
  "/cars/[slug]": {
    ro: `/${CARS_SEGMENT.ro}/[slug]`,
    en: `/${CARS_SEGMENT.en}/[slug]`,
  },
} as const;

// next-intl's useLocale() is untyped here, so callers pass a plain string
function carsSegment(locale: string): string {
  return locale === "en" ? CARS_SEGMENT.en : CARS_SEGMENT.ro;
}

/** Path below the locale prefix, e.g. `/masini-de-inchiriat-cluj-napoca/dacia-logan`. */
export function carsPathWithoutLocale(locale: string, slug?: string): string {
  const base = `/${carsSegment(locale)}`;
  return slug ? `${base}/${encodeURIComponent(slug)}` : base;
}

export function carsPath(locale: string, slug?: string): string {
  return `/${locale}${carsPathWithoutLocale(locale, slug)}`;
}

/**
 * The same page in another locale: swaps the prefix and, on fleet pages, the
 * localized segment. Blog slugs differ per post and are resolved by the caller.
 */
export function switchLocalePath(pathname: string, toLocale: string): string {
  const [, , segment = "", ...rest] = pathname.split("/");
  const isCarsSegment =
    segment === "cars" ||
    (Object.values(CARS_SEGMENT) as string[]).includes(segment);
  const localizedSegment = isCarsSegment ? carsSegment(toLocale) : segment;
  return ["", toLocale, localizedSegment, ...rest].join("/").replace(/\/$/, "");
}
