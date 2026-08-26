import { Metadata } from "next";
import { buildMetadata, jsonLdScriptContent } from "@/lib/metadata";
import { buildTransferServiceSchema } from "@/lib/structured-data";

interface TransfersLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TransfersLayoutProps): Promise<Metadata> {
  const { locale } = await params;

  return buildMetadata({
    locale,
    path: "/transfers",
    title: {
      ro: "Transfer Aeroport Cluj-Napoca | Servicii Transfer VIP",
      en: "Cluj-Napoca Airport Transfer | VIP Transfer Services",
    },
    description: {
      ro: "Servicii profesionale de transfer în Cluj-Napoca cu Rent'n Go. Transfer aeroport Cluj, transport privat, curse personalizate. Vehicule premium, șoferi profesioniști.",
      en: "Professional transfer services in Cluj-Napoca with Rent'n Go. Cluj airport transfer, private transport, custom routes. Premium vehicles, professional drivers.",
    },
    keywords: {
      ro: "transfer aeroport cluj, transport cluj-napoca, transfer vip cluj, servicii transfer cluj, airport transfer cluj-napoca",
      en: "cluj airport transfer, transport cluj-napoca, vip transfer cluj, transfer services cluj, airport pickup cluj",
    },
    image: {
      url: "https://rngo.ro/og-transfers.png",
      width: 1376,
      height: 768,
      alt: "Rent'n Go - Transfer Services Cluj-Napoca",
    },
  });
}

const transferSchema = buildTransferServiceSchema();

export default function TransfersLayout({ children }: TransfersLayoutProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScriptContent(transferSchema),
        }}
      />
      {children}
    </>
  );
}
