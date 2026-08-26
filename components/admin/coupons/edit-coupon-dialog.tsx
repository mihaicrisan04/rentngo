"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  CouponFormFields,
  couponFormSchema,
  couponFormToMutationValues,
  type CouponFormData,
} from "@/components/admin/coupons/coupon-form";

interface EditCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: Doc<"coupons">;
  onSuccess?: () => void;
}

/** Stored end-of-day-Bucharest ms → the "YYYY-MM-DD" the admin picked. */
function expiryToDateInput(expiresAt: number | undefined): string {
  if (expiresAt === undefined) return "";
  return new Date(expiresAt).toLocaleDateString("en-CA", {
    timeZone: "Europe/Bucharest",
  });
}

export function EditCouponDialog({
  open,
  onOpenChange,
  coupon,
  onSuccess,
}: EditCouponDialogProps) {
  const updateCoupon = useMutation(api.coupons.update);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: coupon.code,
      label: coupon.label ?? "",
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      expiresAt: expiryToDateInput(coupon.expiresAt),
      maxRedemptions:
        coupon.maxRedemptions !== undefined
          ? String(coupon.maxRedemptions)
          : "",
      minOrderValue:
        coupon.minOrderValue !== undefined ? String(coupon.minOrderValue) : "",
      appliesTo: coupon.appliesTo,
      isActive: coupon.isActive,
    },
  });

  const onSubmit = async (values: CouponFormData) => {
    setIsSubmitting(true);
    try {
      const payload = couponFormToMutationValues(values);
      await updateCoupon({
        id: coupon._id,
        ...payload,
        // Cleared optional fields must be null (undefined = leave unchanged)
        expiresAt: payload.expiresAt ?? null,
        maxRedemptions: payload.maxRedemptions ?? null,
        minOrderValue: payload.minOrderValue ?? null,
      });

      toast.success("Coupon updated successfully", {
        description: `${values.code.toUpperCase()} has been saved.`,
        position: "bottom-left",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast.error("Failed to update coupon", {
        description:
          error instanceof Error && error.message.includes("already exists")
            ? "A coupon with this code already exists."
            : "Please check the form and try again.",
        position: "bottom-left",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Coupon</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(80vh-150px)] pr-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-4"
            >
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                Used {coupon.redemptionCount} time
                {coupon.redemptionCount === 1 ? "" : "s"}
                {coupon.maxRedemptions !== undefined &&
                  ` of ${coupon.maxRedemptions}`}
                . Changes apply to future redemptions only.
              </div>
              <CouponFormFields form={form} isSubmitting={isSubmitting} />
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
