import { Metadata } from "next";
import { buildMetadata, jsonLdScriptContent } from "@/lib/metadata";
import { buildContactPageSchema } from "@/lib/structured-data";
import { COMPANY } from "@/lib/company";

interface ContactLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ContactLayoutProps): Promise<Metadata> {
  const { locale } = await params;

  return buildMetadata({
    locale,
    path: "/contact",
    title: {
      ro: "Contact Rent'n Go - Masini de Inchiriat Cluj-Napoca",
      en: "Contact Rent'n Go - Car Rentals Cluj-Napoca",
    },
    description: {
      ro: `Contactează Rent'n Go pentru masini de inchiriat Cluj-Napoca. Telefon: ${COMPANY.phone.display}. Email: ${COMPANY.email}. Servicii profesionale de închiriere auto în Cluj.`,
      en: `Contact Rent'n Go for car rentals in Cluj-Napoca. Phone: ${COMPANY.phone.display}. Email: ${COMPANY.email}. Professional car rental services in Cluj.`,
    },
    keywords: {
      ro: "contact rent n go, masini de inchiriat cluj-napoca, telefon închiriere auto cluj, car rentals cluj contact",
      en: "contact rent n go, car rentals cluj-napoca, car hire phone cluj, car rental contact",
    },
  });
}

const contactSchema = buildContactPageSchema();

export default function ContactLayout({ children }: ContactLayoutProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptContent(contactSchema) }}
      />
      {children}
    </>
  );
}
