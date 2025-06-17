"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ReservationsTable } from "@/components/admin/ReservationsTable";
import { CreateReservationDialog } from "@/components/admin/CreateReservationDialog";

export default function ReservationsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reservations Management</h1>
          <p className="text-muted-foreground">
            View and manage all reservation requests and bookings
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-primary hover:bg-primary/80"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Reservation
        </Button>
      </div>
      
      <ReservationsTable />
      
      <CreateReservationDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          // Table will automatically refresh due to Convex reactivity
        }}
      />
    </div>
  );
} 