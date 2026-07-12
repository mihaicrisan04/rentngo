"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface TermsAcceptanceProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
}

/**
 * Terms & privacy acceptance row shared by the reservation and transfer
 * checkouts. The locale ternary is inherited as-is; converting it to
 * `t.rich` message keys belongs to the i18n consolidation (RNGO-19).
 */
export function TermsAcceptance({
  checked,
  onCheckedChange,
  error,
}: TermsAcceptanceProps) {
  const locale = useLocale();

  return (
    <div className="pt-4 border-t">
      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms-conditions"
          checked={checked}
          onCheckedChange={(next) => onCheckedChange(next === true)}
        />
        <div className="text-sm leading-relaxed">
          {locale === "ro" ? (
            <>
              Accept{" "}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline"
              >
                Termenii și Condițiile
              </Link>{" "}
              și{" "}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline"
              >
                Politica de Confidențialitate
              </Link>
            </>
          ) : (
            <>
              I accept the{" "}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline"
              >
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline"
              >
                Privacy Policy
              </Link>
            </>
          )}
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}
