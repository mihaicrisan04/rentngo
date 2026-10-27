"use client";

import { MapPin, Star } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";

import type { HomeHeroProps } from "@/app/[locale]/home-page-client";
import { useTrustItems } from "@/hooks/use-trust-items";
import { GOOGLE_RATING, GOOGLE_REVIEWS_URL } from "@/lib/google-reviews";
import { LOCATION_DATA } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { CompactSearchBar } from "./compact-search-bar";

const COPY = {
  ro: {
    subtitle:
      "Alege locul și perioada, iar noi îți arătăm mașinile disponibile.",
    quickPickup: "Ridicare rapidă",
    free: "gratuit",
  },
  en: {
    subtitle:
      "Pick a place and your dates, and we'll show you the cars that are free.",
    quickPickup: "Quick pickup",
    free: "free",
  },
} as const;

const QUICK_LOCATION_NAMES = [
  "Aeroport Cluj-Napoca",
  "Cluj-Napoca",
  "Floresti",
  "Targu Mures",
  "Sibiu",
  "Oradea",
];

const QUICK_LOCATIONS = LOCATION_DATA.filter((location) =>
  QUICK_LOCATION_NAMES.includes(location.name),
).sort(
  (a, b) =>
    QUICK_LOCATION_NAMES.indexOf(a.name) - QUICK_LOCATION_NAMES.indexOf(b.name),
);

const GRID_BACKGROUND = {
  backgroundImage:
    "linear-gradient(to right, color-mix(in oklab, var(--border) 55%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--border) 55%, transparent) 1px, transparent 1px)",
  backgroundSize: "56px 56px",
  backgroundPosition: "center top",
  maskImage:
    "radial-gradient(ellipse 70% 65% at 50% 40%, black 10%, transparent 75%)",
  WebkitMaskImage:
    "radial-gradient(ellipse 70% 65% at 50% 40%, black 10%, transparent 75%)",
};

export function Hero02({ searchState, updateSearchField }: HomeHeroProps) {
  const locale = useLocale();
  const copy = COPY[locale === "en" ? "en" : "ro"];
  const t = useTranslations("homepage");
  const tTrust = useTranslations("homepage.trustBar");
  const trustItems = useTrustItems();
  const reduceMotion = useReducedMotion();

  const reveal = (step: number) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: reduceMotion
      ? { duration: 0 }
      : {
          duration: 0.6,
          delay: 0.08 * step,
          ease: [0.22, 1, 0.36, 1] as const,
        },
  });

  const pickLocation = (name: string) => {
    updateSearchField("deliveryLocation", name);
    updateSearchField("restitutionLocation", name);
  };

  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0" style={GRID_BACKGROUND} />
        <div className="absolute left-1/2 top-0 h-[520px] w-[min(1100px,140vw)] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_16%,transparent),transparent)]" />
      </div>

      <div className="mx-auto flex min-h-[min(68vh,700px)] max-w-6xl flex-col items-center justify-center px-4 pb-16 pt-10 text-center sm:px-6 md:pb-20 md:pt-14">
        <motion.a
          {...reveal(0)}
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-foreground sm:text-sm"
        >
          <Star className="size-3.5 fill-primary text-primary" aria-hidden />
          <span className="text-foreground">
            {tTrust("rating", { score: GOOGLE_RATING.score.toFixed(1) })}
          </span>
          <span aria-hidden className="h-3 w-px bg-border" />
          <span>
            {tTrust("ratingDesc", { count: GOOGLE_RATING.reviewCount })}
          </span>
        </motion.a>

        <motion.h1
          {...reveal(1)}
          className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
        >
          {t("title")}
        </motion.h1>

        <motion.p
          {...reveal(2)}
          className="mt-3 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg"
        >
          {copy.subtitle}
        </motion.p>

        <motion.div {...reveal(3)} className="relative mt-8 w-full max-w-5xl">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-6 -inset-y-4 -z-10 rounded-[2rem] bg-primary/10 blur-2xl"
          />
          <CompactSearchBar
            searchState={searchState}
            updateSearchField={updateSearchField}
            layout="row"
            className="rounded-3xl border-border/80 bg-card/95 p-3 text-left shadow-2xl shadow-black/10 ring-1 ring-primary/10 backdrop-blur md:p-4 dark:shadow-black/40"
          />
        </motion.div>

        <motion.ul
          {...reveal(4)}
          className="mt-7 grid w-full max-w-md grid-cols-2 gap-x-4 gap-y-3 text-left text-sm sm:flex sm:max-w-none sm:flex-wrap sm:items-center sm:justify-center sm:gap-y-2 sm:text-center"
        >
          {trustItems.map(({ icon: Icon, label, value }, index) => (
            <li key={label} className="flex items-center gap-2 sm:gap-0">
              {index > 0 && (
                <span
                  aria-hidden
                  className="mx-4 hidden h-4 w-px bg-border sm:block"
                />
              )}
              <Icon
                className="size-4 shrink-0 text-primary sm:mr-2"
                aria-hidden
              />
              <span className="leading-tight">
                <span className="font-medium text-foreground">{label}</span>{" "}
                <span className="text-muted-foreground">{value}</span>
              </span>
            </li>
          ))}
        </motion.ul>

        <motion.div
          {...reveal(5)}
          className="mt-8 flex w-full max-w-3xl flex-col items-center gap-3"
        >
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {copy.quickPickup}
          </span>
          <ul className="flex flex-wrap justify-center gap-2">
            {QUICK_LOCATIONS.map(({ name, price }) => {
              const isActive = searchState.deliveryLocation === name;
              return (
                <li key={name}>
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => pickLocation(name)}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "border-primary bg-primary/15 text-foreground"
                        : "border-border/70 bg-card/50 text-foreground/85 hover:border-primary/50 hover:bg-card",
                    )}
                  >
                    <MapPin
                      className={cn(
                        "size-3.5",
                        isActive ? "text-primary" : "text-muted-foreground",
                      )}
                      aria-hidden
                    />
                    {name}
                    <span
                      className={cn(
                        "text-xs tabular-nums",
                        price > 0 ? "text-muted-foreground" : "text-primary",
                      )}
                    >
                      {price > 0 ? `+${price} €` : copy.free}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
