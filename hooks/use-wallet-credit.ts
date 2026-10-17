"use client";

import * as React from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export interface WalletCreditSelection {
  /** Spendable balance, so the switch can name it. */
  balance: number;
  /** What this booking would actually redeem — capped, advisory. */
  applied: number;
  /** Share of the post-discount total credit may cover, for the cap note. */
  maxRedemptionPercent: number;
  /** False hides the switch: signed out, empty wallet or program off. */
  canRedeem: boolean;
  selected: boolean;
  setSelected: (selected: boolean) => void;
  /** What the booking mutation receives — never `true` without a preview. */
  submitValue: true | undefined;
}

/**
 * Wallet credit for the checkout, mirroring useAffiliateDiscount: the preview
 * is advisory and the booking mutation only ever receives the boolean —
 * `redeemWalletCredit` recomputes the amount server-side from the
 * server-recomputed total, so a stale or tampered preview cannot overspend.
 *
 * `totalAfterDiscount` is the post-discount total, because credit is a
 * payment on what is still owed rather than another discount.
 */
export function useWalletCredit({
  totalAfterDiscount,
}: {
  totalAfterDiscount: number | null;
}): WalletCreditSelection {
  const [selected, setSelected] = React.useState(false);
  // Guests have no wallet, so an unauthenticated subscription would only ever
  // answer zeroes for every visitor on the page.
  const { isAuthenticated } = useConvexAuth();

  const preview = useQuery(
    api.wallet.previewRedemption,
    isAuthenticated && totalAfterDiscount !== null && totalAfterDiscount > 0
      ? { totalAfterDiscount }
      : "skip",
  );

  const canRedeem =
    (preview?.programEnabled && preview.redeemable > 0) ?? false;

  // A total change re-runs the preview; a preview that comes back with
  // nothing to redeem clears the switch during render (React's documented
  // alternative to an effect) so a later change cannot silently re-enable it.
  if (selected && preview !== undefined && preview.redeemable <= 0) {
    setSelected(false);
  }

  const active = canRedeem && selected;

  return {
    balance: preview?.balance ?? 0,
    applied: active ? (preview?.redeemable ?? 0) : 0,
    maxRedemptionPercent: preview?.maxRedemptionPercent ?? 0,
    canRedeem,
    selected,
    setSelected,
    submitValue: active ? true : undefined,
  };
}
