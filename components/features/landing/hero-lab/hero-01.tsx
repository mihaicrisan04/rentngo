"use client";

import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type { HomeHeroProps } from "@/app/[locale]/home-page-client";
import { useTrustItems } from "@/hooks/use-trust-items";
import { GOOGLE_RATING, GOOGLE_REVIEWS_URL } from "@/lib/google-reviews";
import { cn } from "@/lib/utils";
import { CompactSearchBar } from "./compact-search-bar";
import { useLowestFromPrice } from "./use-lowest-from-price";

const COPY = {
  ro: {
    eyebrow: "Cluj-Napoca · Aeroport",
    imageAlt: "Mercedes-Benz alb din flota RentNGo",
  },
  en: {
    eyebrow: "Cluj-Napoca · Airport",
    imageAlt: "White Mercedes-Benz from the RentNGo fleet",
  },
} as const;

const KEYFRAMES = `
@keyframes hero01-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes hero01-stage { from { opacity: 0; transform: scale(0.985); } to { opacity: 1; transform: none; } }
@keyframes hero01-car { from { opacity: 0; transform: translateY(18px) scale(0.97); filter: blur(6px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes hero01-pop { from { opacity: 0; transform: translateY(8px) scale(0.94); } to { opacity: 1; transform: none; } }
`;

const rise =
  "motion-safe:animate-[hero01-rise_0.7s_cubic-bezier(0.22,1,0.36,1)_both]";
const pop =
  "motion-safe:animate-[hero01-pop_0.6s_cubic-bezier(0.22,1,0.36,1)_both]";

export function Hero01({
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

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-6 pb-14 md:px-6 md:pt-8 lg:px-8 lg:pb-20">
      <style>{KEYFRAMES}</style>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:grid-rows-[1fr_auto_1fr] lg:gap-x-14 lg:gap-y-7">
        <div className="lg:self-end">
          <p
            className={cn(
              "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary",
              rise,
            )}
          >
            <MapPin className="size-3.5" aria-hidden />
            {copy.eyebrow}
          </p>
          <h1
            className={cn(
              "mt-4 text-balance text-4xl font-bold leading-[1.04] tracking-tight sm:text-5xl xl:text-[3.5rem]",
              rise,
              "[animation-delay:70ms]",
            )}
          >
            {t("title")}
          </h1>
          <p
            className={cn(
              "mt-3 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg",
              rise,
              "[animation-delay:140ms]",
            )}
          >
            {t("subtitle")}
          </p>
        </div>

        <div className={cn("lg:max-w-xl", rise, "[animation-delay:220ms]")}>
          <CompactSearchBar
            layout="stack"
            searchState={searchState}
            updateSearchField={updateSearchField}
            className="shadow-2xl shadow-black/10 dark:shadow-black/40"
          />
        </div>

        <div
          className={cn(
            "relative isolate h-64 overflow-hidden rounded-3xl bg-black ring-1 ring-white/10 sm:h-80",
            "lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:h-[clamp(560px,calc(100svh-8rem),760px)]",
            "motion-safe:animate-[hero01-stage_0.9s_cubic-bezier(0.22,1,0.36,1)_both] [animation-delay:120ms]",
          )}
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_38%_70%_at_50%_-8%,rgb(255_255_255/0.16),transparent_70%),radial-gradient(ellipse_70%_40%_at_50%_92%,rgb(226_182_74/0.12),transparent_70%)]"
          />
          <div
            aria-hidden
            className="grain-overlay pointer-events-none absolute inset-0 opacity-40"
          />

          <div
            className={cn(
              "absolute bottom-[-4%] left-1/2 aspect-[2048/1054] w-[125%] -translate-x-1/2 mix-blend-screen",
              "sm:w-[100%] lg:bottom-[6%] lg:w-[160%]",
              "[mask-image:radial-gradient(ellipse_60%_55%_at_50%_45%,black_66%,transparent_100%)]",
            )}
          >
            <div className="absolute inset-0 motion-safe:animate-[hero01-car_1.1s_cubic-bezier(0.22,1,0.36,1)_both] [animation-delay:320ms]">
              <Image
                src="/mercedes-background.png"
                alt={copy.imageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 70vw, 140vw"
                className="object-contain"
              />
            </div>
          </div>

          {lowestPrice !== null && (
            <div
              className={cn(
                "absolute top-4 left-4 flex items-baseline gap-1.5 rounded-full bg-gradient-to-br from-[#F6D77A] via-[#E2B64A] to-[#B8902B] px-4 py-2 text-stone-950 shadow-lg shadow-black/40 ring-1 ring-inset ring-white/35 lg:top-6 lg:left-6",
                pop,
                "[animation-delay:650ms]",
              )}
            >
              <span className="text-xs font-semibold">
                {tCard("fromPrice")}
              </span>
              <span className="font-heading text-lg leading-none font-bold tabular-nums">
                {Math.round(lowestPrice)} €
              </span>
              <span className="text-xs font-semibold opacity-80">
                {tCard("perDay")}
              </span>
            </div>
          )}

          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "absolute top-4 right-4 flex items-center gap-2.5 rounded-full bg-white/10 py-2 pr-4 pl-3 text-white ring-1 ring-white/15 backdrop-blur-md transition-colors hover:bg-white/20 lg:top-auto lg:right-6 lg:bottom-6",
              pop,
              "[animation-delay:780ms]",
            )}
          >
            <span className="flex text-primary" aria-hidden>
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-3.5 fill-current",
                    i > 0 && "max-sm:hidden",
                  )}
                />
              ))}
            </span>
            <span className="text-sm font-semibold">
              {tTrust("rating", { score: GOOGLE_RATING.score })}
            </span>
            <span className="hidden text-xs text-white/70 sm:inline">
              {tTrust("ratingDesc", { count: GOOGLE_RATING.reviewCount })}
            </span>
          </a>
        </div>

        <ul
          className={cn(
            "grid grid-cols-2 gap-x-6 gap-y-4 lg:max-w-xl lg:self-start",
            rise,
            "[animation-delay:300ms]",
          )}
        >
          {trustItems.map(({ icon: Icon, label, value }) => (
            <li key={label} className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <Icon className="size-[18px]" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm leading-tight font-semibold">
                  {label}
                </span>
                <span className="block text-xs leading-tight text-muted-foreground">
                  {value}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
