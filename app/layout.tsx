import "./globals.css";
import { Plus_Jakarta_Sans, Outfit, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { GoogleTagManager } from "@next/third-parties/google";
import { headers } from "next/headers";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const lang = pathname.startsWith("/en") ? "en" : "ro";

  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang={lang} suppressHydrationWarning data-scroll-behavior="smooth">
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      <body
        className={`${plusJakarta.variable} ${outfit.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>

      <Analytics />
      <SpeedInsights />
    </html>
  );
}
