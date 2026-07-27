"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export function UserReservationsTable() {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");

  const {
    results: reservations,
    status: paginationStatus,
    loadMore,
  } = usePaginatedQuery(
    api.reservations.getCurrentUserReservationsPaginated,
    {},
    { initialNumItems: ITEMS_PER_PAGE },
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: tCommon("status.pending"),
      },
      confirmed: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: tCommon("status.confirmed"),
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: tCommon("status.cancelled"),
      },
      completed: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: tCommon("status.completed"),
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge variant="secondary" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} EUR`;
  };

  if (paginationStatus === "LoadingFirstPage") {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">{t("table.loadingReservations")}</span>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t("noReservations")}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {t("noReservationsDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">{t("table.vehicle")}</TableHead>
              <TableHead className="w-[180px]">{t("table.dates")}</TableHead>
              <TableHead className="min-w-[200px]">
                {t("table.locations")}
              </TableHead>
              <TableHead className="w-[130px]">
                {t("table.totalPrice")}
              </TableHead>
              <TableHead className="w-[100px]">{t("table.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation._id}>
                <TableCell>
                  {reservation.vehicle ? (
                    <div>
                      <div className="font-medium">
                        {reservation.vehicle.make} {reservation.vehicle.model}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {reservation.vehicle.year}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      {t("table.vehicleUnavailable")}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm">
                      {t("table.fromLabel")} {formatDate(reservation.startDate)}
                    </div>
                    <div className="text-sm">
                      {t("table.toLabel")} {formatDate(reservation.endDate)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {reservation.pickupTime} - {reservation.restitutionTime}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm">
                      {t("table.pickupLabel")} {reservation.pickupLocation}
                    </div>
                    <div className="text-sm">
                      {t("table.returnLabel")} {reservation.restitutionLocation}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {formatPrice(reservation.totalPrice)}
                  </div>
                  {reservation.promoCode && (
                    <div className="text-xs text-muted-foreground">
                      {t("table.promoLabel")} {reservation.promoCode}
                    </div>
                  )}
                  {reservation.isSCDWSelected ? (
                    <div className="text-xs text-green-600">
                      ✓ {t("table.scdwZeroDeductible")}
                    </div>
                  ) : (
                    <div className="text-xs text-blue-600">
                      ✓{" "}
                      {t("table.standardWarranty", {
                        amount: reservation.deductibleAmount || 0,
                      })}
                    </div>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(reservation.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {paginationStatus !== "Exhausted" && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => loadMore(ITEMS_PER_PAGE)}
            disabled={paginationStatus === "LoadingMore"}
          >
            {paginationStatus === "LoadingMore"
              ? t("table.loading")
              : t("table.loadMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
