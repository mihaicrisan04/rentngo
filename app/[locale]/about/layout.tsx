import { Metadata } from "next";

interface AboutLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AboutLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const isRomanian = locale === "ro";

  return {
    title: isRomanian
      ? "Despre Rent’n Go – Rent a Car Premium în Cluj-Napoca"
      : "Premium Car Rental in Cluj-Napoca & Cluj Airport | Rent’n Go",
    description: isRomanian
      ? "Descoperă Rent’n Go, serviciul de rent a car premium în Cluj-Napoca, cu flotă modernă, transparență și experiențe fără stres."
      : "Learn more about Rent’n Go, delivering trusted car rental services in Cluj-Napoca and at Cluj Airport with clean vehicles and transparent pricing.",
    keywords: isRomanian
      ? "despre rent’n go, rent a car cluj-napoca, închirieri auto cluj, rent a car aeroport cluj, servicii premium cluj"
      : "about rent’n go, car rental cluj-napoca, cluj airport car rental, premium car rental cluj",
    alternates: {
      canonical: `https://rngo.ro/${locale}/about`,
      languages: {
        "ro-RO": "https://rngo.ro/ro/about",
        "en-US": "https://rngo.ro/en/about",
      },
    },
    openGraph: {
      title: isRomanian
        ? "Despre Rent’n Go – Rent a Car Premium în Cluj-Napoca"
        : "Premium Car Rental in Cluj-Napoca & Cluj Airport",
      description: isRomanian
        ? "Rent’n Go oferă rent a car premium în Cluj-Napoca, cu servicii transparente și fără stres."
        : "Trusted car rental services in Cluj-Napoca and at Cluj Airport with clean, modern vehicles.",
      type: "website",
      url: `https://rngo.ro/${locale}/about`,
      siteName: "Rent'n Go Cluj-Napoca",
      locale: isRomanian ? "ro_RO" : "en_US",
      images: [
        {
          url: "https://rngo.ro/logo.png",
          width: 1200,
          height: 630,
          alt: "Rent'n Go Cluj-Napoca",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: isRomanian
        ? "Despre Rent’n Go – Rent a Car Premium în Cluj-Napoca"
        : "Premium Car Rental in Cluj-Napoca & Cluj Airport",
      description: isRomanian
        ? "Rent a car premium în Cluj-Napoca, cu flotă modernă și prețuri corecte."
        : "Learn more about Rent’n Go, a trusted car rental provider in Cluj-Napoca and at Cluj Airport.",
      images: ["https://rngo.ro/logo.png"],
    },
  };
}

export default function AboutLayout({ children }: AboutLayoutProps) {
  return <>{children}</>;
}
