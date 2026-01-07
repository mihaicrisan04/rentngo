import { Metadata } from "next";

interface TransfersLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TransfersLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const isRomanian = locale === "ro";

  return {
    title: isRomanian
      ? "Transfer Aeroport Cluj-Napoca | Servicii Transfer VIP"
      : "Cluj-Napoca Airport Transfer | VIP Transfer Services",
    description: isRomanian
      ? "Servicii profesionale de transfer în Cluj-Napoca cu Rent'n Go. Transfer aeroport Cluj, transport privat, curse personalizate. Vehicule premium, șoferi profesioniști."
      : "Professional transfer services in Cluj-Napoca with Rent'n Go. Cluj airport transfer, private transport, custom routes. Premium vehicles, professional drivers.",
    keywords: isRomanian
      ? "transfer aeroport cluj, transport cluj-napoca, transfer vip cluj, servicii transfer cluj, airport transfer cluj-napoca"
      : "cluj airport transfer, transport cluj-napoca, vip transfer cluj, transfer services cluj, airport pickup cluj",
    alternates: {
      canonical: `https://rngo.ro/${locale}/transfers`,
      languages: {
        "ro-RO": "https://rngo.ro/ro/transfers",
        "en-US": "https://rngo.ro/en/transfers",
      },
    },
    openGraph: {
      title: isRomanian
        ? "Transfer Aeroport Cluj-Napoca | Rent'n Go"
        : "Cluj-Napoca Airport Transfer | Rent'n Go",
      description: isRomanian
        ? "Servicii profesionale de transfer în Cluj-Napoca. Vehicule premium, șoferi profesioniști."
        : "Professional transfer services in Cluj-Napoca. Premium vehicles, professional drivers.",
      type: "website",
      url: `https://rngo.ro/${locale}/transfers`,
      siteName: "Rent'n Go Cluj-Napoca",
      locale: isRomanian ? "ro_RO" : "en_US",
      images: [
        {
          url: "https://rngo.ro/logo.png",
          width: 1200,
          height: 630,
          alt: "Rent'n Go Transfer Services",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: isRomanian
        ? "Transfer Aeroport Cluj-Napoca | Rent'n Go"
        : "Cluj-Napoca Airport Transfer | Rent'n Go",
      description: isRomanian
        ? "Servicii profesionale de transfer în Cluj-Napoca."
        : "Professional transfer services in Cluj-Napoca.",
      images: ["https://rngo.ro/logo.png"],
    },
  };
}

export default function TransfersLayout({ children }: TransfersLayoutProps) {
  return <>{children}</>;
}
