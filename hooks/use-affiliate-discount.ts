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
  kind: "referred";
  slug: string;
  /** Advisory amount — the booking mutation recomputes server-side. */
  discountAmount: number;
}

/**
 * Automatic referred-customer discount for the checkout: the referral
 * cookie's {slug, visitorKey} pair, validated server-side against the
 * recorded attribution. Advisory only; the caller passes `referral` into the
 * booking mutation, which re-resolves everything and lets an explicit coupon
 * win the single-discount rule.
 *
 * A referrer's own reward is no longer a discount here — it accrues as wallet
 * credit and is redeemed through useWalletCredit (RNGO-50).
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

  // The own-tier reward the backend can still answer with is ignored: v2 pays
  // referrers in wallet credit, so only the referred-customer discount is a
  // discount. The branch goes away with the backend's `reward` kind.
  return {
    referral,
    affiliateDiscount: preview?.kind === "referred" ? preview : null,
  };
}
