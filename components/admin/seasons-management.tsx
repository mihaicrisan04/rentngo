"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { CurrentSeasonSelector } from "@/components/admin/current-season-selector";
import { SeasonsTable } from "@/components/admin/seasons-table";
import { CreateSeasonDialog } from "@/components/admin/create-season-dialog";

export function SeasonsManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seasons Management</h1>
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

      {/* All Seasons Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Seasons</CardTitle>
          <CardDescription>
            Manage your seasonal pricing configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SeasonsTable />
        </CardContent>
      </Card>

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