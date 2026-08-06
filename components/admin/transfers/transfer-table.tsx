"use client";

import { useMutation, UsePaginatedQueryReturnType } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatPrice, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePeriodicNow } from "@/hooks/use-periodic-now";
import { getTableLayout } from "@/components/admin/shared/table-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Trash2,
  MapPin,
  Users,
  ArrowRight,
  Luggage,
} from "lucide-react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

type TransfersPagination = UsePaginatedQueryReturnType<
  typeof api.transfers.getAllTransfersPaginated
>;

interface TransfersTableProps {
  transfers: TransfersPagination["results"];
  paginationStatus: TransfersPagination["status"];
  loadMore: TransfersPagination["loadMore"];
  fullHeight?: boolean;
}

export function TransfersTable({
  transfers,
  paginationStatus,
  loadMore,
  fullHeight = false,
}: TransfersTableProps) {
  const layout = getTableLayout(fullHeight);
  const now = usePeriodicNow();
  const updateStatus = useMutation(api.transfers.updateTransferStatus);
  const deleteTransfer = useMutation(api.transfers.deleteTransferPermanently);

  const handleStatusUpdate = async (
    transferId: Id<"transfers">,
    newStatus: "pending" | "confirmed" | "cancelled" | "completed",
  ) => {
    try {
      await updateStatus({ transferId, newStatus });
      toast.success("Transfer status updated", {
        description: `Status changed to ${newStatus}`,
        position: "bottom-right",
      });
    } catch (error) {
      toast.error("Failed to update status", {
        description: "Please try again later.",
        position: "bottom-right",
      });
      console.error("Status update error:", error);
    }
  };

  const handleDelete = async (
    transferId: Id<"transfers">,
    customerName: string,
  ) => {
    if (
      confirm(
        `Are you sure you want to permanently delete the transfer for ${customerName}? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteTransfer({ transferId });
        toast.success("Transfer deleted successfully", {
          description: `Transfer for ${customerName} has been removed.`,
          position: "bottom-right",
        });
      } catch (error) {
        toast.error("Failed to delete transfer", {
          description: "Please try again later.",
          position: "bottom-right",
        });
        console.error("Delete error:", error);
      }
    }
  };

  return (
    <div className={layout.root}>
      <div className={cn("rounded-md border", layout.scrollArea)}>
        <Table containerClassName="overflow-x-visible" dense>
          <TableHeader sticky>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Date/Time</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-8 text-muted-foreground"
                >
                  No transfers found.
                </TableCell>
              </TableRow>
            ) : (
              transfers.map((transfer) => (
                <TableRow key={transfer._id}>
                  <TableCell className="font-medium">
                    #{transfer.transferNumber}
                  </TableCell>
                  <TableCell
                    className="text-muted-foreground"
                    title={new Date(transfer._creationTime).toLocaleString()}
                  >
                    {now === null
                      ? ""
                      : formatRelativeTime(transfer._creationTime, now)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {transfer.customerInfo.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {transfer.customerInfo.email}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {transfer.customerInfo.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 max-w-[200px]">
                      <div className="flex items-start gap-1">
                        <MapPin className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs truncate">
                          {transfer.pickupLocation.address.split(",")[0]}
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="flex items-start gap-1">
                        <MapPin className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs truncate">
                          {transfer.dropoffLocation.address.split(",")[0]}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {transfer.vehicle ? (
                      <div>
                        <div className="font-medium">
                          {transfer.vehicle.make} {transfer.vehicle.model}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transfer.vehicle.year}
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
                        {formatDate(transfer.pickupDate)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {transfer.pickupTime}
                      </div>
                      {transfer.transferType === "round_trip" && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Round Trip
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{transfer.passengers} pax</span>
                      </div>
                      <div>{transfer.distanceKm} km</div>
                      {transfer.luggageCount !== undefined &&
                        transfer.luggageCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Luggage className="h-3 w-3" />
                            <span>{transfer.luggageCount} bags</span>
                          </div>
                        )}
                      {transfer.customerInfo.flightNumber && (
                        <div className="text-muted-foreground">
                          ✈ {transfer.customerInfo.flightNumber}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatPrice(transfer.totalPrice)}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {transfer.paymentMethod.replace(/_/g, " ")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={transfer.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {transfer.status === "pending" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(transfer._id, "confirmed")
                            }
                            className="cursor-pointer"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm
                          </DropdownMenuItem>
                        )}
                        {transfer.status === "confirmed" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(transfer._id, "completed")
                            }
                            className="cursor-pointer"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Completed
                          </DropdownMenuItem>
                        )}
                        {(transfer.status === "pending" ||
                          transfer.status === "confirmed") && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(transfer._id, "cancelled")
                            }
                            className="cursor-pointer text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() =>
                            handleDelete(
                              transfer._id,
                              transfer.customerInfo.name,
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
    </div>
  );
}
