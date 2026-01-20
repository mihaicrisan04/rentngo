"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Vehicle } from "@/types/vehicle";
import Image from "next/image";
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
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditVehicleDialog } from "@/components/admin/vehicles/edit-vehicle-dialog";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

export function VehiclesTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingVehicle, setEditingVehicle] = useState<Id<"vehicles"> | null>(null);

  // Fetch all vehicles and paginate on the client side
  const vehicles = useQuery(api.vehicles.getAllVehicles);
  const vehicleClasses = useQuery(api.vehicleClasses.list, { activeOnly: false });

  const deleteVehicle = useMutation(api.vehicles.remove);

  // Create a lookup map for vehicle classes
  const classLookup = useMemo(() => {
    if (!vehicleClasses) return new Map<string, string>();
    return new Map(
      vehicleClasses.map((vc) => [vc._id, vc.displayName || vc.name])
    );
  }, [vehicleClasses]);

  const handleNextPage = (totalPages: number) => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  };

  const handlePreviousPage = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleEdit = (vehicleId: Id<"vehicles">) => {
    setEditingVehicle(vehicleId);
  };

  const handleDelete = async (vehicleId: Id<"vehicles">, vehicleName: string) => {
    if (confirm(`Are you sure you want to delete ${vehicleName}? This action cannot be undone.`)) {
      try {
        await deleteVehicle({ id: vehicleId });
        toast.success("Vehicle deleted successfully", {
          description: `${vehicleName} has been removed from your fleet.`,
          position: "bottom-right",
        });
      } catch (error) {
        toast.error("Failed to delete vehicle", {
          description: "Please try again later.",
          position: "bottom-right",
        });
        console.error("Delete error:", error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { color: "bg-green-100 text-green-800", label: "Available" },
      rented: { color: "bg-blue-100 text-blue-800", label: "Rented" },
      maintenance: { color: "bg-orange-100 text-orange-800", label: "Maintenance" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
    
    return (
      <Badge variant="secondary" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const VehicleImage = ({ vehicle }: { vehicle: Vehicle }) => {
    const imageUrl = useQuery(
      api.vehicles.getImageUrl,
      vehicle.mainImageId ? { imageId: vehicle.mainImageId } : "skip"
    );

    return (
      <div className="w-16 h-12 relative rounded-md overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            No Image
          </div>
        )}
      </div>
    );
  };

  if (!vehicles) {
    return <div className="flex justify-center py-8">Loading vehicles...</div>;
  }

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedVehicles = vehicles.slice(startIndex, endIndex);
  const totalPages = Math.ceil(vehicles.length / ITEMS_PER_PAGE) || 1;

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Image</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Engine</TableHead>
              <TableHead>Transmission</TableHead>
              <TableHead>Fuel</TableHead>
              <TableHead>Price/Day</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  No vehicles found. Add your first vehicle to get started.
                </TableCell>
              </TableRow>
            ) : (
              paginatedVehicles.map((vehicle) => (
                <TableRow key={vehicle._id}>
                  <TableCell>
                    <VehicleImage vehicle={vehicle} />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {vehicle.make} {vehicle.model}
                      </div>
                      {vehicle.seats && (
                        <div className="text-sm text-muted-foreground">
                          {vehicle.seats} seats
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {vehicle.type ? (
                      <span className="capitalize">{vehicle.type}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {vehicle.classId && classLookup.get(vehicle.classId) ? (
                      <span className="capitalize">{classLookup.get(vehicle.classId)}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{vehicle.year || "-"}</TableCell>
                  <TableCell>
                    {vehicle.engineCapacity && vehicle.engineType ? (
                      <div className="text-sm">
                        <div>{vehicle.engineCapacity}L</div>
                        <div className="text-muted-foreground">{vehicle.engineType}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {vehicle.transmission ? (
                      <span className="capitalize">{vehicle.transmission}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {vehicle.fuelType ? (
                      <span className="capitalize">{vehicle.fuelType}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{vehicle.pricingTiers && vehicle.pricingTiers.length > 0 ? vehicle.pricingTiers[0].pricePerDay : 'N/A'} EUR</div>
                    {vehicle.warranty && (
                      <div className="text-xs text-muted-foreground">
                        Warranty: {vehicle.warranty} EUR
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEdit(vehicle._id)}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(vehicle._id, `${vehicle.make} ${vehicle.model}`)}
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

      {vehicles.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, vehicles.length)} of {vehicles.length} vehicles
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={handlePreviousPage}
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
                  onClick={() => handleNextPage(totalPages)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {editingVehicle && (
        <EditVehicleDialog
          open={!!editingVehicle}
          onOpenChange={(open: boolean) => !open && setEditingVehicle(null)}
          vehicleId={editingVehicle}
        />
      )}
    </div>
  );
} 
