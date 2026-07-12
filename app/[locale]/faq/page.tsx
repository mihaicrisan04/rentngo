import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildMetadata, jsonLdScriptContent } from "@/lib/metadata";
import {
  buildAutoRentalSchema,
  buildFaqPageSchema,
} from "@/lib/structured-data";
import { FaqSection } from "@/components/features/landing/faq";

// Number of Q&A entries in the `faqPage.questions` message namespace
// (messages/en.json + messages/ro.json are kept in lockstep).
const QUESTION_COUNT = 12;

interface FaqPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: FaqPageProps): Promise<Metadata> {
  const { locale } = await params;

  return buildMetadata({
    locale,
    path: "/faq",
    title: {
      ro: "Întrebări Frecvente | Închirieri Auto Cluj-Napoca",
      en: "FAQ | Car Rentals Cluj-Napoca",
    },
    description: {
      ro: "Răspunsuri la întrebările frecvente despre închirierea de mașini și transferurile VIP cu Rent'n Go Cluj-Napoca: documente, garanție, asigurare SCDW, kilometri, combustibil.",
      en: "Answers to frequently asked questions about car rental and VIP transfers with Rent'n Go Cluj-Napoca: documents, deposit, SCDW insurance, mileage, fuel policy.",
    },
  });
}

export default async function FaqPage({ params }: FaqPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faqPage" });

  const items = Array.from({ length: QUESTION_COUNT }, (_, i) => ({
    question: t(`questions.${i}.question`),
    answer: t(`questions.${i}.answer`),
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScriptContent(buildFaqPageSchema(items)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScriptContent(buildAutoRentalSchema(locale)),
        }}
      />
      <FaqSection
        title={t("title")}
        description={t("description")}
        items={items}
        ctaSection={{
          title: t("cta.title"),
          description: t("cta.description"),
          buttonText: t("cta.buttonText"),
          href: `/${locale}/cars`,
        }}
      />
    </>
  );
}
