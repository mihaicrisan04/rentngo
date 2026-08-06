"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CouponsTable } from "@/components/admin/coupons/coupons-table";

const CreateCouponDialog = dynamic(
  () => import("@/components/admin/coupons/create-coupon-dialog").then(m => m.CreateCouponDialog),
  { ssr: false }
);

export function CouponsManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupons Management</h1>
          <p className="text-muted-foreground">
            Create and manage discount codes for rentals and transfers
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Codes are case-insensitive; expiry is end of day, Romania time
        </p>
        <CouponsTable onCreate={() => setShowCreateDialog(true)} />
      </div>

      {/* Create Coupon Dialog */}
      <CreateCouponDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
