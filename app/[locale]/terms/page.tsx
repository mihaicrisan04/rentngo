import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { COMPANY } from "@/lib/company";
import { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { isLocale } from "@/i18n";
import { TERMS_CONTENT } from "./terms-content";

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;

  return buildMetadata({
    locale,
    path: "/terms",
    title: {
      ro: "Termeni și Condiții",
      en: "Terms and Conditions",
    },
    description: {
      ro: "Termeni și condiții pentru închirierea de mașini cu Rent'n Go Cluj-Napoca. Citiți condițiile generale de închiriere auto.",
      en: "Terms and conditions for car rental with Rent'n Go Cluj-Napoca. Read the general car rental conditions.",
    },
  });
}

export default async function TermsAndConditionsPage({
  params,
}: TermsPageProps) {
  const { locale } = await params;
  const content = TERMS_CONTENT[isLocale(locale) ? locale : "ro"];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-10">
        <div className="flex justify-center mb-5">
          <div className="accent-line"></div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-center tracking-tight">
          {content.heading}
        </h1>
      </div>

      <div className="section-divider mb-10"></div>

      {content.sections.map((section) => (
        <Card key={section.title} className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.blocks.map((block, i) =>
              typeof block === "string" ? (
                <p key={i}>{block}</p>
              ) : (
                <ul key={i} className="list-disc list-inside space-y-2 ml-4">
                  {block.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ),
            )}
          </CardContent>
        </Card>
      ))}

      <div className="section-divider my-10"></div>

      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">{content.contact.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>{COMPANY.legalName}</strong>
          </p>
          <p>
            {content.contact.emailLabel}:{" "}
            <Link
              href={`mailto:${COMPANY.email}`}
              className="text-primary hover:underline"
            >
              {COMPANY.email}
            </Link>
          </p>
          <p>
            {content.contact.phoneLabel}: {COMPANY.phone.tel}
          </p>
          <p>
            {content.contact.addressLabel}: {content.contact.address}
          </p>
        </CardContent>
      </Card>

      <div className="section-divider my-10"></div>

      <div className="text-center pb-4">
        <p className="text-sm text-muted-foreground">{content.lastUpdated}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {content.acknowledgement}
        </p>
      </div>
    </div>
  );
}
