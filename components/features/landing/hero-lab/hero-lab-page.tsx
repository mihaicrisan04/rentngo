"use client";

import { HomePageClient } from "@/app/[locale]/home-page-client";
import { HeroLabSwitcher } from "./hero-lab-switcher";
import { HERO_VARIANTS } from "./variants";

type HomePageClientProps = Parameters<typeof HomePageClient>[0];

interface HeroLabPageProps {
  index: number;
  initialVehicles: HomePageClientProps["initialVehicles"];
}

export function HeroLabPage({ index, initialVehicles }: HeroLabPageProps) {
  const { Hero } = HERO_VARIANTS[index];

  return (
    <>
      <HomePageClient
        initialVehicles={initialVehicles}
        hero={(props) => <Hero {...props} />}
      />
      <HeroLabSwitcher index={index} />
    </>
  );
}
