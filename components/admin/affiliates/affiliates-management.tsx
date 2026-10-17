"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AffiliateSettingsCard } from "@/components/admin/affiliates/affiliate-settings-card";
import { AffiliatesTable } from "@/components/admin/affiliates/affiliates-table";
import { ReferralApprovalsTable } from "@/components/admin/affiliates/referral-approvals-table";
import { ReferralHistoryTable } from "@/components/admin/affiliates/referral-history-table";

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
            Referral Program
          </h1>
          <p className="text-muted-foreground">
            Referral links (rngo.ro/r/&lt;slug&gt;), approvals and the wallet
            credit referrers earn
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Affiliate
        </Button>
      </div>

      <Tabs defaultValue="approvals" className="gap-6">
        <TabsList>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            A referral earns credit only once its rental is completed and
            approved here.
          </p>
          <ReferralApprovalsTable />
        </TabsContent>

        <TabsContent value="history">
          <ReferralHistoryTable />
        </TabsContent>

        <TabsContent value="affiliates" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Approved conversions count completed bookings only — cancellations
            are voided automatically and their credit is clawed back.
          </p>
          <AffiliatesTable onCreate={() => setShowCreateDialog(true)} />
        </TabsContent>

        <TabsContent value="settings">
          <AffiliateSettingsCard />
        </TabsContent>
      </Tabs>

      <CreateAffiliateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
