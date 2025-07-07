"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ReservationsTable } from "@/components/admin/reservation-table";
import { CreateReservationDialog } from "@/components/admin/create-reservation-dialog";

export default function ReservationsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const t = useTranslations('admin');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('reservationsManagement')}</h1>
          <p className="text-muted-foreground">
            {t('reservationsDescription')}
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-primary hover:bg-primary/80"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('addReservation')}
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