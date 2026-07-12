"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  getConsentStatus,
  setConsentStatus,
  CONSENT_GRANTED_EVENT,
} from "@/lib/referral";

/**
 * Minimal cookie-consent gate (RNGO-26). No consent mechanism existed in the
 * app (GTM is loaded without consent mode), so this is a small self-contained
 * banner whose only current consumer is the referral-attribution cookie:
 * nothing referral-related is stored before the visitor accepts, and a
 * decline means no attribution at all. Flagged for review — if a full CMP /
 * GTM consent mode is adopted later, this banner is the seam to replace.
 */
export function CookieConsentBanner() {
  const t = useTranslations("common.consent");
  const [visible, setVisible] = React.useState(false);

  // Cookie state is only known client-side; deciding in an effect avoids a
  // hydration mismatch
  React.useEffect(() => {
    setVisible(getConsentStatus() === "unset");
  }, []);

  if (!visible) return null;

  const choose = (status: "granted" | "denied") => {
    setConsentStatus(status);
    setVisible(false);
    if (status === "granted") {
      window.dispatchEvent(new Event(CONSENT_GRANTED_EVENT));
    }
  };

  return (
    <div
      role="dialog"
      aria-label={t("title")}
      className="fixed bottom-0 inset-x-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 p-4"
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 max-w-5xl">
        <div className="flex-1 text-sm">
          <p className="font-medium">{t("title")}</p>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => choose("denied")}
          >
            {t("decline")}
          </Button>
          <Button
            size="sm"
            className="rounded-xl"
            onClick={() => choose("granted")}
          >
            {t("accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
