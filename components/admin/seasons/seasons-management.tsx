"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CurrentSeasonSelector } from "@/components/admin/seasons/current-season-selector";
import { SeasonsTable } from "@/components/admin/seasons/seasons-table";

const CreateSeasonDialog = dynamic(
  () =>
    import("@/components/admin/seasons/create-season-dialog").then(
      (m) => m.CreateSeasonDialog,
    ),
  { ssr: false },
);

export function SeasonsManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Seasons Management
          </h1>
          <p className="text-muted-foreground">
            Manage seasonal pricing and set the current active season
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Season
        </Button>
      </div>

      {/* Current Season Section */}
      <div>
        <CurrentSeasonSelector />
      </div>

      <SeasonsTable onCreate={() => setShowCreateDialog(true)} />

      {/* Create Season Dialog */}
      <CreateSeasonDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          // Optional: Add any additional success handling here
        }}
      />
    </div>
  );
}
