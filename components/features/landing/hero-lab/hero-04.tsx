"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";

import type { HomeHeroProps } from "@/app/[locale]/home-page-client";
import { useTrustItems } from "@/hooks/use-trust-items";
import { CompactSearchBar } from "./compact-search-bar";
import { Hero04Road } from "./hero-04-road";

const COPY = {
  ro: {
    eyebrow: "Cluj-Napoca · Aeroport Cluj",
    roadIntro: "Ce primești pe drum",
    details: [
      "Garanția se poate achita și în numerar, la preluare.",
      "Te așteptăm la Aeroportul Internațional Avram Iancu Cluj.",
      "Ne găsești la telefon sau pe WhatsApp, la orice oră.",
      "Ești acoperit pe tot drumul, fără costuri ascunse.",
    ],
  },
  en: {
    eyebrow: "Cluj-Napoca · Cluj Airport",
    roadIntro: "What comes with the ride",
    details: [
      "The deposit can also be paid in cash at pickup.",
      "We meet you at Avram Iancu International Airport, Cluj.",
      "Reach us by phone or WhatsApp, at any hour.",
      "Covered for the whole trip, with no hidden costs.",
    ],
  },
} as const;

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero04({ searchState, updateSearchField }: HomeHeroProps) {
  const t = useTranslations("homepage");
  const locale = useLocale();
  const copy = COPY[locale === "en" ? "en" : "ro"];
  const trustItems = useTrustItems();
  const reduceMotion = useReducedMotion();

  const reveal = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section className="relative isolate">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-[radial-gradient(60%_55%_at_50%_0%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent)]"
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-10 text-center md:px-6 md:pt-16 lg:pt-20">
        <motion.p
          {...reveal(0)}
          className="flex items-center gap-3 text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase md:text-sm"
        >
          <span className="h-px w-8 bg-primary" />
          {copy.eyebrow}
          <span className="h-px w-8 bg-primary" />
        </motion.p>
        <motion.h1
          {...reveal(0.08)}
          className="mt-5 max-w-4xl text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl lg:text-7xl"
        >
          {t("title")}
        </motion.h1>
        <motion.p
          {...reveal(0.16)}
          className="mt-5 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground md:text-lg"
        >
          {t("subtitle")}
        </motion.p>
        <motion.div
          {...reveal(0.24)}
          className="mt-8 w-full text-left md:mt-10"
        >
          <CompactSearchBar
            searchState={searchState}
            updateSearchField={updateSearchField}
            layout="row"
          />
        </motion.div>
      </div>

      <div className="px-4 pt-14 md:px-6 md:pt-20">
        <h2 className="sr-only">{copy.roadIntro}</h2>
        <Hero04Road items={trustItems} details={copy.details} />
      </div>
    </section>
  );
}
