"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  getStoredReferral,
  REFERRAL_CAPTURED_EVENT,
  type StoredReferral,
} from "@/lib/referral";

export interface AffiliateDiscountPreview {
  kind: "referred" | "reward";
  slug: string;
  /** Advisory amount — the booking mutation recomputes server-side. */
  discountAmount: number;
}

/**
 * Automatic affiliate discount for the checkout: the referral cookie's
 * {slug, visitorKey} pair (validated server-side against the recorded
 * attribution) or the signed-in user's own tier reward. Advisory only; the
 * caller passes `referral` into the booking mutation, which re-resolves
 * everything and lets an explicit coupon win the single-discount rule.
 */
export function useAffiliateDiscount({
  subtotal,
  email,
}: {
  subtotal: number | null;
  email?: string;
}): {
  referral: StoredReferral | null;
  affiliateDiscount: AffiliateDiscountPreview | null;
} {
  // Cookies exist only client-side; read in an effect to stay SSR-safe.
  // ReferralCapture writes the cookie asynchronously (after its mutation), so
  // also re-read on its captured event — a checkout that mounted before the
  // write must not silently drop the referral. Submit paths additionally read
  // the cookie fresh (see the booking pages) so the payload never depends on
  // this state being current.
  const [referral, setReferral] = React.useState<StoredReferral | null>(null);
  React.useEffect(() => {
    const read = () => setReferral(getStoredReferral());
    read();
    window.addEventListener(REFERRAL_CAPTURED_EVENT, read);
    return () => window.removeEventListener(REFERRAL_CAPTURED_EVENT, read);
  }, []);

  const preview = useQuery(
    api.affiliates.previewAffiliateDiscount,
    subtotal !== null && subtotal > 0
      ? {
          referral: referral ?? undefined,
          subtotal,
          email: email?.trim() || undefined,
        }
      : "skip",
  );

  return { referral, affiliateDiscount: preview ?? null };
}
