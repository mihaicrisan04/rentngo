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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Edit, Trash2, MoreHorizontal, Mail, CheckCircle, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { EditReservationDialog } from "@/components/admin/EditReservationDialog";
import { ReservationEmailDialog } from "@/components/admin/reservtaion-email-dialog";
import { toast } from "sonner";
import { EditReservationDialog } from "./edit-reservation-dialog";

const ITEMS_PER_PAGE = 10;

export function ReservationsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingReservation, setEditingReservation] = useState<Id<"reservations"> | null>(null);
  const [emailDialogReservation, setEmailDialogReservation] = useState<Id<"reservations"> | null>(null);
  
  const reservations = useQuery(api.reservations.getAllReservations);
  const deleteReservation = useMutation(api.reservations.deleteReservationPermanently);
  const updateStatus = useMutation(api.reservations.updateReservationStatus);

  const handleEdit = (reservationId: Id<"reservations">) => {
    setEditingReservation(reservationId);
  };

  const handleDelete = async (reservationId: Id<"reservations">, customerName: string) => {
    if (confirm(`Are you sure you want to permanently delete the reservation for ${customerName}? This action cannot be undone.`)) {
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

  const handleStatusUpdate = async (reservationId: Id<"reservations">, newStatus: "pending" | "confirmed" | "cancelled" | "completed") => {
    try {
      await updateStatus({ reservationId, newStatus });
      toast.success("Reservation status updated", {
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

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedReservations = reservations.slice(startIndex, endIndex);
  const totalPages = Math.ceil(reservations.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Pickup/Return</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedReservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No reservations found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedReservations.map((reservation) => (
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
                  <TableCell>
                    <span className="capitalize text-sm">
                      {reservation.paymentMethod.replace(/_/g, ' ')}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {reservation.customerInfo.flightNumber && (
                        <div>Flight: {reservation.customerInfo.flightNumber}</div>
                      )}
                      {reservation.customerInfo.message && (
                        <div className="text-muted-foreground truncate max-w-20" title={reservation.customerInfo.message}>
                          {reservation.customerInfo.message}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
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
                          onClick={() => setEmailDialogReservation(reservation._id)}
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

      {reservations.length > 0 && (
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
          onOpenChange={(open: boolean) => !open && setEmailDialogReservation(null)}
          reservationId={emailDialogReservation}
        />
      )}
    </div>
  );
} 