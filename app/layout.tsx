import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import { Providers } from "./providers";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

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
    <html suppressHydrationWarning>
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
