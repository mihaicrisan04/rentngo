"use client";

import * as React from "react";
import { useQuery } from "convex/react";
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

  const preview = useQuery(
    api.wallet.previewRedemption,
    totalAfterDiscount !== null && totalAfterDiscount > 0
      ? { totalAfterDiscount }
      : "skip",
  );

  const canRedeem =
    (preview?.programEnabled && preview.redeemable > 0) ?? false;

  return {
    balance: preview?.balance ?? 0,
    applied: canRedeem && selected ? (preview?.redeemable ?? 0) : 0,
    maxRedemptionPercent: preview?.maxRedemptionPercent ?? 0,
    canRedeem,
    selected,
    setSelected,
  };
}
