"use client";

import { useRef } from "react";
import { ArrowUpRight, Star } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  type Variants,
} from "motion/react";
import { useLocale, useTranslations } from "next-intl";

import type { HomeHeroProps } from "@/app/[locale]/home-page-client";
import { useTrustItems } from "@/hooks/use-trust-items";
import { GOOGLE_RATING, GOOGLE_REVIEWS_URL } from "@/lib/google-reviews";
import { cn } from "@/lib/utils";
import { CompactSearchBar } from "./compact-search-bar";
import { useLowestFromPrice } from "./use-lowest-from-price";

const HIGHLIGHT = "Cluj-Napoca";

const COPY = {
  ro: {
    masthead: "RentNGo · Cluj-Napoca",
    services: "Închirieri auto · Transferuri VIP",
    briefLabel: "Pe scurt",
    priceLabel: "Tarife",
    priceNote: "Fără taxe ascunse",
    reviewsLabel: "Recenzii",
    trustLabel: "Inclus la fiecare închiriere",
    scrollCue: "Flota",
    deck: "Închiriezi direct de la proprietar, cu preluare de la Aeroport Cluj.",
  },
  en: {
    masthead: "RentNGo · Cluj-Napoca",
    services: "Car rental · VIP transfers",
    briefLabel: "In brief",
    priceLabel: "Rates",
    priceNote: "No hidden fees",
    reviewsLabel: "Reviews",
    trustLabel: "Included with every rental",
    scrollCue: "The fleet",
    deck: "Rent directly from the owner, with pickup at Cluj Airport.",
  },
} as const;

const SCOPED_STYLE = `
.hero07 { --h07-gold: oklch(0.55 0.115 78); --h07-brush: oklch(0.82 0.165 88 / 0.85); }
.dark .hero07 { --h07-gold: oklch(0.8 0.13 86); --h07-brush: oklch(0.61 0.11 83.69 / 0.75); }
`;

const EASE = [0.22, 1, 0.36, 1] as const;

const pageVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const lineReveal: Variants = {
  hidden: { y: "105%" },
  show: { y: "0%", transition: { duration: 0.9, ease: EASE } },
};

const ruleDraw: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 1.1, ease: EASE } },
};

const LABEL =
  "text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase";
const RULE = "h-px origin-left bg-foreground/15";

function splitTitle(title: string) {
  const at = title.indexOf(HIGHLIGHT);
  if (at === -1) return { lead: title, word: "" };
  return { lead: title.slice(0, at).trim(), word: HIGHLIGHT };
}

function BrushUnderline({ animate }: { animate: boolean }) {
  const draw = (delay: number) =>
    animate
      ? {
          initial: { pathLength: 0 },
          animate: { pathLength: 1 },
          transition: { duration: 1.1, delay, ease: EASE },
        }
      : {};

  return (
    <svg
      aria-hidden
      viewBox="0 0 400 28"
      preserveAspectRatio="none"
      className="pointer-events-none absolute top-[86%] left-0 -z-10 h-[0.26em] w-full overflow-visible"
    >
      <motion.path
        d="M4 18 C 70 8, 150 5, 232 9 S 352 19, 396 9"
        fill="none"
        stroke="var(--h07-brush)"
        strokeWidth={9}
        strokeLinecap="round"
        {...draw(0.85)}
      />
      <motion.path
        d="M30 24 C 120 15, 250 14, 380 19"
        fill="none"
        stroke="var(--h07-brush)"
        strokeOpacity={0.55}
        strokeWidth={3}
        strokeLinecap="round"
        {...draw(1.15)}
      />
    </svg>
  );
}

function ScrollThread({
  label,
  reduceMotion,
}: {
  label: string;
  reduceMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end 0.55"],
  });
  const pathLength = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div
      ref={ref}
      aria-hidden
      className="mt-10 flex flex-col items-center gap-3 md:mt-14"
    >
      <span className={LABEL}>{label}</span>
      <svg viewBox="0 0 24 160" className="h-32 w-6 overflow-visible md:h-40">
        <path
          d="M12 0 V160"
          stroke="currentColor"
          strokeWidth={1}
          className="text-foreground/10"
        />
        <motion.path
          d="M12 0 C 12 40, 4 58, 12 80 S 20 120, 12 160"
          fill="none"
          stroke="var(--h07-gold)"
          strokeWidth={1.5}
          strokeLinecap="round"
          style={{ pathLength: reduceMotion ? 1 : pathLength }}
        />
        <motion.circle
          cx={12}
          cy={160}
          r={3.5}
          fill="var(--h07-gold)"
          style={{ opacity: reduceMotion ? 1 : pathLength }}
        />
      </svg>
    </div>
  );
}

function formatScore(score: number, locale: string) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 1 }).format(
    score,
  );
}

export function Hero07({
  searchState,
  updateSearchField,
  vehicles,
}: HomeHeroProps) {
  const t = useTranslations("homepage");
  const tTrust = useTranslations("homepage.trustBar");
  const tCard = useTranslations("vehicleCard");
  const locale = useLocale();
  const copy = COPY[locale === "en" ? "en" : "ro"];
  const trustItems = useTrustItems();
  const lowestPrice = useLowestFromPrice(vehicles);
  const reduceMotion = useReducedMotion() ?? false;
  const { lead, word } = splitTitle(t("title"));

  return (
    <section className="hero07 relative mx-auto w-full max-w-7xl px-5 pt-6 md:px-8 lg:pt-7">
      <style>{SCOPED_STYLE}</style>
      <motion.div
        variants={pageVariants}
        initial={reduceMotion ? false : "hidden"}
        animate="show"
      >
        <motion.div
          variants={fadeUp}
          className={cn(LABEL, "flex items-center justify-between gap-4")}
        >
          <span>{copy.masthead}</span>
          <span className="hidden sm:inline">{copy.services}</span>
        </motion.div>
        <motion.div variants={ruleDraw} className={cn(RULE, "mt-3")} />

        <div className="relative mt-6 md:mt-8">
          <h1 className="font-heading text-[clamp(3.1rem,9.8vw,9.5rem)] leading-[0.88] font-bold tracking-[-0.045em] text-foreground">
            <span className="-my-[0.14em] block overflow-hidden py-[0.14em]">
              <motion.span variants={lineReveal} className="block">
                {lead}
              </motion.span>
            </span>
            {word && (
              <span className="-mt-[0.14em] -mb-[0.3em] block overflow-hidden pt-[0.14em] pb-[0.3em] md:text-right">
                <motion.span variants={lineReveal} className="block">
                  <span className="relative isolate inline-block text-[var(--h07-gold)]">
                    {word}
                    <BrushUnderline animate={!reduceMotion} />
                  </span>
                </motion.span>
              </span>
            )}
          </h1>
          <motion.p
            variants={fadeUp}
            className="absolute bottom-[0.4rem] left-0 hidden max-w-[15rem] border-l-2 border-[var(--h07-gold)] pl-4 text-[15px] leading-snug text-foreground/75 md:block lg:max-w-[17rem]"
          >
            {copy.deck}
          </motion.p>
        </div>

        <motion.div
          variants={ruleDraw}
          className={cn(RULE, "mt-10 md:mt-12")}
        />
        <motion.dl
          variants={fadeUp}
          className="grid grid-cols-2 gap-6 py-5 md:grid-cols-[1.4fr_1fr_1fr] md:gap-0 md:divide-x md:divide-foreground/15"
        >
          <div className="hidden md:block md:pr-8">
            <dt className={LABEL}>{copy.briefLabel}</dt>
            <dd className="mt-2.5 max-w-md text-[15px] leading-relaxed text-foreground/80">
              {t("subtitle")}
            </dd>
          </div>
          <div className="md:px-8">
            <dt className={LABEL}>{copy.priceLabel}</dt>
            <dd className="mt-2 flex items-baseline gap-2 font-heading text-foreground">
              <span className="text-sm text-muted-foreground">
                {tCard("fromPrice")}
              </span>
              {lowestPrice === null ? (
                <span className="inline-block h-9 w-20 animate-pulse self-center rounded-md bg-foreground/10" />
              ) : (
                <span className="text-4xl font-semibold tracking-tight tabular-nums">
                  {lowestPrice} €
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                {tCard("perDay")}
              </span>
            </dd>
            <dd className="mt-1 text-sm text-muted-foreground">
              {copy.priceNote}
            </dd>
          </div>
          <div className="md:pl-8">
            <dt className={LABEL}>{copy.reviewsLabel}</dt>
            <dd className="mt-2">
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex flex-col"
              >
                <span className="flex items-baseline gap-3">
                  <span className="font-heading text-4xl font-semibold tracking-tight text-foreground tabular-nums">
                    {formatScore(GOOGLE_RATING.score, locale)}
                  </span>
                  <span className="flex gap-0.5" aria-hidden>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className="size-3.5 fill-[var(--h07-gold)] text-[var(--h07-gold)]"
                      />
                    ))}
                  </span>
                </span>
                <span className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 transition-colors group-hover:text-foreground group-hover:underline">
                  {tTrust("ratingDesc", { count: GOOGLE_RATING.reviewCount })} ·
                  Google
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </a>
            </dd>
          </div>
        </motion.dl>

        <motion.div variants={fadeUp}>
          <CompactSearchBar
            layout="row"
            searchState={searchState}
            updateSearchField={updateSearchField}
            className="border-foreground/15 bg-background shadow-[0_1px_0_0_var(--border),0_24px_48px_-32px_rgb(0_0_0/0.35)]"
          />
        </motion.div>

        <motion.div variants={fadeUp} className="mt-7 md:mt-8">
          <p className={LABEL}>{copy.trustLabel}</p>
          <ol className="mt-3 grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
            {trustItems.map((item, index) => (
              <li
                key={item.label}
                className="group flex gap-3 border-t border-foreground/15 pt-3"
              >
                <span className="font-heading text-sm font-semibold text-[var(--h07-gold)] tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] leading-snug font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {item.value}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </motion.div>
      </motion.div>

      <ScrollThread label={copy.scrollCue} reduceMotion={reduceMotion} />
    </section>
  );
}
