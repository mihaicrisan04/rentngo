"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  available: "bg-green-100 text-green-800 border-green-200",
  rented: "bg-blue-100 text-blue-800 border-blue-200",
  maintenance: "bg-orange-100 text-orange-800 border-orange-200",
  currentSeason: "bg-green-100 text-green-800 border-green-200",
  active: "bg-blue-100 text-blue-800 border-blue-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
} as const;

export type BadgeStatus = keyof typeof STATUS_STYLES;

interface StatusBadgeProps {
  status: string;
  /** Rendered when `status` is not a known badge status. */
  fallback?: BadgeStatus;
  className?: string;
}

/** Shared colored status badge with `common.status.*` next-intl labels. */
export function StatusBadge({
  status,
  fallback = "pending",
  className,
}: StatusBadgeProps) {
  const t = useTranslations("common.status");
  const key: BadgeStatus =
    status in STATUS_STYLES ? (status as BadgeStatus) : fallback;

  return (
    <Badge variant="secondary" className={cn(STATUS_STYLES[key], className)}>
      {t(key)}
    </Badge>
  );
}
