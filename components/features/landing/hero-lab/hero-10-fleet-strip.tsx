"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CarFront } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type { HomeHeroProps } from "@/app/[locale]/home-page-client";
import { useDateBasedSeasonalPricing } from "@/hooks/use-date-based-seasonal-pricing";
import { carsPath } from "@/lib/localized-routes";
import { getLongestTierPricePerDayWithSeason } from "@/lib/pricing";

type FleetVehicle = HomeHeroProps["vehicles"][number];

const MIN_CARDS_PER_LOOP = 8;
const SECONDS_PER_CARD = 4.5;

interface FleetCardProps {
  vehicle: FleetVehicle;
  pricePerDay: number | null;
  isDuplicate: boolean;
}

function FleetCard({ vehicle, pricePerDay, isDuplicate }: FleetCardProps) {
  const locale = useLocale();
  const t = useTranslations("vehicleCard");
  const name = `${vehicle.make} ${vehicle.model}`;

  return (
    <li
      aria-hidden={isDuplicate || undefined}
      className="w-56 shrink-0 sm:w-64"
    >
      <Link
        href={carsPath(locale, vehicle.slug || vehicle._id)}
        tabIndex={isDuplicate ? -1 : undefined}
        className="group/card block rounded-2xl border border-border/60 bg-card p-2 shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
          {vehicle.imageUrl ? (
            <Image
              src={vehicle.imageUrl}
              alt={name}
              fill
              sizes="256px"
              className="object-cover transition-transform duration-500 group-hover/card:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <CarFront className="size-8" aria-hidden />
            </div>
          )}
        </div>
        <div className="flex items-end justify-between gap-3 px-1.5 pb-1 pt-2.5">
          <p className="min-w-0 truncate font-heading text-sm font-semibold sm:text-base">
            {name}
          </p>
          <p className="shrink-0 text-xs text-muted-foreground">
            {pricePerDay !== null ? (
              <>
                {t("fromPrice")}{" "}
                <span className="font-heading text-base font-semibold text-foreground">
                  {pricePerDay} €
                </span>
                {t("perDay")}
              </>
            ) : (
              <span className="invisible">—</span>
            )}
          </p>
        </div>
      </Link>
    </li>
  );
}

interface Hero10FleetStripProps {
  vehicles: FleetVehicle[];
  title: string;
}

/** Endless, hover-pausable strip of the fleet with "from" prices. */
export function Hero10FleetStrip({ vehicles, title }: Hero10FleetStripProps) {
  const locale = useLocale();
  const t = useTranslations("homepage");
  const { multiplier, isLoading } = useDateBasedSeasonalPricing();

  if (vehicles.length === 0) return null;

  const repeats = Math.ceil(MIN_CARDS_PER_LOOP / vehicles.length);
  const loop = Array.from({ length: repeats }, () => vehicles).flat();
  const track = [...loop, ...loop];
  const priceOf = (vehicle: FleetVehicle) =>
    isLoading ? null : getLongestTierPricePerDayWithSeason(vehicle, multiplier);

  return (
    <div className="w-full">
      <div className="mx-auto mb-4 flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </p>
        <Link
          href={carsPath(locale)}
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("viewAllCars")}
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>

      <div className="group relative overflow-hidden motion-reduce:overflow-x-auto [--gap:1rem]">
        <ul
          className="flex w-max animate-marquee py-2 [gap:var(--gap)] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none"
          style={
            {
              "--duration": `${loop.length * SECONDS_PER_CARD}s`,
            } as CSSProperties
          }
        >
          {track.map((vehicle, index) => (
            <FleetCard
              key={`${vehicle._id}-${index}`}
              vehicle={vehicle}
              pricePerDay={priceOf(vehicle)}
              isDuplicate={index >= vehicles.length}
            />
          ))}
        </ul>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background sm:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background sm:w-40" />
      </div>
    </div>
  );
}
