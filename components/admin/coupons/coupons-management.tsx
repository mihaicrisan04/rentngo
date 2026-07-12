"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

      {/* All Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
          <CardDescription>
            Codes are case-insensitive; expiry is end of day, Romania time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CouponsTable />
        </CardContent>
      </Card>

      {/* Create Coupon Dialog */}
      <CreateCouponDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
