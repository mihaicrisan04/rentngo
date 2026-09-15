"use client";

import * as React from "react";
import { usePaginatedQuery } from "convex/react";
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
import { formatPrice } from "@/lib/format";
import { History } from "lucide-react";

const ITEMS_PER_PAGE = 25;

type ConversionStatus =
  | "pending"
  | "awaitingApproval"
  | "approved"
  | "rejected"
  | "voided"
  | "confirmed";

/** `confirmed` is the v1 status the wallet migration still reads as approved. */
const STATUS_LABEL: Record<ConversionStatus, string> = {
  pending: "Pending",
  awaitingApproval: "Awaiting approval",
  approved: "Approved",
  confirmed: "Approved",
  rejected: "Rejected",
  voided: "Voided",
};

const STATUS_VARIANT: Record<
  ConversionStatus | "consumed",
  React.ComponentProps<typeof Badge>["variant"]
> = {
  pending: "secondary",
  awaitingApproval: "secondary",
  approved: "default",
  confirmed: "default",
  consumed: "outline",
  rejected: "destructive",
  voided: "outline",
};

const FILTERS = [
  "pending",
  "awaitingApproval",
  "approved",
  "rejected",
  "voided",
] as const;

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
      <div className="flex items-center gap-3">
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
          credit on a booking.
        </p>
      </div>

      {paginationStatus === "LoadingFirstPage" ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : rows.length === 0 ? (
        <EmptyState icon={History} message="No referrals match this filter." />
      ) : (
        <Table containerClassName="overflow-x-visible" dense>
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
                  {new Date(row.createdAt).toLocaleDateString("en-GB")}
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
                    : formatPrice(row.projectedCredit) + " (projected)"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      STATUS_VARIANT[
                        row.creditConsumed ? "consumed" : row.status
                      ]
                    }
                  >
                    {row.creditConsumed ? "Consumed" : STATUS_LABEL[row.status]}
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
