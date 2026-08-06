"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { formatRelativeTime } from "@/lib/format";
import { usePeriodicNow } from "@/hooks/use-periodic-now";
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
import { Edit, Trash2, MoreHorizontal, Power } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const EditCouponDialog = dynamic(
  () => import("@/components/admin/coupons/edit-coupon-dialog").then(m => m.EditCouponDialog),
  { ssr: false }
);

type Coupon = Doc<"coupons">;

function couponStatus(
  coupon: Coupon,
  now: number,
): "active" | "inactive" | "expired" | "exhausted" {
  if (!coupon.isActive) return "inactive";
  if (coupon.expiresAt !== undefined && now > coupon.expiresAt) return "expired";
  if (
    coupon.maxRedemptions !== undefined &&
    coupon.redemptionCount >= coupon.maxRedemptions
  )
    return "exhausted";
  return "active";
}

const statusBadgeClasses: Record<ReturnType<typeof couponStatus>, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  expired: "bg-amber-100 text-amber-800",
  exhausted: "bg-red-100 text-red-800",
};

export function CouponsTable() {
  const now = usePeriodicNow();
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const coupons = useQuery(api.coupons.list);
  const updateCoupon = useMutation(api.coupons.update);
  const removeCoupon = useMutation(api.coupons.remove);

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await updateCoupon({ id: coupon._id, isActive: !coupon.isActive });
      toast.success(coupon.isActive ? "Coupon deactivated" : "Coupon activated", {
        description: `${coupon.code} is now ${coupon.isActive ? "inactive" : "active"}.`,
        position: "bottom-right",
      });
    } catch (error) {
      toast.error("Failed to update coupon", {
        description: error instanceof Error ? error.message : "Please try again later.",
        position: "bottom-right",
      });
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (confirm(`Are you sure you want to delete "${coupon.code}"? This action cannot be undone.`)) {
      try {
        await removeCoupon({ id: coupon._id });
        toast.success("Coupon deleted successfully", {
          description: `${coupon.code} has been removed.`,
          position: "bottom-right",
        });
      } catch (error) {
        toast.error("Failed to delete coupon", {
          description: error instanceof Error ? error.message : "Please try again later.",
          position: "bottom-right",
        });
      }
    }
  };

  if (!coupons) {
    return <div className="flex justify-center py-8">Loading coupons...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table containerClassName="overflow-x-visible" dense>
          <TableHeader sticky>
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Applies To</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Min Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No coupons found. Create your first coupon to get started.
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => {
                const status = couponStatus(coupon, now ?? 0);
                return (
                  <TableRow key={coupon._id}>
                    <TableCell
                      className="text-muted-foreground"
                      title={new Date(coupon._creationTime).toLocaleString()}
                    >
                      {now === null
                        ? ""
                        : formatRelativeTime(coupon._creationTime, now)}
                    </TableCell>
                    <TableCell>
                      <div className="font-mono font-medium">{coupon.code}</div>
                      {coupon.label && (
                        <div className="text-xs text-muted-foreground">{coupon.label}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}%`
                          : `€${coupon.discountValue}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {coupon.appliesTo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {coupon.redemptionCount} / {coupon.maxRedemptions ?? "∞"}
                    </TableCell>
                    <TableCell>
                      {coupon.expiresAt !== undefined
                        ? new Date(coupon.expiresAt).toLocaleDateString("en-GB", {
                            timeZone: "Europe/Bucharest",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {coupon.minOrderValue !== undefined ? `€${coupon.minOrderValue}` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusBadgeClasses[status]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setEditingCoupon(coupon)}
                            className="cursor-pointer"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(coupon)}
                            className="cursor-pointer"
                          >
                            <Power className="h-4 w-4 mr-2" />
                            {coupon.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(coupon)}
                            className="cursor-pointer text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {editingCoupon && (
        <EditCouponDialog
          open={!!editingCoupon}
          onOpenChange={(open: boolean) => !open && setEditingCoupon(null)}
          coupon={editingCoupon}
        />
      )}
    </div>
  );
}
