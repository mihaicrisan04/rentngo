"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowUpRight, Star } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useLocale, useTranslations } from "next-intl";

import type { HomeHeroProps } from "@/app/[locale]/home-page-client";
import { useTrustItems } from "@/hooks/use-trust-items";
import { GOOGLE_RATING, GOOGLE_REVIEWS_URL } from "@/lib/google-reviews";
import { cn } from "@/lib/utils";
import { CompactSearchBar } from "./compact-search-bar";

const COPY = {
  ro: {
    owner: "Vorbești direct cu Tudor, proprietarul.",
    imageAlt: "Tudor, proprietarul RentNGo, între două mașini negre din flotă",
  },
  en: {
    owner: "You talk directly to Tudor, the owner.",
    imageAlt:
      "Tudor, owner of RentNGo, standing between two black cars from the fleet",
  },
} as const;

const KEYFRAMES = `
@keyframes hero03-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes hero03-reveal { from { opacity: 0; clip-path: inset(6% 4% 0 4% round 1.5rem); } to { opacity: 1; clip-path: inset(0 0 0 0 round 1.5rem); } }
@keyframes hero03-settle { from { transform: scale(1.06); } to { transform: none; } }
`;

const rise =
  "motion-safe:animate-[hero03-rise_0.7s_cubic-bezier(0.22,1,0.36,1)_both]";

export function Hero03({ searchState, updateSearchField }: HomeHeroProps) {
  const t = useTranslations("homepage");
  const tTrust = useTranslations("homepage.trustBar");
  const locale = useLocale();
  const copy = COPY[locale === "en" ? "en" : "ro"];
  const trustItems = useTrustItems();

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-6 pb-14 md:px-6 md:pt-10 lg:px-8 lg:pb-20">
      <style>{KEYFRAMES}</style>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <div className="max-w-3xl">
          <div className={cn("accent-line mb-5", rise)} />
          <h1
            className={cn(
              "text-balance text-4xl font-bold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl",
              rise,
              "[animation-delay:60ms]",
            )}
          >
            {t("title")}
          </h1>
          <p
            className={cn(
              "mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg",
              rise,
              "[animation-delay:130ms]",
            )}
          >
            {t("subtitle")}
          </p>
        </div>

        <aside
          className={cn("shrink-0 lg:pb-1", rise, "[animation-delay:200ms]")}
        >
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${tTrust("rating", { score: GOOGLE_RATING.score })}, ${tTrust("ratingDesc", { count: GOOGLE_RATING.reviewCount })}`}
            className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-card/60 px-4 py-3 transition-colors hover:border-primary/40 lg:max-w-xs lg:flex-col lg:items-start lg:gap-2 lg:px-5 lg:py-4"
          >
            <span className="flex items-baseline gap-2">
              <span className="font-heading text-3xl leading-none font-bold tabular-nums">
                {GOOGLE_RATING.score.toFixed(1)}
              </span>
              <span className="flex text-primary" aria-hidden>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </span>
            </span>
            <span className="min-w-0 text-sm">
              <span className="flex items-center gap-1 font-medium">
                {tTrust("ratingDesc", { count: GOOGLE_RATING.reviewCount })} ·
                Google
                <ArrowUpRight
                  className="size-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
              <span className="block text-muted-foreground">{copy.owner}</span>
            </span>
          </a>
        </aside>
      </div>

      <div className="mt-8 lg:mt-10">
        <PhotoWindow alt={copy.imageAlt} />

        <div
          className={cn(
            "relative z-10 mx-auto -mt-8 w-[calc(100%-1.5rem)] max-w-6xl sm:w-[calc(100%-3rem)] lg:-mt-[76px] lg:w-[calc(100%-5rem)]",
            rise,
            "[animation-delay:420ms]",
          )}
        >
          <CompactSearchBar
            layout="row"
            searchState={searchState}
            updateSearchField={updateSearchField}
            className="shadow-2xl shadow-black/15 dark:shadow-black/50"
          />
        </div>
      </div>

      <ul
        className={cn(
          "mx-auto mt-8 grid max-w-6xl grid-cols-2 gap-x-4 gap-y-5 lg:mt-10 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-border/70",
          rise,
          "[animation-delay:520ms]",
        )}
      >
        {trustItems.map(({ icon: Icon, label, value }) => (
          <li
            key={label}
            className="flex items-center gap-3 lg:justify-center lg:px-6"
          >
            <Icon className="size-5 shrink-0 text-primary" aria-hidden />
            <span className="min-w-0 text-sm leading-tight">
              <span className="block font-semibold">{label}</span>
              <span className="block text-muted-foreground">{value}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface PhotoWindowProps {
  alt: string;
}

function PhotoWindow({ alt }: PhotoWindowProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative aspect-[16/10] overflow-hidden rounded-3xl bg-muted sm:aspect-[2/1] lg:aspect-auto lg:h-[clamp(380px,calc(100svh-27rem),480px)]",
        "motion-safe:animate-[hero03-reveal_1s_cubic-bezier(0.22,1,0.36,1)_both] [animation-delay:240ms]",
      )}
    >
      <motion.div
        className="absolute inset-x-0 -top-[10%] h-[120%] motion-reduce:!transform-none"
        style={{ y }}
      >
        <div className="absolute inset-0 motion-safe:animate-[hero03-settle_1.6s_cubic-bezier(0.22,1,0.36,1)_both] [animation-delay:240ms]">
          <Image
            src="/our-story.jpg"
            alt={alt}
            fill
            priority
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="object-cover object-[50%_56%]"
          />
        </div>
      </motion.div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/10 dark:ring-white/10"
      />
    </div>
  );
}
