import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cacheLife } from "next/cache";
import { api } from "@/convex/_generated/api";
import { fetchStaticQuery } from "@/lib/convex-static";
import { pickHomepageVehicles } from "@/lib/homepage-vehicles";
import { HeroLabPage } from "@/components/features/landing/hero-lab/hero-lab-page";
import {
  HERO_VARIANTS,
  parseHeroVariant,
} from "@/components/features/landing/hero-lab/variants";

interface HeroLabRouteProps {
  params: Promise<{ locale: string; variant: string }>;
}

export const metadata: Metadata = {
  title: "Hero lab",
  robots: { index: false, follow: false },
};

// Throwaway design lab: a blocking render is fine here.
export const instant = false;

export function generateStaticParams() {
  return HERO_VARIANTS.map((_, i) => ({ variant: String(i + 1) }));
}

async function loadHomepageVehicles() {
  "use cache";
  cacheLife("minutes");
  const featuredVehicles = await fetchStaticQuery(
    api.featuredCars.getFeaturedVehicles,
  );
  const allVehicles =
    featuredVehicles.length > 0
      ? []
      : await fetchStaticQuery(api.vehicles.getAllVehiclesWithClasses, {});
  return pickHomepageVehicles(featuredVehicles, allVehicles);
}

export default async function HeroLabRoute({ params }: HeroLabRouteProps) {
  const { variant } = await params;
  const index = parseHeroVariant(variant);
  if (index === null) notFound();

  return (
    <HeroLabPage index={index} initialVehicles={await loadHomepageVehicles()} />
  );
}
