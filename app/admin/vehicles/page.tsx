"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpDown } from "lucide-react";
import { VehiclesTable } from "@/components/admin/vehicles/vehicles-table";
import { FeaturedCarsManagement } from "@/components/admin/vehicles/featured-cars-management";
import { useRouter } from "next/navigation";

const CreateVehicleDialog = dynamic(
  () =>
    import("@/components/admin/vehicles/create-vehicle-dialog").then(
      (m) => m.CreateVehicleDialog,
    ),
  { ssr: false },
);

export default function VehiclesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6">
      <div className="flex shrink-0 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Management</h1>
          <p className="text-muted-foreground">Manage your fleet of vehicles</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/vehicles/classes")}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Manage Classes
          </Button>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-primary hover:bg-primary/80"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </div>
      </div>

      <div className="shrink-0">
        <FeaturedCarsManagement />
      </div>

      <div className="flex min-h-[24rem] flex-1 flex-col">
        <VehiclesTable fullHeight onCreate={() => setCreateDialogOpen(true)} />
      </div>

      <CreateVehicleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
