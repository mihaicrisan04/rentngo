"use client";

import {
  ArrowDown,
  CalendarCheck,
  CarFront,
  KeyRound,
  Star,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";

import type { HomeHeroProps } from "@/app/[locale]/home-page-client";
import { useTrustItems } from "@/hooks/use-trust-items";
import { GOOGLE_RATING, GOOGLE_REVIEWS_URL } from "@/lib/google-reviews";
import { CompactSearchBar } from "./compact-search-bar";
import { Hero08Steps, type Hero08Step } from "./hero-08-steps";
import { useLowestFromPrice } from "./use-lowest-from-price";

const COPY = {
  ro: {
    eyebrow: "Închirieri auto · Cluj-Napoca",
    howHint: "Cum funcționează",
    howTitle: "Cum închiriezi, în trei pași",
    howLead: "Totul se face online, cu prețuri clare și fără taxe ascunse.",
    stepLabel: "Pasul",
    steps: [
      {
        title: "Alege mașina",
        body: "Setezi datele și locul, apoi compari mașinile disponibile, cu prețul pe zi afișat de la început.",
      },
      {
        title: "Rezervă online",
        body: "Completezi datele în câteva minute și primești confirmarea rezervării pe e-mail.",
      },
      {
        title: "Preia mașina",
        body: "La Aeroportul Internațional Cluj sau livrată la adresa ta, contra unei taxe suplimentare.",
      },
    ],
  },
  en: {
    eyebrow: "Car rental · Cluj-Napoca",
    howHint: "How it works",
    howTitle: "How renting works, in three steps",
    howLead: "Everything happens online, with clear prices and no hidden fees.",
    stepLabel: "Step",
    steps: [
      {
        title: "Choose your car",
        body: "Set your dates and place, then compare the available cars with the daily price shown up front.",
      },
      {
        title: "Book online",
        body: "Fill in your details in a few minutes and get the booking confirmation by email.",
      },
      {
        title: "Pick it up",
        body: "At Cluj International Airport, or delivered to your address for an extra fee.",
      },
    ],
  },
} as const;

const STEP_ICONS = [CarFront, CalendarCheck, KeyRound] as const;
const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero08({
  searchState,
  updateSearchField,
  vehicles,
}: HomeHeroProps) {
  const t = useTranslations("homepage");
  const tTrust = useTranslations("homepage.trustBar");
  const tCard = useTranslations("vehicleCard");
  const locale = useLocale();
  const copy = COPY[locale === "en" ? "en" : "ro"];
  const reduceMotion = useReducedMotion();
  const lowestPrice = useLowestFromPrice(vehicles);
  const [noCard, airport, support, roadside] = useTrustItems();

  const notesPerStep = [[support], [noCard], [airport, roadside]];
  const steps: Hero08Step[] = copy.steps.map((step, index) => ({
    ...step,
    icon: STEP_ICONS[index],
    notes: notesPerStep[index],
  }));

  const reveal = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 0.7, delay, ease: EASE },
  });

  const stepsHeader = (
    <div className="flex flex-col gap-3 md:items-center md:text-center">
      <div className="accent-line" />
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
        {copy.howTitle}
      </h2>
      <p className="max-w-xl text-base text-muted-foreground md:text-lg">
        {copy.howLead}
      </p>
    </div>
  );

  return (
    <section className="relative">
      <div className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6 md:pt-14 lg:pt-20">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          <div>
            <motion.p
              {...reveal(0)}
              className="flex items-center gap-3 text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase md:text-sm"
            >
              <span className="h-px w-8 bg-primary" />
              {copy.eyebrow}
            </motion.p>
            <motion.h1
              {...reveal(0.08)}
              className="mt-4 text-4xl leading-[1.04] font-bold tracking-tight text-balance sm:text-5xl lg:text-7xl"
            >
              {t("title")}
            </motion.h1>
            <motion.p
              {...reveal(0.16)}
              className="mt-4 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground md:mt-5 md:text-lg"
            >
              {t("subtitle")}
            </motion.p>
          </div>

          <motion.dl
            {...reveal(0.24)}
            className="flex gap-8 border-border/70 lg:flex-col lg:gap-5 lg:border-l lg:pb-2 lg:pl-8"
          >
            <div>
              <dt className="sr-only">Google</dt>
              <dd>
                <a
                  href={GOOGLE_REVIEWS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <span className="flex items-center gap-1.5 font-heading text-xl font-semibold md:text-2xl">
                    <Star className="size-4 fill-primary text-primary md:size-5" />
                    {tTrust("rating", { score: GOOGLE_RATING.score })}
                  </span>
                  <span className="text-sm text-muted-foreground underline-offset-4 group-hover:underline">
                    {tTrust("ratingDesc", { count: GOOGLE_RATING.reviewCount })}
                  </span>
                </a>
              </dd>
            </div>
            {lowestPrice !== null && (
              <div>
                <dt className="text-sm text-muted-foreground">
                  {tCard("fromPrice")}
                </dt>
                <dd className="font-heading text-xl font-semibold md:text-2xl">
                  {lowestPrice} €
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {tCard("perDay")}
                  </span>
                </dd>
              </div>
            )}
          </motion.dl>
        </div>

        <motion.div {...reveal(0.3)} className="mt-8 md:mt-10">
          <CompactSearchBar
            searchState={searchState}
            updateSearchField={updateSearchField}
            layout="row"
          />
        </motion.div>

        <a
          href="#hero08-how"
          className="mt-8 hidden items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
        >
          <ArrowDown className="size-4 text-primary" />
          {copy.howHint}
        </a>
      </div>

      <div
        id="hero08-how"
        className="mx-auto mt-16 w-full max-w-6xl scroll-mt-20 px-4 pb-12 md:mt-8 md:px-6 md:pb-0"
      >
        <Hero08Steps
          steps={steps}
          stepLabel={copy.stepLabel}
          header={stepsHeader}
        />
      </div>
    </section>
  );
}
