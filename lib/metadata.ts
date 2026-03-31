import { Metadata } from "next";

const BASE_URL = "https://rngo.ro";
const SITE_NAME = "Rent'n Go Cluj-Napoca";
const DEFAULT_OG_IMAGE = {
  url: `${BASE_URL}/logo.png`,
  width: 1200,
  height: 630,
  alt: "Rent'n Go Cluj-Napoca",
};

interface LocalizedText {
  ro: string;
  en: string;
}

interface MetadataInput {
  locale: string;
  path: string;
  title: LocalizedText;
  description: LocalizedText;
  keywords?: LocalizedText;
  image?: { url: string; width?: number; height?: number; alt?: string };
  type?: "website" | "article";
  noIndex?: boolean;
  article?: {
    publishedTime?: string;
    authors?: string[];
    tags?: string[];
  };
}

function localized(text: LocalizedText, locale: string): string {
  return locale === "ro" ? text.ro : text.en;
}

export function buildMetadata({
  locale,
  path,
  title,
  description,
  keywords,
  image,
  type = "website",
  noIndex = false,
  article,
}: MetadataInput): Metadata {
  const t = localized(title, locale);
  const d = localized(description, locale);
  const url = `${BASE_URL}/${locale}${path}`;
  const ogImage = image ?? DEFAULT_OG_IMAGE;

  return {
    title: t,
    description: d,
    ...(keywords && {
      keywords: localized(keywords, locale)
        .split(",")
        .map((k) => k.trim()),
    }),
    ...(noIndex && { robots: { index: false, follow: false } }),
    alternates: {
      canonical: url,
      languages: {
        "ro-RO": `${BASE_URL}/ro${path}`,
        "en-US": `${BASE_URL}/en${path}`,
        "x-default": `${BASE_URL}/ro${path}`,
      },
    },
    openGraph: {
      title: t,
      description: d,
      type,
      url,
      siteName: SITE_NAME,
      locale: locale === "ro" ? "ro_RO" : "en_US",
      images: [ogImage],
      ...article,
    },
    twitter: {
      card: "summary_large_image",
      title: t,
      description: d,
      images: [typeof ogImage.url === "string" ? ogImage.url : ogImage],
    },
  };
}

/**
 * Safely serialize JSON-LD with XSS protection.
 * Use this for all dangerouslySetInnerHTML JSON-LD scripts.
 */
export function jsonLdScriptContent(schema: Record<string, unknown>): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
