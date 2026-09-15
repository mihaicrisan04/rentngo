"use client";

import * as React from "react";
import { usePaginatedQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { formatDate, formatPrice } from "@/lib/format";
import { History } from "lucide-react";

/** Bounded page: this is a reporting view, not an export. */
const ITEMS_PER_PAGE = 20;

type HistoryRow = FunctionReturnType<
  typeof api.affiliates.getReferralHistory
>["page"][number];
type ConversionStatus = HistoryRow["status"];
type CreditState = HistoryRow["creditState"];

/** `confirmed` is the v1 status the wallet migration still reads as approved. */
const STATUS_LABEL: Record<ConversionStatus, string> = {
  pending: "Pending",
  awaitingApproval: "Awaiting approval",
  approved: "Approved",
  confirmed: "Approved",
  rejected: "Rejected",
  voided: "Voided",
};

const BADGE_VARIANT: Record<
  ConversionStatus | CreditState,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  pending: "secondary",
  awaitingApproval: "secondary",
  approved: "default",
  confirmed: "default",
  rejected: "destructive",
  voided: "outline",
  none: "default",
  outstanding: "default",
  reversed: "outline",
  consumed: "outline",
  expired: "outline",
};

/** What became of the credit outranks the conversion's own status. */
const CREDIT_STATE_LABEL: Partial<Record<CreditState, string>> = {
  consumed: "Consumed",
  expired: "Expired",
};

const FILTERS = [
  "pending",
  "awaitingApproval",
  "approved",
  "rejected",
  "voided",
] as const;

function badgeFor(row: HistoryRow) {
  const creditLabel = CREDIT_STATE_LABEL[row.creditState];
  return creditLabel
    ? { label: creditLabel, variant: BADGE_VARIANT[row.creditState] }
    : { label: STATUS_LABEL[row.status], variant: BADGE_VARIANT[row.status] };
}

export function ReferralHistoryTable() {
  const [status, setStatus] = React.useState<ConversionStatus | "all">("all");
  const {
    results: rows,
    status: paginationStatus,
    loadMore,
  } = usePaginatedQuery(
    api.affiliates.getReferralHistory,
    status === "all" ? {} : { status },
    { initialNumItems: ITEMS_PER_PAGE },
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={status}
          onValueChange={(value) =>
            setStatus(value as ConversionStatus | "all")
          }
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {FILTERS.map((value) => (
              <SelectItem key={value} value={value}>
                {STATUS_LABEL[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          &ldquo;Consumed&rdquo; means the referrer has already spent that
          credit; &ldquo;Expired&rdquo; means they no longer can.
        </p>
      </div>

      {paginationStatus === "LoadingFirstPage" ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : rows.length === 0 ? (
        <EmptyState icon={History} message="No referrals match this filter." />
      ) : (
        <Table dense>
          <TableHeader sticky>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Referrer</TableHead>
              <TableHead>Referred</TableHead>
              <TableHead>Booking</TableHead>
              <TableHead className="text-right">Booking total</TableHead>
              <TableHead className="text-right">Credit</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row._id}>
                <TableCell className="text-muted-foreground">
                  {formatDate(row.createdAt)}
                </TableCell>
                <TableCell>
                  <div>{row.referrerName}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    /r/{row.referrerSlug}
                  </div>
                </TableCell>
                <TableCell>{row.referredEmail}</TableCell>
                <TableCell>
                  <div className="capitalize">{row.bookingType}</div>
                  <div className="text-xs text-muted-foreground">
                    {row.bookingNumber === null
                      ? "deleted"
                      : `#${row.bookingNumber}`}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {row.bookingTotal === null
                    ? "—"
                    : formatPrice(row.bookingTotal)}
                </TableCell>
                <TableCell className="text-right">
                  {row.creditAmount > 0
                    ? formatPrice(row.creditAmount)
                    : row.projectedCredit > 0
                      ? `${formatPrice(row.projectedCredit)} (projected)`
                      : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={badgeFor(row).variant}>
                    {badgeFor(row).label}
                  </Badge>
                  {row.rejectionReason && (
                    <div className="text-xs text-muted-foreground">
                      {row.rejectionReason}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {paginationStatus !== "Exhausted" &&
        paginationStatus !== "LoadingFirstPage" && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => loadMore(ITEMS_PER_PAGE)}
              disabled={paginationStatus === "LoadingMore"}
            >
              {paginationStatus === "LoadingMore" ? "Loading..." : "Load more"}
            </Button>
          </div>
        )}
    </div>
  );
}
