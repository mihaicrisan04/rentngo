import { Metadata } from "next";

interface ContactLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ContactLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const isRomanian = locale === "ro";

  return {
    title: isRomanian
      ? "Contact Rent’n Go – Rent a Car în Cluj-Napoca și Aeroportul Cluj"
      : "Contact Rent’n Go – Car Rentals in Cluj-Napoca & Cluj Airport",
    description: isRomanian
      ? "Contactează Rent’n Go pentru rent a car în Cluj-Napoca și preluare din Aeroportul Cluj. Telefon: +40 773 932 961. Email: office@rngo.ro."
      : "Contact Rent’n Go for car rentals in Cluj-Napoca and at Cluj Airport. Phone: +40 773 932 961. Email: office@rngo.ro.",
    keywords: isRomanian
      ? "contact rent’n go, rent a car cluj-napoca, închirieri auto aeroport cluj, telefon închirieri auto cluj"
      : "contact rent’n go, car rental cluj-napoca, cluj airport car rental contact, car hire cluj phone",
    alternates: {
      canonical: `https://rngo.ro/${locale}/contact`,
      languages: {
        "ro-RO": "https://rngo.ro/ro/contact",
        "en-US": "https://rngo.ro/en/contact",
      },
    },
    openGraph: {
      title: isRomanian
        ? "Contact Rent’n Go – Rent a Car în Cluj-Napoca și Aeroportul Cluj"
        : "Contact Rent’n Go – Car Rentals in Cluj-Napoca & Cluj Airport",
      description: isRomanian
        ? "Suntem disponibili 24/7 pentru rezervări, întrebări și suport pentru rent a car în Cluj-Napoca și Aeroportul Cluj."
        : "Available 24/7 for bookings, questions and support for car rentals in Cluj-Napoca and at Cluj Airport.",
      type: "website",
      url: `https://rngo.ro/${locale}/contact`,
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
        ? "Contact Rent’n Go – Rent a Car în Cluj-Napoca și Aeroportul Cluj"
        : "Contact Rent’n Go – Car Rentals in Cluj-Napoca & Cluj Airport",
      description: isRomanian
        ? "Rent a car în Cluj-Napoca și preluare din Aeroportul Cluj, cu suport 24/7."
        : "Contact Rent’n Go for car rentals in Cluj-Napoca and at Cluj Airport.",
      images: ["https://rngo.ro/logo.png"],
    },
  };
}

export default function ContactLayout({ children }: ContactLayoutProps) {
  return <>{children}</>;
}
