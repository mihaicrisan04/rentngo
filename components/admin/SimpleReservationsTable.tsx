"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
import { Edit, Trash2, MoreHorizontal, Mail, CheckCircle, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function SimpleReservationsTable() {
  const reservations = useQuery(api.reservations.getAllReservations);
  const deleteReservation = useMutation(api.reservations.deleteReservationPermanently);
  const updateStatus = useMutation(api.reservations.updateReservationStatus);

  const handleDelete = async (reservationId: Id<"reservations">, customerName: string) => {
    if (confirm(`Are you sure you want to permanently delete the reservation for ${customerName}? This action cannot be undone.`)) {
      try {
        await deleteReservation({ reservationId });
        toast.success("Reservation deleted successfully", {
          description: `Reservation for ${customerName} has been removed.`,
        });
      } catch (error) {
        toast.error("Failed to delete reservation", {
          description: "Please try again later.",
        });
        console.error("Delete error:", error);
      }
    }
  };

  const handleStatusUpdate = async (reservationId: Id<"reservations">, newStatus: "pending" | "confirmed" | "cancelled" | "completed") => {
    try {
      await updateStatus({ reservationId, newStatus });
      toast.success("Reservation status updated", {
        description: `Status changed to ${newStatus}`,
      });
    } catch (error) {
      toast.error("Failed to update status", {
        description: "Please try again later.",
      });
      console.error("Status update error:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
      confirmed: { color: "bg-green-100 text-green-800 border-green-200", label: "Confirmed" },
      cancelled: { color: "bg-red-100 text-red-800 border-red-200", label: "Cancelled" },
      completed: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Completed" },
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

  if (!reservations) {
    return <div className="flex justify-center py-8">Loading reservations...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No reservations found.
                </TableCell>
              </TableRow>
            ) : (
              reservations.map((reservation) => (
                <TableRow key={reservation._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{reservation.customerInfo.name}</div>
                      <div className="text-sm text-muted-foreground">{reservation.customerInfo.email}</div>
                      <div className="text-sm text-muted-foreground">{reservation.customerInfo.phone}</div>
                    </div>
                  </TableCell>
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
                    <div className="font-medium">{formatPrice(reservation.totalPrice)}</div>
                    {reservation.promoCode && (
                      <div className="text-xs text-muted-foreground">
                        Promo: {reservation.promoCode}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="capitalize text-sm">
                      {reservation.paymentMethod.replace(/_/g, ' ')}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => alert("Edit functionality coming soon!")}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        {reservation.status === "pending" && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(reservation._id, "confirmed")}
                            className="cursor-pointer"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm
                          </DropdownMenuItem>
                        )}
                        {(reservation.status === "pending" || reservation.status === "confirmed") && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(reservation._id, "cancelled")}
                            className="cursor-pointer text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => alert("Email functionality coming soon!")}
                          className="cursor-pointer"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(reservation._id, reservation.customerInfo.name)}
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

      <div className="text-sm text-muted-foreground">
        Showing {reservations.length} reservations
      </div>
    </div>
  );
} 