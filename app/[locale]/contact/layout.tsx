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
      ? "Contact Rent'n Go - Masini de Inchiriat Cluj-Napoca"
      : "Contact Rent'n Go - Car Rentals Cluj-Napoca",
    description: isRomanian
      ? "Contactează Rent'n Go pentru masini de inchiriat Cluj-Napoca. Telefon: +40 773 932 961. Email: office@rngo.ro. Servicii profesionale de închiriere auto în Cluj."
      : "Contact Rent'n Go for car rentals in Cluj-Napoca. Phone: +40 773 932 961. Email: office@rngo.ro. Professional car rental services in Cluj.",
    keywords: isRomanian
      ? "contact rent n go, masini de inchiriat cluj-napoca, telefon închiriere auto cluj, car rentals cluj contact"
      : "contact rent n go, car rentals cluj-napoca, car hire phone cluj, car rental contact",
    alternates: {
      canonical: `https://rngo.ro/${locale}/contact`,
      languages: {
        "ro-RO": "https://rngo.ro/ro/contact",
        "en-US": "https://rngo.ro/en/contact",
      },
    },
    openGraph: {
      title: isRomanian
        ? "Contact Rent'n Go - Masini de Inchiriat Cluj-Napoca"
        : "Contact Rent'n Go - Car Rentals Cluj-Napoca",
      description: isRomanian
        ? "Contactează Rent'n Go pentru masini de inchiriat Cluj-Napoca. Telefon: +40 773 932 961."
        : "Contact Rent'n Go for car rentals in Cluj-Napoca. Phone: +40 773 932 961.",
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
        ? "Contact Rent'n Go - Masini de Inchiriat Cluj-Napoca"
        : "Contact Rent'n Go - Car Rentals Cluj-Napoca",
      description: isRomanian
        ? "Contactează Rent'n Go pentru masini de inchiriat Cluj-Napoca."
        : "Contact Rent'n Go for car rentals in Cluj-Napoca.",
      images: ["https://rngo.ro/logo.png"],
    },
  };
}

export default function ContactLayout({ children }: ContactLayoutProps) {
  return <>{children}</>;
}
