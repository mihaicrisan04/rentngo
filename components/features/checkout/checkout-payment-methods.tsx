"use client";

import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/lib/checkout-payment-methods";
import { cn } from "@/lib/utils";

interface CheckoutPaymentMethodsProps {
  value: PaymentMethod | "";
  onChange: (value: PaymentMethod) => void;
  error?: string;
  /** "plain" = reservation checkout rows; "bordered" = transfer card rows. */
  variant?: "plain" | "bordered";
}

/**
 * Translated payment-method radio group shared by the reservation and
 * transfer checkouts (single source for the method list).
 */
export function CheckoutPaymentMethods({
  value,
  onChange,
  error,
  variant = "plain",
}: CheckoutPaymentMethodsProps) {
  const t = useTranslations("reservationPage");

  const methods = PAYMENT_METHODS.map((method) => ({
    id: method.id,
    label: t(`payment.methods.${method.translationKey}.label`),
    description: t(`payment.methods.${method.translationKey}.description`),
    disabled: method.disabled,
  }));

  return (
    <>
      <RadioGroup
        value={value}
        onValueChange={(next) => onChange(next as PaymentMethod)}
        className={variant === "plain" ? "space-y-3" : undefined}
      >
        {methods.map((method) =>
          variant === "plain" ? (
            <div
              key={method.id}
              className={`flex items-start space-x-3 ${method.disabled ? "opacity-50" : ""}`}
            >
              <RadioGroupItem
                value={method.id}
                id={method.id}
                className="mt-1"
                disabled={method.disabled}
              />
              <div className="flex-1">
                <Label
                  htmlFor={method.id}
                  className={`${method.disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="font-medium">{method.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {method.description}
                  </div>
                </Label>
              </div>
            </div>
          ) : (
            <label
              key={method.id}
              htmlFor={method.id}
              className={cn(
                "flex items-center space-x-3 rounded-xl border p-4 cursor-pointer transition-colors",
                value === method.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50",
                method.disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              <RadioGroupItem
                value={method.id}
                id={method.id}
                disabled={method.disabled}
              />
              <div className="flex-1">
                <Label
                  htmlFor={method.id}
                  className="font-medium cursor-pointer"
                >
                  {method.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {method.description}
                </p>
              </div>
            </label>
          ),
        )}
      </RadioGroup>
      {error && (
        <p className="text-sm text-red-500 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </>
  );
}
