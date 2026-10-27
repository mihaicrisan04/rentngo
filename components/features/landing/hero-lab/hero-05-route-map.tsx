"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useLocale } from "next-intl";

const COPY = {
  ro: {
    city: "Cluj-Napoca",
    centre: "Centru",
    river: "Someș",
    airport: "Aeroport Cluj",
    pickupHere: "Preluare aici",
    caption: "Mașina te așteaptă la terminal",
    mapLabel:
      "Hartă stilizată: traseul de la Aeroportul Cluj (CLJ) spre centrul Clujului",
  },
  en: {
    city: "Cluj-Napoca",
    centre: "City centre",
    river: "Someș",
    airport: "Cluj Airport",
    pickupHere: "Pickup here",
    caption: "Your car waits at the terminal",
    mapLabel: "Stylized map: the route from Cluj Airport (CLJ) to central Cluj",
  },
} as const;

const VIEW_W = 640;
const VIEW_H = 480;

const AIRPORT = { x: 478, y: 300 };
const CENTRE = { x: 150, y: 268 };

const ROUTE =
  "M478 300 C 452 306, 430 322, 398 318 S 340 290, 304 294 S 236 302, 204 288 S 166 270, 150 268";

const RIVER =
  "M-10 196 C 60 186, 110 222, 176 208 S 278 166, 340 178 S 440 222, 500 214 S 600 180, 650 192";

const RAILWAY = "M-10 236 C 120 230, 210 238, 300 230 S 470 250, 650 246";

const ARTERIES = [
  "M150 268 L 40 420",
  "M150 268 L 20 300",
  "M150 268 L 110 40",
  "M150 268 C 220 340, 300 400, 360 490",
];

const DRAW_SECONDS = 1.6;
const DRAW_DELAY = 0.35;
const LOOP_BEGIN = `${DRAW_DELAY + DRAW_SECONDS + 0.2}s`;

function percent(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

function MapLabel({
  x,
  y,
  children,
  className = "",
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`absolute -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-[11px] ${className}`}
      style={{ left: percent(x, VIEW_W), top: percent(y, VIEW_H) }}
    >
      {children}
    </span>
  );
}

export function Hero05RouteMap() {
  const locale = useLocale();
  const copy = COPY[locale === "en" ? "en" : "ro"];
  const reduceMotion = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const routeId = `hero05-route-${uid}`;
  const fadeId = `hero05-fade-${uid}`;
  const maskId = `hero05-mask-${uid}`;
  const glowId = `hero05-glow-${uid}`;

  return (
    <figure className="relative">
      <span className="sr-only">{copy.mapLabel}</span>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border/70 bg-muted/40 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.45)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_55%)]"
        />
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <defs>
            <radialGradient id={fadeId} cx="0.3" cy="0.55" r="0.75">
              <stop offset="0" stopColor="white" stopOpacity="1" />
              <stop offset="0.7" stopColor="white" stopOpacity="0.5" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id={maskId}>
              <rect width={VIEW_W} height={VIEW_H} fill={`url(#${fadeId})`} />
            </mask>
            <filter id={glowId} x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          <g mask={`url(#${maskId})`}>
            <g
              className="stroke-foreground/[0.09]"
              strokeWidth="1"
              transform={`rotate(-14 ${CENTRE.x} ${CENTRE.y})`}
            >
              {Array.from({ length: 15 }, (_, i) => (
                <line
                  key={`v${i}`}
                  x1={-40 + i * 34}
                  y1="-40"
                  x2={-40 + i * 34}
                  y2="520"
                />
              ))}
              {Array.from({ length: 15 }, (_, i) => (
                <line
                  key={`h${i}`}
                  x1="-40"
                  y1={-30 + i * 36}
                  x2="520"
                  y2={-30 + i * 36}
                />
              ))}
            </g>
            <g className="stroke-foreground/[0.16]" strokeWidth="2">
              {ARTERIES.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
          </g>

          <path
            d={RAILWAY}
            className="stroke-foreground/[0.12]"
            strokeWidth="1.5"
            strokeDasharray="2 6"
          />

          <path
            d={RIVER}
            className="stroke-[var(--brand-green)] opacity-40 dark:opacity-60"
            strokeWidth="7"
          />
          <path d={RIVER} className="stroke-background/60" strokeWidth="1.2" />

          <g transform={`rotate(-8 ${AIRPORT.x + 30} ${AIRPORT.y - 30})`}>
            <line
              x1={AIRPORT.x - 30}
              y1={AIRPORT.y - 32}
              x2={AIRPORT.x + 100}
              y2={AIRPORT.y - 32}
              className="stroke-foreground/[0.14]"
              strokeWidth="11"
            />
            <line
              x1={AIRPORT.x - 24}
              y1={AIRPORT.y - 32}
              x2={AIRPORT.x + 94}
              y2={AIRPORT.y - 32}
              className="stroke-background/70"
              strokeWidth="1"
              strokeDasharray="6 6"
            />
          </g>

          <path d={ROUTE} className="stroke-primary/20" strokeWidth="9" />
          <motion.path
            id={routeId}
            d={ROUTE}
            className="stroke-primary"
            strokeWidth="3.5"
            initial={reduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: DRAW_SECONDS,
              delay: DRAW_DELAY,
              ease: [0.65, 0, 0.35, 1],
            }}
          />

          <g>
            <circle
              cx={CENTRE.x}
              cy={CENTRE.y}
              r="9"
              className="fill-background stroke-foreground/60"
              strokeWidth="2"
            />
            <circle
              cx={CENTRE.x}
              cy={CENTRE.y}
              r="3"
              className="fill-foreground/70"
            />
          </g>

          {!reduceMotion && (
            <g>
              <circle
                r="9"
                className="fill-primary"
                filter={`url(#${glowId})`}
                opacity="0"
              >
                <animateMotion
                  dur="4.2s"
                  begin={LOOP_BEGIN}
                  repeatCount="indefinite"
                  calcMode="spline"
                  keyTimes="0;1"
                  keySplines="0.45 0 0.55 1"
                >
                  <mpath href={`#${routeId}`} />
                </animateMotion>
                <animate
                  attributeName="opacity"
                  values="0;0.9;0.9;0"
                  keyTimes="0;0.12;0.85;1"
                  dur="4.2s"
                  begin={LOOP_BEGIN}
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                r="4"
                className="fill-primary stroke-background"
                strokeWidth="1.5"
                opacity="0"
              >
                <animateMotion
                  dur="4.2s"
                  begin={LOOP_BEGIN}
                  repeatCount="indefinite"
                  calcMode="spline"
                  keyTimes="0;1"
                  keySplines="0.45 0 0.55 1"
                >
                  <mpath href={`#${routeId}`} />
                </animateMotion>
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  keyTimes="0;0.12;0.85;1"
                  dur="4.2s"
                  begin={LOOP_BEGIN}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          )}

          <g>
            {!reduceMotion && (
              <motion.circle
                cx={AIRPORT.x}
                cy={AIRPORT.y}
                r="10"
                className="fill-primary/40"
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
                initial={{ scale: 1, opacity: 0.7 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.2,
                }}
              />
            )}
            <circle
              cx={AIRPORT.x}
              cy={AIRPORT.y}
              r="10"
              className="fill-primary stroke-background"
              strokeWidth="3"
            />
            <circle
              cx={AIRPORT.x}
              cy={AIRPORT.y}
              r="3.5"
              className="fill-background"
            />
          </g>
        </svg>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 text-muted-foreground"
        >
          <MapLabel
            x={CENTRE.x}
            y={CENTRE.y + 18}
            className="text-foreground/80"
          >
            {copy.centre}
          </MapLabel>
          <MapLabel
            x={250}
            y={142}
            className="font-medium italic normal-case tracking-[0.08em] text-[var(--brand-green)] dark:text-foreground/50"
          >
            {copy.river}
          </MapLabel>
          <MapLabel
            x={AIRPORT.x + 10}
            y={AIRPORT.y + 20}
            className="text-foreground/80"
          >
            {copy.airport}
            <span className="ml-1.5 text-amber-700 dark:text-primary">CLJ</span>
          </MapLabel>
          <span
            className="absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-black shadow-lg shadow-primary/20 sm:text-[11px]"
            style={{
              left: percent(AIRPORT.x, VIEW_W),
              top: percent(AIRPORT.y - 22, VIEW_H),
            }}
          >
            {copy.pickupHere}
          </span>
          <span className="absolute left-5 top-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-foreground/70 sm:left-6 sm:top-6 sm:text-xs">
            {copy.city}
          </span>
          <span className="absolute right-5 top-5 flex flex-col items-center gap-0.5 text-[10px] font-semibold text-foreground/50 sm:right-6 sm:top-6">
            <span className="h-3 w-px bg-foreground/40" />N
          </span>
        </div>
      </div>
      <figcaption className="mt-3 hidden items-center sm:flex gap-2 px-1 text-sm text-muted-foreground">
        <span className="h-px w-6 bg-primary" />
        {copy.caption}
      </figcaption>
    </figure>
  );
}
