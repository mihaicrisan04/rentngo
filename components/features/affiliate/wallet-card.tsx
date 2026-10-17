"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet } from "lucide-react";

/**
 * The customer's wallet: balance, credit about to lapse and the ledger.
 * Independent of the affiliate card — credit can also arrive as an admin
 * top-up for an offline referral, so anyone may hold it. `getMyWallet` is
 * null while the referral program is off, and then nothing renders.
 */
export function WalletCard() {
  const t = useTranslations("profile.affiliate.wallet");
  const tWallet = useTranslations("common.wallet");
  const locale = useLocale();
  const wallet = useQuery(api.wallet.getMyWallet);

  if (!wallet) return null;

  const formatLedgerDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString(locale);

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          {t("title")}
        </CardTitle>
        <CardDescription>
          {tWallet("capNote", { percent: wallet.maxRedemptionPercent })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-muted/50 p-4 text-center">
            <p className="text-3xl font-bold">
              {wallet.balance.toFixed(2)} EUR
            </p>
            <p className="text-sm text-muted-foreground">{t("balance")}</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4 text-center">
            <p className="text-3xl font-bold">
              {wallet.rewardsEarned.toFixed(2)} EUR
            </p>
            <p className="text-sm text-muted-foreground">
              {t("rewardsEarned")}
            </p>
          </div>
        </div>

        {wallet.expiringSoon && (
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
            {t("expiringSoon", {
              amount: wallet.expiringSoon.amount.toFixed(2),
              date: formatLedgerDate(wallet.expiringSoon.expiresAt),
            })}
          </p>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium">{t("ledger")}</p>
          {wallet.transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          ) : (
            <div className="space-y-1">
              {wallet.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/50 px-3 py-2 text-sm"
                >
                  <span>
                    {t(`kinds.${transaction.kind}`)}
                    <span className="text-muted-foreground ml-2">
                      {formatLedgerDate(transaction.createdAt)}
                    </span>
                  </span>
                  <span
                    className={
                      transaction.amount >= 0
                        ? "font-medium text-green-600"
                        : "font-medium"
                    }
                  >
                    {transaction.amount >= 0 ? "+" : "−"}
                    {Math.abs(transaction.amount).toFixed(2)} EUR
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
