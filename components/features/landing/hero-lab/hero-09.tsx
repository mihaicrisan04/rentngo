"use client";

import { useRef } from "react";
import Image from "next/image";
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

const COPY = {
  ro: {
    eyebrow: "Rent'nGo · Cluj-Napoca",
    subtitle:
      "Prețuri corecte, fără costuri ascunse. Mașina te așteaptă chiar la Aeroport Cluj.",
    carAlt: "Mercedes-Benz E-Class Coupé alb din flota Rent'nGo",
  },
  en: {
    eyebrow: "Rent'nGo · Cluj-Napoca",
    subtitle:
      "Fair prices, no hidden fees. Your car waits right at Cluj Airport.",
    carAlt: "White Mercedes-Benz E-Class Coupé from the Rent'nGo fleet",
  },
} as const;

const IMAGE_W = 2048;
const IMAGE_H = 1054;

/** Front-view outline of the E-Class in the photo, in image pixels. */
const SILHOUETTE =
  "M512 868 L506 640 C 506 560, 530 510, 574 470 L 600 440 C 640 400, 690 360, 720 320 L 790 222 C 806 204, 830 198, 860 198 L 1190 198 C 1220 198, 1244 204, 1258 222 L 1328 320 C 1358 360, 1408 400, 1448 440 L 1474 470 C 1518 510, 1542 560, 1542 640 L 1536 868";
const HORIZON = `M0 872 L ${IMAGE_W} 872`;

const EASE = [0.22, 1, 0.36, 1] as const;
const TRACE_SECONDS = 1.5;
const LIGHTS_ON_DELAY = 1.1;

export function Hero09({ searchState, updateSearchField }: HomeHeroProps) {
  const t = useTranslations("homepage");
  const locale = useLocale();
  const copy = COPY[locale === "en" ? "en" : "ro"];
  const trustItems = useTrustItems();
  const reduceMotion = useReducedMotion();

  const stageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end start"],
  });
  const carScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const stageDim = useTransform(scrollYProgress, [0, 1], [0, 0.55]);

  return (
    <section className="w-full px-3 pb-12 pt-3 sm:px-6 md:pt-5 lg:px-8 lg:pb-16">
      <div
        ref={stageRef}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#050505] text-white ring-1 ring-white/5"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_55%_60%_at_50%_0%,rgba(255,255,255,0.09),transparent_70%)]"
        />

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative z-10 px-6 pt-10 text-center sm:pt-12 lg:pt-14"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary sm:text-xs">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-white/65 sm:text-base">
            {copy.subtitle}
          </p>
        </motion.div>

        <motion.div
          style={
            reduceMotion
              ? undefined
              : { scale: carScale, transformOrigin: "50% 100%" }
          }
          className="relative mx-auto -mt-4 w-full max-w-[820px] pb-16 sm:-mt-8 lg:-mt-10"
        >
          <div
            className="relative -ml-[22%] w-[144%] max-w-none sm:ml-0 sm:w-full"
            style={{ aspectRatio: `${IMAGE_W} / ${IMAGE_H}` }}
          >
            <motion.div
              className="absolute inset-0 [mask-image:radial-gradient(closest-side,black_62%,transparent_100%)]"
              initial={
                reduceMotion ? false : { opacity: 0, filter: "brightness(0.2)" }
              }
              animate={{ opacity: 1, filter: "brightness(1)" }}
              transition={{
                duration: 1.3,
                delay: LIGHTS_ON_DELAY,
                ease: "easeOut",
              }}
            >
              <Image
                src="/mercedes-background.png"
                alt={copy.carAlt}
                fill
                preload
                sizes="(min-width: 1024px) 920px, 100vw"
                className="object-contain"
              />
            </motion.div>

            <svg
              aria-hidden="true"
              viewBox={`0 0 ${IMAGE_W} ${IMAGE_H}`}
              className="pointer-events-none absolute inset-0 h-full w-full"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="hero09-horizon" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="var(--primary)" stopOpacity="0" />
                  <stop
                    offset="0.5"
                    stopColor="var(--primary)"
                    stopOpacity="1"
                  />
                  <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {!reduceMotion && (
                <motion.path
                  d={SILHOUETTE}
                  stroke="var(--primary)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  style={{ filter: "drop-shadow(0 0 6px var(--primary))" }}
                  initial={{ pathLength: 0, opacity: 1 }}
                  animate={{ pathLength: 1, opacity: [1, 1, 0] }}
                  transition={{
                    pathLength: {
                      duration: TRACE_SECONDS,
                      ease: [0.65, 0, 0.35, 1],
                    },
                    opacity: {
                      duration: TRACE_SECONDS + 1.4,
                      times: [0, 0.6, 1],
                    },
                  }}
                />
              )}
              <motion.path
                d={HORIZON}
                stroke="url(#hero09-horizon)"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
                initial={reduceMotion ? false : { pathLength: 0, opacity: 0.9 }}
                animate={{ pathLength: 1, opacity: 0.55 }}
                transition={{
                  duration: TRACE_SECONDS,
                  ease: [0.65, 0, 0.35, 1],
                }}
              />
            </svg>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[18%] bottom-[12%] h-[10%] rounded-[100%] bg-white/10 blur-2xl"
            />
          </div>
        </motion.div>

        <motion.div
          aria-hidden="true"
          style={reduceMotion ? undefined : { opacity: stageDim }}
          className="pointer-events-none absolute inset-0 bg-black opacity-0"
        />
      </div>

      <div className="relative z-10 mx-auto -mt-12 max-w-6xl px-2 sm:-mt-16 sm:px-4">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
        >
          <CompactSearchBar
            layout="row"
            searchState={searchState}
            updateSearchField={updateSearchField}
            className="shadow-2xl shadow-black/25"
          />
        </motion.div>

        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {trustItems.map(({ icon: Icon, label, value }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon
                className="h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>
                <span className="font-medium text-foreground">{label}</span>
                <span className="hidden sm:inline"> · {value}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
