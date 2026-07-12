"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import { AffiliateSettingsCard } from "@/components/admin/affiliates/affiliate-settings-card";
import { AffiliatesTable } from "@/components/admin/affiliates/affiliates-table";

const CreateAffiliateDialog = dynamic(
  () =>
    import("@/components/admin/affiliates/create-affiliate-dialog").then(
      (m) => m.CreateAffiliateDialog,
    ),
  { ssr: false },
);

export function AffiliatesManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Affiliate Program
          </h1>
          <p className="text-muted-foreground">
            Referral links (rngo.ro/r/&lt;slug&gt;), conversion tracking and
            tiered rewards
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Affiliate
        </Button>
      </div>

      <AffiliateSettingsCard />

      <Card>
        <CardHeader>
          <CardTitle>Affiliates</CardTitle>
          <CardDescription>
            Confirmed conversions count live bookings only — cancellations are
            voided automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AffiliatesTable />
        </CardContent>
      </Card>

      <CreateAffiliateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
