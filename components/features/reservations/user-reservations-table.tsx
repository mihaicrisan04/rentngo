"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useTranslations } from 'next-intl';
import { Loader2 } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export function UserReservationsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');

  const reservations = useQuery(api.reservations.getCurrentUserReservations);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: tCommon('status.pending') },
      confirmed: { color: "bg-green-100 text-green-800 border-green-200", label: tCommon('status.confirmed') },
      cancelled: { color: "bg-red-100 text-red-800 border-red-200", label: tCommon('status.cancelled') },
      completed: { color: "bg-blue-100 text-blue-800 border-blue-200", label: tCommon('status.completed') },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
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

  const VehicleInfo = ({ vehicleId }: { vehicleId: Id<"vehicles"> }) => {
    const vehicle = useQuery(api.vehicles.getById, { id: vehicleId });
    
    if (!vehicle) {
      return <span className="text-muted-foreground">Loading...</span>;
    }

    return (
      <div>
        <div className="font-medium">
          {vehicle.make} {vehicle.model}
        </div>
        <div className="text-sm text-muted-foreground">
          {vehicle.year}
        </div>
      </div>
    );
  };

  if (reservations === undefined) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading reservations...</span>
      </div>
    );
  }

  if (reservations === null || reservations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t('noReservations')}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {t('noReservationsDescription')}
        </p>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedReservations = reservations.slice(startIndex, endIndex);
  const totalPages = Math.ceil(reservations.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">{t('table.vehicle')}</TableHead>
              <TableHead className="w-[180px]">{t('table.dates')}</TableHead>
              <TableHead className="min-w-[200px]">{t('table.locations')}</TableHead>
              <TableHead className="w-[130px]">{t('table.totalPrice')}</TableHead>
              <TableHead className="w-[100px]">{t('table.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedReservations.map((reservation) => (
              <TableRow key={reservation._id}>
                <TableCell>
                  <VehicleInfo vehicleId={reservation.vehicleId} />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm">From: {formatDate(reservation.startDate)}</div>
                    <div className="text-sm">To: {formatDate(reservation.endDate)}</div>
                    <div className="text-xs text-muted-foreground">
                      {reservation.pickupTime} - {reservation.restitutionTime}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm">Pickup: {reservation.pickupLocation}</div>
                    <div className="text-sm">Return: {reservation.restitutionLocation}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{formatPrice(reservation.totalPrice)}</div>
                  {reservation.promoCode && (
                    <div className="text-xs text-muted-foreground">
                      Promo: {reservation.promoCode}
                    </div>
                  )}
                  {reservation.isSCDWSelected ? (
                    <div className="text-xs text-green-600">
                      ✓ SCDW (Zero deductible)
                    </div>
                  ) : (
                    <div className="text-xs text-blue-600">
                      ✓ Standard Warranty ({reservation.deductibleAmount || 0} EUR deductible)
                    </div>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(reservation.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {reservations.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, reservations.length)} of {reservations.length} reservations
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink className="cursor-default">
                  {currentPage} of {totalPages}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
} 
