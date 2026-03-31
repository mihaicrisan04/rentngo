import { Metadata } from "next";
import { buildMetadata, jsonLdScriptContent } from "@/lib/metadata";

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
      ro: "Contactează Rent'n Go pentru masini de inchiriat Cluj-Napoca. Telefon: +40 773 932 961. Email: office@rngo.ro. Servicii profesionale de închiriere auto în Cluj.",
      en: "Contact Rent'n Go for car rentals in Cluj-Napoca. Phone: +40 773 932 961. Email: office@rngo.ro. Professional car rental services in Cluj.",
    },
    keywords: {
      ro: "contact rent n go, masini de inchiriat cluj-napoca, telefon închiriere auto cluj, car rentals cluj contact",
      en: "contact rent n go, car rentals cluj-napoca, car hire phone cluj, car rental contact",
    },
  });
}

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  mainEntity: {
    "@type": "Organization",
    name: "Rent'n Go",
    telephone: "+40-773-932-961",
    email: "office@rngo.ro",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        'Cluj "Avram Iancu" International Airport, Strada Traian Vuia 149-151',
      addressLocality: "Cluj-Napoca",
      postalCode: "400397",
      addressCountry: "RO",
    },
    openingHours: ["Mo-Su 00:00-23:59"],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+40-773-932-961",
        contactType: "customer service",
        availableLanguage: ["Romanian", "English"],
        areaServed: "Cluj-Napoca",
      },
      {
        "@type": "ContactPoint",
        email: "office@rngo.ro",
        contactType: "customer service",
        availableLanguage: ["Romanian", "English"],
      },
    ],
  },
};

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
