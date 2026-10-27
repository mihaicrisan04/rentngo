"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { HERO_VARIANTS } from "./variants";

interface HeroLabSwitcherProps {
  index: number;
}

/** Floating picker between hero variants; ← and → step through them. */
export function HeroLabSwitcher({ index }: HeroLabSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const hrefFor = (i: number) => `/${locale}/${i + 1}`;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [role=dialog]")) return;
      const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
      if (!step) return;
      const next = (index + step + HERO_VARIANTS.length) % HERO_VARIANTS.length;
      router.push(hrefFor(next), { scroll: false });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <nav
      aria-label="Hero variants"
      className="fixed bottom-4 left-1/2 z-[60] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full border border-border/60 bg-background/85 p-1.5 shadow-2xl backdrop-blur-xl"
    >
      <span className="hidden whitespace-nowrap px-3 text-xs font-medium text-muted-foreground sm:inline">
        {HERO_VARIANTS[index].name}
      </span>
      {HERO_VARIANTS.map((variant, i) => (
        <Link
          key={variant.name}
          href={hrefFor(i)}
          scroll={false}
          title={variant.name}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors",
            i === index
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {i + 1}
        </Link>
      ))}
    </nav>
  );
}
