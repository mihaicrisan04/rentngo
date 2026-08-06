"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { CalendarClock, LucideIcon } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { getDayLabel, getUpcomingWindow } from "@/lib/admin-overview";

const PANEL_LIMIT = 5;

interface OverviewItem {
  id: string;
  kind: "reservation" | "transfer";
  bookingNumber?: number;
  customerName: string;
  vehicleLabel: string | null;
  status: string;
  timestamp: number;
  time?: string;
  event?: "pickup" | "return";
}

function itemHref(item: OverviewItem): string {
  return item.kind === "reservation"
    ? "/admin/reservations"
    : "/admin/transfers";
}

interface PanelProps {
  title: string;
  icon: LucideIcon;
  href: string;
  items: OverviewItem[] | undefined;
  emptyMessage: string;
  renderMeta: (item: OverviewItem) => string;
}

function Panel({
  title,
  icon: Icon,
  href,
  items,
  emptyMessage,
  renderMeta,
}: PanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {title}
          </span>
          <Link
            href={href}
            className="text-xs font-normal text-muted-foreground hover:text-foreground"
          >
            View all
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items === undefined ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={Icon} message={emptyMessage} className="py-6" />
        ) : (
          <ul className="divide-y">
            {items.map((item) => (
              <li key={`${item.kind}-${item.id}`}>
                <Link
                  href={itemHref(item)}
                  className="flex items-center justify-between gap-3 py-2 text-sm hover:bg-muted/50"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {item.customerName}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.vehicleLabel ?? "Vehicle removed"} ·{" "}
                      {renderMeta(item)}
                    </span>
                  </span>
                  <StatusBadge status={item.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

interface NeedsAttentionRowProps {
  /** Client clock from `usePeriodicNow`; null until hydration. */
  now: number | null;
}

export function NeedsAttentionRow({ now }: NeedsAttentionRowProps) {
  const upcomingWindow = now === null ? null : getUpcomingWindow(now);
  const schedule = useQuery(
    api.overview.getUpcomingSchedule,
    upcomingWindow === null
      ? "skip"
      : { ...upcomingWindow, limit: PANEL_LIMIT },
  );
  return (
    <Panel
      title="Next 48 hours"
      icon={CalendarClock}
      href="/admin/reservations"
      items={schedule}
      emptyMessage="Nothing scheduled"
      renderMeta={(item) => {
        const day = now === null ? "" : getDayLabel(item.timestamp, now);
        const label = item.event === "return" ? "Return" : "Pickup";
        return [label, day, item.time].filter(Boolean).join(" ");
      }}
    />
  );
}
