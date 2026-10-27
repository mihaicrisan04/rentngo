import type { ComponentType } from "react";
import type { HomeHeroProps } from "@/app/[locale]/home-page-client";
import { Hero01 } from "./hero-01";
import { Hero02 } from "./hero-02";
import { Hero03 } from "./hero-03";
import { Hero04 } from "./hero-04";
import { Hero05 } from "./hero-05";
import { Hero06 } from "./hero-06";
import { Hero07 } from "./hero-07";
import { Hero08 } from "./hero-08";
import { Hero09 } from "./hero-09";
import { Hero10 } from "./hero-10";

export interface HeroVariant {
  name: string;
  Hero: ComponentType<HomeHeroProps>;
}

export const HERO_VARIANTS: readonly HeroVariant[] = [
  { name: "Split", Hero: Hero01 },
  { name: "Search first", Hero: Hero02 },
  { name: "Window", Hero: Hero03 },
  { name: "The road", Hero: Hero04 },
  { name: "Route map", Hero: Hero05 },
  { name: "Bento", Hero: Hero06 },
  { name: "Editorial", Hero: Hero07 },
  { name: "Three steps", Hero: Hero08 },
  { name: "Showroom", Hero: Hero09 },
  { name: "Fleet strip", Hero: Hero10 },
];

/** "1".."10" to a zero-based index, or null for anything else. */
export function parseHeroVariant(segment: string): number | null {
  const index = Number(segment) - 1;
  return Number.isInteger(index) && index >= 0 && index < HERO_VARIANTS.length
    ? index
    : null;
}
