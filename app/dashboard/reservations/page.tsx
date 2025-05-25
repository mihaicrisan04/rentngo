"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

// Define the type for the reservation status explicitly for the form
type ReservationStatusType = "pending" | "confirmed" | "cancelled" | "completed"
type VehicleStatusType = "available" | "rented" | "maintenance"

interface EditReservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservationId: Id<"reservations"> | null
  onSuccess?: () => void
}

// --- EditReservationDialog Component (defined within the page file) ---
function EditReservationDialog({
  open,
  onOpenChange,
  reservationId,
  onSuccess,
}: EditReservationDialogProps) {
  const reservation = useQuery(
    api.reservations.getReservationById,
    reservationId ? { reservationId } : "skip"
  )
  const updateReservationDetails = useMutation(api.reservations.updateReservationDetails)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<{
    startDate: number;
    endDate: number;
    status: ReservationStatusType;
  }>({
    startDate: 0,
    endDate: 0,
    status: "pending" as ReservationStatusType,
  })

  useEffect(() => {
    if (reservation) {
      setFormData({
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        status: reservation.status as ReservationStatusType
      })
    } else if (!open) {
      // Reset form when dialog is closed and no reservation is loaded
      setFormData({ 
        startDate: 0, 
        endDate: 0, 
        status: "pending" as ReservationStatusType 
      })
    }
  }, [reservation, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reservationId) return
    setIsSubmitting(true)

    try {
      // Convert dates back to numbers (timestamps) if they were handled as Date objects
      // For now, assuming they are kept as numbers from the input
      const updates = {
        ...formData,
        startDate: Number(formData.startDate), // Ensure it\'s a number
        endDate: Number(formData.endDate),     // Ensure it\'s a number
      }

      await updateReservationDetails({
        reservationId,
        ...updates,
      })
      toast.success("Reservation updated successfully!")
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating reservation:", error)
      toast.error(`Failed to update reservation: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Helper to convert timestamp to YYYY-MM-DD for input type="date"
  const formatDateForInput = (timestamp: number): string => {
    if (!timestamp) return ""
    try {
      return new Date(timestamp).toISOString().split("T")[0]
    } catch (e) {
      return "" // Handle potential errors with date conversion
    }
  }

  // Helper to convert YYYY-MM-DD string from input type="date" to timestamp
  const handleDateChange = (dateStr: string): number => {
    return new Date(dateStr).getTime()
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Reservation</DialogTitle>
        </DialogHeader>
        {reservation ? (
          <ScrollArea className="max-h-[calc(80vh-150px)] pr-6">
            <form onSubmit={handleSubmit} id="reservationEditForm" className="space-y-6 py-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                {/* TODO: Consider using a proper Date Picker component from shadcn/ui if available or a third-party library */}
                <Input
                  id="startDate"
                  type="date"
                  value={formatDateForInput(formData.startDate)}
                  onChange={(e) => setFormData({ ...formData, startDate: handleDateChange(e.target.value) })}
                  className="mt-1"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formatDateForInput(formData.endDate)}
                  onChange={(e) => setFormData({ ...formData, endDate: handleDateChange(e.target.value) })}
                  className="mt-1"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, status: value as ReservationStatusType })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* TODO: Add other editable fields as needed, e.g., promoCode, if applicable */}
            </form>
          </ScrollArea>
        ) : (
          <div className="flex justify-center items-center h-40">Loading reservation data...</div>
        )}
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="reservationEditForm"
            disabled={isSubmitting || !reservation}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// --- CreateReservationDialog Component ---
interface CreateReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function CreateReservationDialog({ open, onOpenChange, onSuccess }: CreateReservationDialogProps) {
  const vehicles = useQuery(api.vehicles.getAllVehicles); // Fetch all vehicles for selection
  const createReservation = useMutation(api.reservations.createReservation);
  const updateVehicle = useMutation(api.vehicles.update); // To update vehicle status
  const ensureUserMutation = useMutation(api.users.ensureUser); // Add this import

  const initialFormData = {
    vehicleId: "" as Id<"vehicles"> | "",
    startDate: "", // Will be stored as timestamp
    endDate: "",   // Will be stored as timestamp
    pickupTime: "10:00", // Default pickup time
    restitutionTime: "10:00", // Default return time
    pickupLocation: "Bucharest Airport", // Default pickup location
    restitutionLocation: "Bucharest Airport", // Default return location
    paymentMethod: "cash_on_delivery" as "cash_on_delivery" | "card_on_delivery" | "card_online",
    totalPrice: 0,
    customerName: "", // Customer name
    customerEmail: "", // Customer email
    customerPhone: "", // Customer phone
    customerMessage: "", // Optional customer message
    promoCode: "",
    // additionalCharges: [], // For simplicity, not adding complex fields initially
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setFormData(initialFormData); // Reset form when dialog closes
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId) {
      toast.error("Please select a vehicle.");
      return;
    }
    if (!formData.startDate || !formData.endDate) {
        toast.error("Please select start and end dates.");
        return;
    }
    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      toast.error("Please fill in all customer information fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure user exists in the database
      const convexUser = await ensureUserMutation({});

      const reservationDataToSubmit = {
        userId: convexUser._id,
        vehicleId: formData.vehicleId as Id<"vehicles">,
        startDate: new Date(formData.startDate).getTime(),
        endDate: new Date(formData.endDate).getTime(),
        pickupTime: formData.pickupTime,
        restitutionTime: formData.restitutionTime,
        pickupLocation: formData.pickupLocation,
        restitutionLocation: formData.restitutionLocation,
        paymentMethod: formData.paymentMethod,
        totalPrice: Number(formData.totalPrice),
        customerInfo: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone,
          message: formData.customerMessage || undefined,
        },
        promoCode: formData.promoCode || undefined,
        additionalCharges: undefined,
      };

      // TODO: Add more robust validation, e.g., endDate > startDate, totalPrice > 0

      const reservationId = await createReservation(reservationDataToSubmit);
      toast.success("Reservation created successfully!");

      // --- Mark: Update vehicle status after successful reservation creation ---
      // It's generally better to do this in a Convex action for atomicity
      // but for now, updating from client as per request structure.
      await updateVehicle({ 
        id: reservationDataToSubmit.vehicleId, 
        status: "rented" as VehicleStatusType 
      });
      toast.info(`Vehicle status updated to rented.`);
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating reservation or updating vehicle:", error);
      toast.error(`Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // TODO: Filter vehicles to show only "available" ones in the select dropdown
  const availableVehicles = vehicles?.filter(v => v.status === 'available' || v.status === undefined); 
  // Or, even better, create a new query api.vehicles.getAvailable

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Reservation</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(80vh-150px)] pr-6">
          <form onSubmit={handleSubmit} id="reservationCreateForm" className="space-y-6 py-4">
            <div>
              <Label htmlFor="vehicleId">Vehicle</Label>
              <Select
                value={formData.vehicleId}
                onValueChange={(value) => setFormData({ ...formData, vehicleId: value as Id<"vehicles"> })}
                disabled={isSubmitting || !availableVehicles}
              >
                <SelectTrigger className="mt-1" id="vehicleId">
                  <SelectValue placeholder="Select a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {availableVehicles ? (
                    availableVehicles.map((vehicle) => (
                      <SelectItem key={vehicle._id} value={vehicle._id}>
                        {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.pricePerDay} RON/day
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>Loading vehicles...</SelectItem>
                  )}
                  {availableVehicles && availableVehicles.length === 0 && (
                     <SelectItem value="no-vehicles" disabled>No available vehicles found.</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-startDate">Start Date</Label>
                <Input
                  id="create-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div>
                <Label htmlFor="create-endDate">End Date</Label>
                <Input
                  id="create-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pickupTime">Pickup Time</Label>
                <Input
                  id="pickupTime"
                  type="time"
                  value={formData.pickupTime}
                  onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                  className="mt-1"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div>
                <Label htmlFor="restitutionTime">Return Time</Label>
                <Input
                  id="restitutionTime"
                  type="time"
                  value={formData.restitutionTime}
                  onChange={(e) => setFormData({ ...formData, restitutionTime: e.target.value })}
                  className="mt-1"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pickupLocation">Pickup Location</Label>
                <Select
                  value={formData.pickupLocation}
                  onValueChange={(value) => setFormData({ ...formData, pickupLocation: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select pickup location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bucharest Airport">Bucharest Airport</SelectItem>
                    <SelectItem value="Bucharest City Center">Bucharest City Center</SelectItem>
                    <SelectItem value="Cluj Airport">Cluj Airport</SelectItem>
                    <SelectItem value="Timisoara Airport">Timisoara Airport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="restitutionLocation">Return Location</Label>
                <Select
                  value={formData.restitutionLocation}
                  onValueChange={(value) => setFormData({ ...formData, restitutionLocation: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select return location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bucharest Airport">Bucharest Airport</SelectItem>
                    <SelectItem value="Bucharest City Center">Bucharest City Center</SelectItem>
                    <SelectItem value="Cluj Airport">Cluj Airport</SelectItem>
                    <SelectItem value="Timisoara Airport">Timisoara Airport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as "cash_on_delivery" | "card_on_delivery" | "card_online" })}
                disabled={isSubmitting}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                  <SelectItem value="card_on_delivery">Card on Delivery</SelectItem>
                  <SelectItem value="card_online">Card Online</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="totalPrice">Total Price (RON)</Label>
              <Input
                id="totalPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.totalPrice}
                onChange={(e) => setFormData({ ...formData, totalPrice: parseFloat(e.target.value) || 0 })}
                className="mt-1"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Customer Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="mt-1"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Customer Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="mt-1"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="customerPhone">Customer Phone</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="mt-1"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerMessage">Customer Message (Optional)</Label>
                <Input
                  id="customerMessage"
                  type="text"
                  value={formData.customerMessage}
                  onChange={(e) => setFormData({ ...formData, customerMessage: e.target.value })}
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="promoCode">Promo Code (Optional)</Label>
              <Input
                id="promoCode"
                type="text"
                value={formData.promoCode}
                onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                className="mt-1"
                disabled={isSubmitting}
              />
            </div>
          </form>
        </ScrollArea>
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="reservationCreateForm"
            disabled={isSubmitting || !availableVehicles || availableVehicles.length === 0}
          >
            {isSubmitting ? "Creating..." : "Create Reservation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ReservationsPage() {
  const reservations = useQuery(api.reservations.getCurrentUserReservations)
  // TODO: Consider fetching vehicle details to display make/model instead of just vehicleId
  // This might involve a new query or modifying getCurrentUserReservations to join data.

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedReservationId, setSelectedReservationId] = useState<Id<"reservations"> | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false) // State for create dialog

  const handleEditClick = (reservationId: Id<"reservations">) => {
    setSelectedReservationId(reservationId)
    setIsEditDialogOpen(true)
  }

  const handleDialogSuccess = () => {
    // Optionally, refetch data or update local state if needed, though Convex typically handles reactivity.
    // For now, just closing the dialog is enough.
  }
  
  // Helper to format timestamp to a readable date string
  const formatTimestamp = (timestamp: number): string => {
    if (!timestamp) return "N/A"
    try {
      return new Date(timestamp).toLocaleDateString()
    } catch (e) {
      return "Invalid Date"
    }
  }


  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Reservations</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}> {/* Button to open create dialog */}
          Create New Reservation
        </Button>
      </div>
      {reservations === undefined && <p>Loading reservations...</p>}
      {reservations && reservations.length === 0 && <p>You have no reservations yet.</p>}
      {reservations && reservations.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reservation ID</TableHead>
              <TableHead>Vehicle ID</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Total Price (RON)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation._id}>
                <TableCell className="font-medium truncate" style={{maxWidth: "100px"}} title={reservation._id}>{reservation._id}</TableCell>
                <TableCell className="truncate" style={{maxWidth: "100px"}} title={reservation.vehicleId}>{reservation.vehicleId}</TableCell> {/* TODO: Display vehicle details */}
                <TableCell>{formatTimestamp(reservation.startDate)}</TableCell>
                <TableCell>{formatTimestamp(reservation.endDate)}</TableCell>
                <TableCell>{reservation.totalPrice.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full \
                    ${reservation.status === "confirmed" ? "bg-green-100 text-green-800" : ""} \
                    ${reservation.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""} \
                    ${reservation.status === "cancelled" ? "bg-red-100 text-red-800" : ""} \
                    ${reservation.status === "completed" ? "bg-blue-100 text-blue-800" : ""}\
                  `}>
                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(reservation._id)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <EditReservationDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        reservationId={selectedReservationId}
        onSuccess={handleDialogSuccess}
      />
      <CreateReservationDialog  
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          // Optional: could refetch or update UI, but Convex reactivity often handles it
          toast.info("Reservation list might be updating...");
        }}
      />
    </div>
  )
}
