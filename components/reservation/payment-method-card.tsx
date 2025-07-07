import * as React from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle, CreditCard } from "lucide-react";
import { paymentMethods } from "@/lib/reservationUtils";
import { FormErrors } from "@/hooks/useReservationForm";

interface PaymentMethodCardProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  termsAccepted: boolean;
  setTermsAccepted: (accepted: boolean) => void;
  errors: FormErrors;
}

export function PaymentMethodCard({
  paymentMethod,
  setPaymentMethod,
  termsAccepted,
  setTermsAccepted,
  errors
}: PaymentMethodCardProps) {
  const t = useTranslations('reservationPage');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>{t('paymentMethod.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <RadioGroup
            value={paymentMethod}
            onValueChange={setPaymentMethod}
            className="space-y-3"
          >
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-start space-x-3">
                <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={method.id} className="cursor-pointer">
                    <div className="font-medium">{t(`payment.methods.${method.id}.label`)}</div>
                    <div className="text-sm text-muted-foreground">{t(`payment.methods.${method.id}.description`)}</div>
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
          
          {errors.payment?.method && (
            <p className="text-sm text-red-500 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.payment.method}
            </p>
          )}
          
          <div className="pt-4 border-t">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms-conditions"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              />
              <Label htmlFor="terms-conditions" className="text-sm cursor-pointer">
                {t('paymentMethod.termsAcceptance')}
              </Label>
            </div>
            {errors.payment?.termsAccepted && (
              <p className="text-sm text-red-500 mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.payment.termsAccepted}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 