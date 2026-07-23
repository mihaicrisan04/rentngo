"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface TermsAcceptanceProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
}

export function TermsAcceptance({
  checked,
  onCheckedChange,
  error,
}: TermsAcceptanceProps) {
  const t = useTranslations("common");
  const termsLink = (chunks: ReactNode) => (
    <Link
      href="/terms"
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:text-primary/80 underline"
    >
      {chunks}
    </Link>
  );
  const privacyLink = (chunks: ReactNode) => (
    <Link
      href="/privacy"
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:text-primary/80 underline"
    >
      {chunks}
    </Link>
  );

  return (
    <div className="pt-4 border-t">
      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms-conditions"
          checked={checked}
          onCheckedChange={(next) => onCheckedChange(next === true)}
        />
        <div className="text-sm leading-relaxed">
          {t.rich("termsAcceptance", {
            terms: termsLink,
            privacy: privacyLink,
          })}
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
