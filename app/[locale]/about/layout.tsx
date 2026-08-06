import { Metadata } from "next";
import { buildMetadata, jsonLdScriptContent } from "@/lib/metadata";
import { buildOrganizationSchema } from "@/lib/structured-data";

interface AboutLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AboutLayoutProps): Promise<Metadata> {
  const { locale } = await params;

  return buildMetadata({
    locale,
    path: "/about",
    title: {
      ro: "Despre Rent'n Go - Masini de Inchiriat Cluj-Napoca",
      en: "About Rent'n Go - Car Rentals Cluj-Napoca",
    },
    description: {
      ro: "Află mai multe despre Rent'n Go, liderul în masini de inchiriat Cluj-Napoca. Servicii profesionale de închiriere auto în Cluj cu experiență de peste 5 ani.",
      en: "Learn more about Rent'n Go, the leader in car rentals in Cluj-Napoca. Professional car rental services in Cluj with over 5 years of experience.",
    },
    keywords: {
      ro: "despre rent n go, masini de inchiriat cluj-napoca, car rentals cluj-napoca, istoric companie închiriere auto",
      en: "about rent n go, car rentals cluj-napoca, car hire cluj, rental company history",
    },
  });
}

const organizationSchema = buildOrganizationSchema();

export default function AboutLayout({ children }: AboutLayoutProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptContent(organizationSchema) }}
      />
      {children}
    </>
  );
}
