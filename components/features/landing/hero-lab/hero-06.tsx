"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MessageCircle, Star } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { useLocale, useTranslations } from "next-intl";

import type { HomeHeroProps } from "@/app/[locale]/home-page-client";
import { useTrustItems } from "@/hooks/use-trust-items";
import { GOOGLE_RATING, GOOGLE_REVIEWS_URL } from "@/lib/google-reviews";
import { carsPath } from "@/lib/localized-routes";
import { cn } from "@/lib/utils";
import { CompactSearchBar } from "./compact-search-bar";
import { useLowestFromPrice } from "./use-lowest-from-price";

const COPY = {
  ro: {
    eyebrow: "Cluj-Napoca · Aeroport Cluj",
    searchTitle: "Unde și când ai nevoie de mașină?",
    fleetLabel: "Flota noastră",
    carAlt: "Mercedes-Benz E-Class coupé alb din flota RentNGo",
    priceNote: "Fără taxe ascunse",
    ownerEyebrow: "Proprietar",
    ownerTitle: "Vorbești direct cu Tudor",
    ownerBody:
      "Fără call-center: totul se stabilește cu proprietarul. Clienții îl pomenesc pe nume în recenzii.",
    ownerAlt: "Tudor, proprietarul RentNGo, lângă o mașină din flotă",
  },
  en: {
    eyebrow: "Cluj-Napoca · Cluj Airport",
    searchTitle: "Where and when do you need a car?",
    fleetLabel: "Our fleet",
    carAlt: "White Mercedes-Benz E-Class coupé from the RentNGo fleet",
    priceNote: "No hidden fees",
    ownerEyebrow: "Owner",
    ownerTitle: "Talk directly to Tudor",
    ownerBody:
      "No call centre: you arrange everything with the owner. Customers mention him by name in their reviews.",
    ownerAlt: "Tudor, the owner of RentNGo, next to a car from the fleet",
  },
} as const;

const EASE = [0.22, 1, 0.36, 1] as const;

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const tileVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE },
  },
};

const TILE_SURFACE =
  "relative overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/[0.035] dark:bg-white/[0.04]";
const TILE_HOVER =
  "transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-black/10";

interface TileProps {
  className?: string;
  children: ReactNode;
}

function Tile({ className, children }: TileProps) {
  return (
    <motion.div variants={tileVariants} className={cn(TILE_SURFACE, className)}>
      {children}
    </motion.div>
  );
}

function formatScore(score: number, locale: string) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 1 }).format(
    score,
  );
}

export function Hero06({
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
  const reduceMotion = useReducedMotion();

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-3 pb-10 md:px-6 lg:pt-4 lg:pb-[4.5rem]">
      <motion.div
        variants={gridVariants}
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        className="grid grid-cols-2 gap-3 lg:min-h-[max(44rem,calc(100svh-9rem))] lg:grid-cols-12"
      >
        <div className="contents lg:col-span-5 lg:flex lg:flex-col lg:gap-3">
          <Tile className="col-span-2 flex flex-col p-6 md:p-8 lg:flex-1">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary/15 blur-3xl"
            />
            <p className="relative flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              <span className="size-1.5 rounded-full bg-primary" />
              {copy.eyebrow}
            </p>
            <h1 className="relative mt-4 text-[2.6rem] leading-[1.02] font-bold tracking-tight text-balance text-foreground md:text-5xl">
              {t("title")}
            </h1>
            <p className="relative mt-auto max-w-md pt-4 text-[15px] leading-relaxed text-muted-foreground">
              {t("subtitle")}
            </p>
          </Tile>

          <Tile className="col-span-2 p-5 md:p-6">
            <h2 className="mb-2 font-heading text-base font-semibold tracking-tight text-foreground">
              {copy.searchTitle}
            </h2>
            <CompactSearchBar
              layout="stack"
              searchState={searchState}
              updateSearchField={updateSearchField}
              className="rounded-none border-0 bg-transparent p-0 shadow-none md:p-0"
            />
          </Tile>
        </div>

        <div className="contents lg:col-span-7 lg:grid lg:grid-cols-[1.45fr_1fr_1fr] lg:grid-rows-[1fr_auto_auto_auto] lg:gap-3">
          <Tile
            className={cn(
              "group col-span-2 aspect-[2/1] border-white/10 bg-black lg:col-span-3 lg:aspect-auto dark:bg-black",
              TILE_HOVER,
            )}
          >
            <Link href={carsPath(locale)} className="absolute inset-0">
              <Image
                src="/mercedes-background.png"
                alt={copy.carAlt}
                fill
                priority
                sizes="(min-width: 1280px) 740px, (min-width: 1024px) 58vw, 100vw"
                className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <span className="absolute top-4 left-4 text-[11px] font-semibold tracking-[0.18em] text-white/60 uppercase md:top-5 md:left-5">
                {copy.fleetLabel}
              </span>
              <span className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white backdrop-blur-md transition-colors group-hover:border-primary/60 group-hover:bg-primary group-hover:text-neutral-950 md:right-5 md:bottom-5">
                {t("viewAllCars")}
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
          </Tile>

          <Tile
            className={cn(
              "group order-last col-span-2 grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:order-none lg:col-span-1 lg:col-start-1 lg:row-span-3 lg:row-start-2 lg:flex lg:flex-col",
              TILE_HOVER,
            )}
          >
            <div className="relative min-h-44 overflow-hidden lg:min-h-0 lg:flex-1">
              <Image
                src="/tudor.jpg"
                alt={copy.ownerAlt}
                fill
                sizes="(min-width: 1024px) 300px, 40vw"
                className="origin-[50%_30%] scale-[1.3] object-cover object-[50%_24%] transition-transform duration-700 ease-out group-hover:scale-[1.36]"
              />
            </div>
            <div className="flex flex-col justify-center p-4 xl:p-5">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] text-[var(--brand-green)] uppercase dark:text-emerald-300/90">
                <MessageCircle className="size-3.5" />
                {copy.ownerEyebrow}
              </span>
              <p className="mt-1.5 font-heading text-lg leading-tight font-semibold text-foreground">
                {copy.ownerTitle}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                {copy.ownerBody}
              </p>
            </div>
          </Tile>

          <Tile className={cn("col-span-1 border-primary/40", TILE_HOVER)}>
            <Link
              href={carsPath(locale)}
              className="group flex h-full flex-col justify-between gap-3 bg-primary p-4 text-neutral-950 transition-colors hover:bg-primary/90"
            >
              <span className="flex items-start justify-between text-xs font-semibold tracking-wide uppercase">
                {tCard("fromPrice")}
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span>
                <span className="block font-heading text-3xl leading-none font-bold tabular-nums">
                  {lowestPrice === null ? (
                    <span className="inline-block h-[1em] w-16 animate-pulse rounded-md bg-neutral-950/15 align-bottom" />
                  ) : (
                    <>
                      {lowestPrice} €
                      <span className="ml-1 text-base font-semibold">
                        {tCard("perDay")}
                      </span>
                    </>
                  )}
                </span>
                <span className="mt-1.5 block text-xs font-medium text-neutral-950/75">
                  {copy.priceNote}
                </span>
              </span>
            </Link>
          </Tile>

          <Tile className={cn("col-span-1", TILE_HOVER)}>
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col justify-between gap-3 p-4"
            >
              <span className="flex items-start justify-between">
                <span className="flex gap-0.5" aria-hidden>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className="size-3.5 fill-primary text-primary"
                    />
                  ))}
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
              </span>
              <span>
                <span className="block font-heading text-3xl leading-none font-bold text-foreground tabular-nums">
                  {formatScore(GOOGLE_RATING.score, locale)}
                </span>
                <span className="mt-1.5 block text-xs text-muted-foreground">
                  {tTrust("ratingDesc", { count: GOOGLE_RATING.reviewCount })} ·
                  Google
                </span>
              </span>
            </a>
          </Tile>

          {trustItems.map((item) => (
            <Tile
              key={item.label}
              className={cn(
                "group col-span-1 flex flex-col justify-between gap-3 p-4",
                TILE_HOVER,
              )}
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-neutral-950">
                <item.icon className="size-[18px]" />
              </span>
              <span>
                <span className="block text-sm leading-tight font-semibold text-foreground">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {item.value}
                </span>
              </span>
            </Tile>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
