"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatPrice, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePeriodicNow } from "@/hooks/use-periodic-now";
import { getTableLayout } from "@/components/admin/shared/table-layout";
import {
  rowActivationProps,
  stopRowActivation,
} from "@/components/admin/shared/row-activation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit,
  Trash2,
  MoreHorizontal,
  Mail,
  CheckCircle,
  XCircle,
  CalendarX,
} from "lucide-react";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { toastWithUndo } from "@/components/admin/shared/undo-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const EditReservationDialog = dynamic(
  () =>
    import("./edit-reservation-dialog").then((m) => m.EditReservationDialog),
  { ssr: false },
);

const ReservationEmailDialog = dynamic(
  () =>
    import("@/components/admin/reservations/reservation-email-dialog").then(
      (m) => m.ReservationEmailDialog,
    ),
  { ssr: false },
);

const ITEMS_PER_PAGE = 10;

type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed";

interface ReservationsTableProps {
  fullHeight?: boolean;
  onCreate?: () => void;
}

export function ReservationsTable({
  fullHeight = false,
  onCreate,
}: ReservationsTableProps) {
  const layout = getTableLayout(fullHeight);
  const now = usePeriodicNow();
  const [editingReservation, setEditingReservation] =
    useState<Id<"reservations"> | null>(null);
  const [emailDialogReservation, setEmailDialogReservation] =
    useState<Id<"reservations"> | null>(null);

  const {
    results: reservations,
    status: paginationStatus,
    loadMore,
  } = usePaginatedQuery(
    api.reservations.getAllReservationsPaginated,
    {},
    { initialNumItems: ITEMS_PER_PAGE },
  );
  const deleteReservation = useMutation(
    api.reservations.deleteReservationPermanently,
  );
  const updateStatus = useMutation(
    api.reservations.updateReservationStatus,
  ).withOptimisticUpdate((localStore, { reservationId, newStatus }) => {
    for (const { args, value } of localStore.getAllQueries(
      api.reservations.getAllReservationsPaginated,
    )) {
      if (value === undefined) continue;
      localStore.setQuery(api.reservations.getAllReservationsPaginated, args, {
        ...value,
        page: value.page.map((reservation) =>
          reservation._id === reservationId
            ? { ...reservation, status: newStatus }
            : reservation,
        ),
      });
    }
  });

  const handleEdit = (reservationId: Id<"reservations">) => {
    setEditingReservation(reservationId);
  };

  const handleDelete = async (
    reservationId: Id<"reservations">,
    customerName: string,
  ) => {
    if (
      confirm(
        `Are you sure you want to permanently delete the reservation for ${customerName}? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteReservation({ reservationId });
        toast.success("Reservation deleted successfully", {
          description: `Reservation for ${customerName} has been removed.`,
          position: "bottom-right",
        });
      } catch (error) {
        toast.error("Failed to delete reservation", {
          description: "Please try again later.",
          position: "bottom-right",
        });
        console.error("Delete error:", error);
      }
    }
  };

  const handleStatusUpdate = async (
    reservationId: Id<"reservations">,
    newStatus: ReservationStatus,
    previousStatus: ReservationStatus,
  ) => {
    try {
      await updateStatus({ reservationId, newStatus });
      toastWithUndo({
        message: "Reservation status updated",
        description: `Status changed to ${newStatus}`,
        onUndo: () =>
          updateStatus({ reservationId, newStatus: previousStatus }),
      });
    } catch (error) {
      toast.error("Failed to update status", {
        description: "Please try again later.",
        position: "bottom-right",
      });
      console.error("Status update error:", error);
    }
  };

  if (paginationStatus === "LoadingFirstPage") {
    return (
      <div className="flex justify-center py-8">Loading reservations...</div>
    );
  }

  return (
    <div className={layout.root}>
      <div className={cn("rounded-md border", layout.scrollArea)}>
        <Table containerClassName="overflow-x-visible" dense>
          <TableHeader sticky>
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Pickup/Return</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[150px] max-w-[150px]">Contact</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <EmptyState
                    icon={CalendarX}
                    message="No reservations yet"
                    actionLabel={onCreate ? "Add reservation" : undefined}
                    onAction={onCreate}
                  />
                </TableCell>
              </TableRow>
            ) : (
              reservations.map((reservation) => (
                <TableRow
                  key={reservation._id}
                  {...rowActivationProps(() => handleEdit(reservation._id))}
                >
                  <TableCell
                    className="text-muted-foreground"
                    title={new Date(reservation._creationTime).toLocaleString()}
                  >
                    {now === null
                      ? ""
                      : formatRelativeTime(reservation._creationTime, now)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {reservation.customerInfo.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {reservation.customerInfo.email}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {reservation.customerInfo.phone}
                      </div>
                    </div>
                  </TableCell>
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
                        Vehicle unavailable
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">
                        From: {formatDate(reservation.startDate)}
                      </div>
                      <div className="text-sm">
                        To: {formatDate(reservation.endDate)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {reservation.pickupTime} - {reservation.restitutionTime}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">
                        Pickup: {reservation.pickupLocation}
                      </div>
                      <div className="text-sm">
                        Return: {reservation.restitutionLocation}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatPrice(reservation.totalPrice)}
                    </div>
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
                        ✓ Standard Warranty ({reservation.deductibleAmount || 0}{" "}
                        EUR deductible)
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="capitalize text-sm">
                      {reservation.paymentMethod.replace(/_/g, " ")}
                    </span>
                  </TableCell>
                  <TableCell><StatusBadge status={reservation.status} /></TableCell>
                  <TableCell className="max-w-[150px]">
                    <div className="text-sm">
                      {reservation.customerInfo.flightNumber && (
                        <div
                          className="truncate"
                          title={`Flight: ${reservation.customerInfo.flightNumber}`}
                        >
                          Flight: {reservation.customerInfo.flightNumber}
                        </div>
                      )}
                      {reservation.customerInfo.message && (
                        <div
                          className="text-muted-foreground truncate max-w-20"
                          title={reservation.customerInfo.message}
                        >
                          {reservation.customerInfo.message}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell {...stopRowActivation}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEdit(reservation._id)}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        {reservation.status === "pending" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(
                                reservation._id,
                                "confirmed",
                                reservation.status,
                              )
                            }
                            className="cursor-pointer"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm
                          </DropdownMenuItem>
                        )}
                        {(reservation.status === "pending" ||
                          reservation.status === "confirmed") && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(
                                reservation._id,
                                "cancelled",
                                reservation.status,
                              )
                            }
                            className="cursor-pointer text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() =>
                            setEmailDialogReservation(reservation._id)
                          }
                          className="cursor-pointer"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleDelete(
                              reservation._id,
                              reservation.customerInfo.name,
                            )
                          }
                          className="cursor-pointer text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {paginationStatus !== "Exhausted" && (
        <div className={cn("flex justify-center", layout.footer)}>
          <Button
            variant="outline"
            onClick={() => loadMore(ITEMS_PER_PAGE)}
            disabled={paginationStatus === "LoadingMore"}
          >
            {paginationStatus === "LoadingMore" ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}

      {editingReservation && (
        <EditReservationDialog
          open={!!editingReservation}
          onOpenChange={(open: boolean) => !open && setEditingReservation(null)}
          reservationId={editingReservation}
        />
      )}

      {emailDialogReservation && (
        <ReservationEmailDialog
          open={!!emailDialogReservation}
          onOpenChange={(open: boolean) =>
            !open && setEmailDialogReservation(null)
          }
          reservationId={emailDialogReservation}
        />
      )}
    </div>
  );
}
