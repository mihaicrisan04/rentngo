"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutPaymentMethods } from "@/components/features/checkout/checkout-payment-methods";
import { TermsAcceptance } from "@/components/features/checkout/terms-acceptance";
import type { PaymentMethod } from "@/lib/checkout-payment-methods";
import type { FormErrors } from "@/lib/reservation-schema";

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod | "";
  onPaymentMethodChange: (method: PaymentMethod) => void;
  termsAccepted: boolean;
  onTermsAcceptedChange: (accepted: boolean) => void;
  errors?: FormErrors["payment"];
}

export const PaymentMethodCard = React.memo(function PaymentMethodCard({
  paymentMethod,
  onPaymentMethodChange,
  termsAccepted,
  onTermsAcceptedChange,
  errors,
}: PaymentMethodCardProps) {
  const t = useTranslations("reservationPage");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>{t("paymentMethod.title")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <CheckoutPaymentMethods
            value={paymentMethod}
            onChange={onPaymentMethodChange}
            error={errors?.method}
            variant="bordered"
          />

          <TermsAcceptance
            checked={termsAccepted}
            onCheckedChange={onTermsAcceptedChange}
            error={errors?.termsAccepted}
          />
        </div>
      </CardContent>
    </Card>
  );
});
