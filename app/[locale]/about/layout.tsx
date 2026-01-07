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
      ? "Despre Rent'n Go - Masini de Inchiriat Cluj-Napoca"
      : "About Rent'n Go - Car Rentals Cluj-Napoca",
    description: isRomanian
      ? "Află mai multe despre Rent'n Go, liderul în masini de inchiriat Cluj-Napoca. Servicii profesionale de închiriere auto în Cluj cu experiență de peste 5 ani."
      : "Learn more about Rent'n Go, the leader in car rentals in Cluj-Napoca. Professional car rental services in Cluj with over 5 years of experience.",
    keywords: isRomanian
      ? "despre rent n go, masini de inchiriat cluj-napoca, car rentals cluj-napoca, istoric companie închiriere auto"
      : "about rent n go, car rentals cluj-napoca, car hire cluj, rental company history",
    alternates: {
      canonical: `https://rngo.ro/${locale}/about`,
      languages: {
        "ro-RO": "https://rngo.ro/ro/about",
        "en-US": "https://rngo.ro/en/about",
      },
    },
    openGraph: {
      title: isRomanian
        ? "Despre Rent'n Go - Masini de Inchiriat Cluj-Napoca"
        : "About Rent'n Go - Car Rentals Cluj-Napoca",
      description: isRomanian
        ? "Află mai multe despre Rent'n Go, liderul în masini de inchiriat Cluj-Napoca."
        : "Learn more about Rent'n Go, the leader in car rentals in Cluj-Napoca.",
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
        ? "Despre Rent'n Go - Masini de Inchiriat Cluj-Napoca"
        : "About Rent'n Go - Car Rentals Cluj-Napoca",
      description: isRomanian
        ? "Află mai multe despre Rent'n Go, liderul în masini de inchiriat Cluj-Napoca."
        : "Learn more about Rent'n Go, the leader in car rentals in Cluj-Napoca.",
      images: ["https://rngo.ro/logo.png"],
    },
  };
}

export default function AboutLayout({ children }: AboutLayoutProps) {
  return <>{children}</>;
}
