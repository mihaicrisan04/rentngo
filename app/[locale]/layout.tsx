import "../globals.css";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { GoogleTagManager } from "@next/third-parties/google";
import { fontClassNames } from "../fonts";
import { Providers, LocaleProviders } from "../providers";
import { PublicLayout } from "@/components/layout/public-layout";
import { CookieConsentBanner } from "@/components/shared/consent/cookie-consent-banner";
import { ReferralCapture } from "@/components/shared/referral/referral-capture";
import { IS_PRODUCTION_DEPLOYMENT } from "@/lib/env";

const locales = ["ro", "en"];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL("https://rngo.ro"),
  title: {
    default: "Rent'n Go Cluj-Napoca | Masini de Inchiriat",
    template: "%s | Rent'n Go Cluj-Napoca",
  },
  description:
    "Masini de inchiriat Cluj-Napoca cu Rent'n Go. Car rentals Cluj-Napoca cu prețuri competitive. Servicii profesionale de închiriere auto în Cluj-Napoca.",
  keywords: [
    "masini de inchiriat Cluj-Napoca",
    "car rentals Cluj-Napoca",
    "rent car Cluj",
    "închiriere auto Cluj",
    "rental cars Cluj-Napoca",
    "închiriat mașini Cluj",
  ],
  authors: [{ name: "Rent'n Go" }],
  creator: "Rent'n Go",
  publisher: "Rent'n Go",
  robots: IS_PRODUCTION_DEPLOYMENT
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      }
    : {
        index: false,
        follow: false,
      },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    alternateLocale: ["en_US"],
    url: "https://rngo.ro",
    siteName: "Rent'n Go Cluj-Napoca",
    title: "Rent'n Go Cluj-Napoca | Masini de Inchiriat",
    description:
      "Masini de inchiriat Cluj-Napoca cu Rent'n Go. Servicii profesionale de închiriere auto cu prețuri competitive.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Rent'n Go Cluj-Napoca - Închiriere Mașini",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rent'n Go Cluj-Napoca | Masini de Inchiriat",
    description:
      "Masini de inchiriat Cluj-Napoca cu Rent'n Go. Car rentals Cluj-Napoca cu servicii de calitate.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  alternates: {
    canonical: "https://rngo.ro/ro",
    languages: {
      "ro-RO": "https://rngo.ro/ro",
      "en-US": "https://rngo.ro/en",
      "x-default": "https://rngo.ro/ro",
    },
  },
};

// Root layout for the public site. `<html lang>` is derived from the [locale]
// route segment (instead of reading request headers), so every public route
// can be statically prerendered per locale.
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound();

  // Enable static rendering for next-intl server APIs
  setRequestLocale(locale);

  // Get messages for the locale
  const messages = await getMessages({ locale });

  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      <body className={fontClassNames}>
        <Providers>
          <LocaleProviders locale={locale} messages={messages}>
            <PublicLayout>{children}</PublicLayout>
            {/* Consent gate + consent-gated referral capture (RNGO-26) */}
            <CookieConsentBanner />
            <ReferralCapture />
          </LocaleProviders>
        </Providers>
        {/* Analytics reads the URL via useParams/usePathname internally;
            without a Suspense boundary that blocks shell prerendering under
            `cacheComponents` on every route. */}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <SpeedInsights />
      </body>
    </html>
  );
}
