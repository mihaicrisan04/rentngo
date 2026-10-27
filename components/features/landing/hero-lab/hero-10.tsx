"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll } from "motion/react";
import { useLocale, useTranslations } from "next-intl";

import type { HomeHeroProps } from "@/app/[locale]/home-page-client";
import { useTrustItems } from "@/hooks/use-trust-items";
import { CompactSearchBar } from "./compact-search-bar";
import { Hero10FleetStrip } from "./hero-10-fleet-strip";
import { Hero10Topography } from "./hero-10-topography";

const COPY = {
  ro: {
    subtitle:
      "Mașini îngrijite, preluare din Aeroportul Cluj și prețuri fără taxe ascunse.",
    fleet: "Flota noastră",
  },
  en: {
    subtitle:
      "Well-kept cars, pickup at Cluj Airport and prices with no hidden fees.",
    fleet: "Our fleet",
  },
} as const;

const CLUJ_COORDINATES = "46.77° N · 23.62° E";

export function Hero10({
  searchState,
  updateSearchField,
  vehicles,
}: HomeHeroProps) {
  const locale = useLocale();
  const copy = COPY[locale === "en" ? "en" : "ro"];
  const t = useTranslations("homepage");
  const trustItems = useTrustItems();
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const reveal = (step: number) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 14 },
    animate: { opacity: 1, y: 0 },
    transition: reduceMotion
      ? { duration: 0 }
      : {
          duration: 0.7,
          delay: 0.1 * step,
          ease: [0.22, 1, 0.36, 1] as const,
        },
  });

  return (
    <section ref={sectionRef} className="relative isolate overflow-hidden">
      <Hero10Topography scrollProgress={scrollYProgress} />

      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-12 text-center sm:px-6 md:pt-16 lg:pt-20">
        <motion.p
          {...reveal(0)}
          className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground tabular-nums sm:text-xs"
        >
          <span aria-hidden className="h-px w-6 bg-primary/60" />
          Cluj-Napoca
          <span aria-hidden className="text-primary">
            ·
          </span>
          {CLUJ_COORDINATES}
          <span aria-hidden className="h-px w-6 bg-primary/60" />
        </motion.p>

        <motion.h1
          {...reveal(1)}
          className="mt-5 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
        >
          {t("title")}
        </motion.h1>

        <motion.p
          {...reveal(2)}
          className="mt-4 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg"
        >
          {copy.subtitle}
        </motion.p>

        <motion.div {...reveal(3)} className="mt-8 w-full max-w-5xl md:mt-10">
          <CompactSearchBar
            searchState={searchState}
            updateSearchField={updateSearchField}
            layout="row"
            className="text-left shadow-2xl shadow-black/10 dark:shadow-black/40"
          />
        </motion.div>

        <motion.ul
          {...reveal(4)}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground sm:text-sm"
        >
          {trustItems.map(({ icon: Icon, label, value }) => (
            <li key={label} className="inline-flex items-center gap-1.5">
              <Icon className="size-3.5 text-primary/80" aria-hidden />
              <span>
                <span className="text-foreground/90">{label}</span> {value}
              </span>
            </li>
          ))}
        </motion.ul>
      </div>

      <motion.div {...reveal(5)} className="mt-12 pb-16 md:mt-14 md:pb-20">
        <Hero10FleetStrip vehicles={vehicles} title={copy.fleet} />
      </motion.div>
    </section>
  );
}
