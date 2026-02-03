import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import { Providers } from "./providers";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/react";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rngo.ro"),
  title: {
    default: "Rent’n Go | Rent a Car Cluj-Napoca & Aeroportul Cluj",
    template: "%s | Rent'n Go Cluj-Napoca",
  },
  description:
    "Servicii de rent a car în Cluj-Napoca și preluare directă din Aeroportul Cluj. Flotă modernă, prețuri corecte și rezervare rapidă.",
  keywords: [
    "rent a car Cluj-Napoca",
    "închirieri auto Aeroportul Cluj",
    "mașini de închiriat Cluj",
    "rent a car Cluj",
    "car rental Cluj-Napoca",
    "Cluj Airport car rental",
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
    title: "Rent’n Go | Rent a Car Cluj-Napoca & Aeroportul Cluj",
    description:
      "Servicii de rent a car în Cluj-Napoca și preluare directă din Aeroportul Cluj, cu flotă modernă și prețuri corecte.",
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
    title: "Rent’n Go | Rent a Car Cluj-Napoca & Aeroportul Cluj",
    description:
      "Rent a car în Cluj-Napoca și preluare directă din Aeroportul Cluj, fără stres.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/rentngo-icon.ico",
    shortcut: "/rentngo-icon.ico",
    apple: "/rentngo-icon.ico",
  },
  alternates: {
    canonical: "https://rngo.ro",
    languages: {
      "ro-RO": "https://rngo.ro/ro",
      "en-US": "https://rngo.ro/en",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>

      <Analytics />
      <SpeedInsights />


      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-init" strategy="afterInteractive">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}');
          `}
      </Script>
    </html>
  );
}
