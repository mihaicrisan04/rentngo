"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  getConsentStatus,
  getStoredReferral,
  setStoredReferral,
  CONSENT_GRANTED_EVENT,
  REFERRAL_CAPTURED_EVENT,
} from "@/lib/referral";

/**
 * Consent-gated referral capture (RNGO-26). /r/<slug> redirects here with
 * ?ref=<slug>; this component records the attribution and sets the referral
 * cookie — strictly AFTER cookie consent:
 * - consent already granted: capture immediately
 * - consent not decided yet: wait for the banner's accept event (a decline,
 *   or navigating away before deciding, loses the referral — owner-accepted)
 * - consent denied: never capture
 * Last-click wins: a newer ?ref overwrites the stored slug, reusing the
 * visitor's key so the server keeps one attribution row per visitor.
 */
function ReferralCaptureInner() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const recordAttribution = useMutation(
    api.affiliates.recordReferralAttribution,
  );

  React.useEffect(() => {
    if (!ref) return;

    let cancelled = false;
    const capture = async () => {
      const visitorKey =
        getStoredReferral()?.visitorKey ?? crypto.randomUUID();
      try {
        // Validates the slug (active affiliate, program enabled, not a
        // self-referral) and records the attribution row the booking
        // mutation will check the cookie against
        const result = await recordAttribution({ slug: ref, visitorKey });
        if (result && !cancelled) {
          setStoredReferral(
            { slug: ref, visitorKey },
            result.attributionWindowDays,
          );
          // Wake any already-mounted checkout so it re-reads the cookie
          window.dispatchEvent(new Event(REFERRAL_CAPTURED_EVENT));
        }
      } catch {
        // Attribution is best-effort; never disturb the visit
      }
    };

    const status = getConsentStatus();
    if (status === "granted") {
      void capture();
      return;
    }
    if (status === "denied") return;

    const onGranted = () => void capture();
    window.addEventListener(CONSENT_GRANTED_EVENT, onGranted);
    return () => {
      cancelled = true;
      window.removeEventListener(CONSENT_GRANTED_EVENT, onGranted);
    };
  }, [ref, recordAttribution]);

  return null;
}

export function ReferralCapture() {
  return (
    <React.Suspense fallback={null}>
      <ReferralCaptureInner />
    </React.Suspense>
  );
}
