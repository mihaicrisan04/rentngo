"use client";

import { useRef } from "react";
import { Plane } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useLocale, useTranslations } from "next-intl";

import type { HomeHeroProps } from "@/app/[locale]/home-page-client";
import { useTrustItems } from "@/hooks/use-trust-items";
import { CompactSearchBar } from "./compact-search-bar";
import { Hero05RouteMap } from "./hero-05-route-map";

const COPY = {
  ro: {
    eyebrow: "Preluare la Aeroport Cluj",
    subtitle:
      "Ridici mașina direct de la Aeroportul Cluj și pornești spre oraș. Prețuri corecte, fără costuri ascunse.",
  },
  en: {
    eyebrow: "Pickup at Cluj Airport",
    subtitle:
      "Pick up your car right at Cluj Airport and head into town. Fair prices, no hidden fees.",
  },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

export function Hero05({ searchState, updateSearchField }: HomeHeroProps) {
  const t = useTranslations("homepage");
  const locale = useLocale();
  const copy = COPY[locale === "en" ? "en" : "ro"];
  const trustItems = useTrustItems();
  const reduceMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const tilt = useTransform(scrollYProgress, [0, 1], [0, 16]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  const reveal = (delay: number) =>
    reduceMotion
      ? {}
      : {
          variants: fadeUp,
          initial: "hidden",
          animate: "visible",
          transition: {
            duration: 0.6,
            delay,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        };

  return (
    <section
      ref={sectionRef}
      className="mx-auto grid w-full max-w-7xl gap-x-12 gap-y-6 px-4 pb-14 pt-6 sm:px-6 md:pt-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-y-6 lg:px-8 lg:pb-20 lg:pt-8"
    >
      <motion.div {...reveal(0)} className="lg:col-start-1 lg:self-end">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/80">
          <Plane className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          {copy.eyebrow}
        </p>
        <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl xl:text-[3.5rem]">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          {copy.subtitle}
        </p>
      </motion.div>

      <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 [perspective:1400px]">
        <motion.div
          style={
            reduceMotion
              ? undefined
              : { rotateX: tilt, scale, transformOrigin: "50% 0%" }
          }
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Hero05RouteMap />
          </motion.div>
        </motion.div>
      </div>

      <motion.div {...reveal(0.12)} className="lg:col-start-1 lg:self-start">
        <CompactSearchBar
          layout="stack"
          searchState={searchState}
          updateSearchField={updateSearchField}
          className="max-w-xl"
        />
        <ul className="mt-4 grid max-w-xl grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {trustItems.map(({ icon: Icon, label, value }) => (
            <li key={label} className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="leading-tight">
                <span className="block font-medium text-foreground">
                  {label}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {value}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
