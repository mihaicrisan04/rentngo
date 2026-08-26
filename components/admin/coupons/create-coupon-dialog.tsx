"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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
  emptyCouponFormValues,
  type CouponFormData,
} from "@/components/admin/coupons/coupon-form";

interface CreateCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateCouponDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateCouponDialogProps) {
  const createCoupon = useMutation(api.coupons.create);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: emptyCouponFormValues,
  });

  const onSubmit = async (values: CouponFormData) => {
    setIsSubmitting(true);
    try {
      await createCoupon(couponFormToMutationValues(values));

      toast.success("Coupon created successfully", {
        description: `${values.code.toUpperCase()} has been added.`,
        position: "bottom-left",
      });

      form.reset(emptyCouponFormValues);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error("Failed to create coupon", {
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
          <DialogTitle>Create New Coupon</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(80vh-150px)] pr-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-4"
            >
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
            {isSubmitting ? "Creating..." : "Create Coupon"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
