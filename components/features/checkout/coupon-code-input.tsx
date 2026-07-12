"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle2, TicketPercent, X } from "lucide-react";

export interface AppliedCoupon {
  code: string;
  /** Server-computed advisory amount — display only; redemption recomputes. */
  discountAmount: number;
}

interface CouponCodeInputProps {
  bookingType: "rentals" | "transfers";
  /** Pre-discount total from the price breakdown; null while not computable. */
  subtotal: number | null;
  /** Customer email, so the once-per-user check also runs in the preview. */
  email?: string;
  /**
   * Fired with the validated coupon (or null when removed/invalidated).
   * Pass a stable function (e.g. a setState setter).
   */
  onAppliedChange: (applied: AppliedCoupon | null) => void;
  className?: string;
}

/**
 * Self-contained coupon field shared by the reservation and transfer
 * checkouts. Validation runs through the reactive `validateCoupon` query, so
 * an applied code is re-checked automatically whenever the subtotal changes
 * (e.g. new dates drop the order below the coupon's minimum).
 */
export function CouponCodeInput({
  bookingType,
  subtotal,
  email,
  onAppliedChange,
  className,
}: CouponCodeInputProps) {
  const t = useTranslations("common.coupon");
  const [inputValue, setInputValue] = React.useState("");
  const [submittedCode, setSubmittedCode] = React.useState<string | null>(null);

  const result = useQuery(
    api.coupons.validateCoupon,
    submittedCode && subtotal !== null && subtotal > 0
      ? {
          code: submittedCode,
          bookingType,
          subtotal,
          email: email?.trim() || undefined,
        }
      : "skip",
  );

  React.useEffect(() => {
    onAppliedChange(
      submittedCode && result?.valid
        ? { code: result.code, discountAmount: result.discountAmount }
        : null,
    );
  }, [result, submittedCode, onAppliedChange]);

  const handleApply = () => {
    const code = inputValue.trim();
    if (code) setSubmittedCode(code);
  };

  const handleRemove = () => {
    setSubmittedCode(null);
    setInputValue("");
  };

  const isChecking = submittedCode !== null && result === undefined;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TicketPercent className="h-5 w-5" />
          <span>{t("title")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {result?.valid && submittedCode ? (
          <div className="flex items-center justify-between rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-3">
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                {t("applied", { code: result.code })}
                {": "}
                <span className="font-semibold">
                  −{result.discountAmount} EUR
                </span>
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              aria-label={t("remove")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value.toUpperCase());
                setSubmittedCode(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApply();
                }
              }}
              placeholder={t("placeholder")}
              className="uppercase"
              maxLength={32}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleApply}
              disabled={!inputValue.trim() || subtotal === null || isChecking}
            >
              {isChecking ? t("checking") : t("apply")}
            </Button>
          </div>
        )}
        {result && !result.valid && submittedCode && (
          <p className="text-sm text-destructive">
            {t(`errors.${result.reason}`)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
