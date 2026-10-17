"use client";

import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Wand2 } from "lucide-react";
import { bucharestEndOfDayMs } from "@/lib/pricing";

export const couponFormSchema = z
  .object({
    code: z
      .string()
      .min(3, "Code must be at least 3 characters")
      .max(32, "Code must be at most 32 characters")
      .regex(/^[A-Za-z0-9_-]+$/, "Only letters, digits, - and _ are allowed"),
    label: z
      .string()
      .max(100, "Label must be less than 100 characters")
      .optional(),
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z
      .string()
      .min(1, "Discount value is required")
      .regex(
        /^\d+(\.\d{1,2})?$/,
        "Must be a valid number with up to 2 decimals",
      ),
    expiresAt: z.string().optional(), // "YYYY-MM-DD"; end of day Europe/Bucharest
    maxRedemptions: z
      .string()
      .regex(/^\d*$/, "Must be a whole number")
      .optional(),
    minOrderValue: z
      .string()
      .regex(/^(\d+(\.\d{1,2})?)?$/, "Must be a valid amount")
      .optional(),
    appliesTo: z.enum(["rentals", "transfers", "both"]),
    isActive: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const value = parseFloat(values.discountValue);
    if (values.discountType === "percentage" && (value <= 0 || value > 100)) {
      ctx.addIssue({
        code: "custom",
        path: ["discountValue"],
        message: "Percentage must be between 0 and 100",
      });
    }
    if (values.discountType === "fixed" && value <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["discountValue"],
        message: "Fixed amount must be greater than 0",
      });
    }
    if (values.maxRedemptions && parseInt(values.maxRedemptions, 10) < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["maxRedemptions"],
        message: "Must be at least 1",
      });
    }
  });

export type CouponFormData = z.infer<typeof couponFormSchema>;

export const emptyCouponFormValues: CouponFormData = {
  code: "",
  label: "",
  discountType: "percentage",
  discountValue: "",
  expiresAt: "",
  maxRedemptions: "",
  minOrderValue: "",
  appliesTo: "both",
  isActive: true,
};

/** Form values → mutation payload (optionals as undefined, not ""). */
export function couponFormToMutationValues(values: CouponFormData) {
  return {
    code: values.code,
    label: values.label?.trim() || undefined,
    discountType: values.discountType,
    discountValue: parseFloat(values.discountValue),
    expiresAt: values.expiresAt
      ? bucharestEndOfDayMs(values.expiresAt)
      : undefined,
    maxRedemptions: values.maxRedemptions
      ? parseInt(values.maxRedemptions, 10)
      : undefined,
    minOrderValue: values.minOrderValue
      ? parseFloat(values.minOrderValue)
      : undefined,
    appliesTo: values.appliesTo,
    isActive: values.isActive,
  };
}

function generateCouponCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  return Array.from(
    crypto.getRandomValues(new Uint32Array(8)),
    (n) => alphabet[n % alphabet.length],
  ).join("");
}

interface CouponFormFieldsProps {
  form: UseFormReturn<CouponFormData>;
  isSubmitting: boolean;
}

export function CouponFormFields({
  form,
  isSubmitting,
}: CouponFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    {...field}
                    disabled={isSubmitting}
                    placeholder="e.g., SUMMER2026"
                    className="uppercase font-mono"
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={isSubmitting}
                  onClick={() =>
                    form.setValue("code", generateCouponCode(), {
                      shouldValidate: true,
                    })
                  }
                  title="Generate random code"
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label (Optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isSubmitting}
                  placeholder="Internal note, e.g., Summer campaign"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="discountType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed amount (EUR)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discountValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {form.watch("discountType") === "percentage"
                  ? "Discount (%)"
                  : "Discount (EUR)"}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isSubmitting}
                  placeholder={
                    form.watch("discountType") === "percentage"
                      ? "e.g., 15"
                      : "e.g., 20"
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expires (Optional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isSubmitting} />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Valid through end of day, Romania time
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxRedemptions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Redemptions (Optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isSubmitting}
                  placeholder="Unlimited if empty"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="minOrderValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Order (EUR, Optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isSubmitting}
                  placeholder="No minimum if empty"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="appliesTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Applies To</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="both">Rentals & Transfers</SelectItem>
                  <SelectItem value="rentals">Rentals only</SelectItem>
                  <SelectItem value="transfers">Transfers only</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="isActive"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isSubmitting}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Active</FormLabel>
              <p className="text-xs text-muted-foreground">
                Inactive coupons are rejected at checkout immediately
              </p>
            </div>
          </FormItem>
        )}
      />
    </>
  );
}
