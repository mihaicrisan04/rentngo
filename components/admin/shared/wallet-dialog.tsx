"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";

const KIND_LABEL = {
  referralCredit: "Referral credit",
  creditReversal: "Credit reversed",
  manualAdjustment: "Manual adjustment",
  redemption: "Redeemed on a booking",
  redemptionReversal: "Redemption refunded",
} as const;

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString("en-GB");

interface WalletDialogProps {
  userId: Id<"users">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Balance, expiry nudge, ledger and manual top-up for one user. Reachable
 * from both the affiliates table and the users table, because an offline
 * referrer may not be an affiliate yet.
 */
export function WalletDialog({
  userId,
  open,
  onOpenChange,
}: WalletDialogProps) {
  const wallet = useQuery(api.wallet.listWalletTransactions, { userId });
  const adjustWallet = useMutation(api.wallet.adjustWallet);
  const [amount, setAmount] = React.useState("");
  const [note, setNote] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleAdjust = async () => {
    setIsSubmitting(true);
    try {
      const result = await adjustWallet({
        userId,
        amount: Number(amount),
        note,
      });
      toast.success("Wallet adjusted", {
        description: `New balance: ${formatPrice(result.balance)}.`,
        position: "bottom-left",
      });
      setAmount("");
      setNote("");
    } catch (error) {
      console.error("Error adjusting wallet:", error);
      toast.error("Failed to adjust wallet", {
        description:
          error instanceof Error ? error.message : "Please try again.",
        position: "bottom-left",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    !isSubmitting &&
    note.trim().length > 0 &&
    amount.trim() !== "" &&
    Number.isFinite(Number(amount)) &&
    Number(amount) !== 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Wallet — {wallet?.userName ?? "…"}</DialogTitle>
          <DialogDescription>
            {wallet?.userEmail ?? "Loading the ledger…"}
          </DialogDescription>
        </DialogHeader>

        {wallet === undefined ? (
          <p className="text-sm text-muted-foreground py-4">Loading...</p>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 rounded-lg border p-3">
              <div>
                <div className="text-xs text-muted-foreground">
                  Available balance
                </div>
                <div className="text-2xl font-semibold">
                  {formatPrice(wallet.balance)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Expiring soonest
                </div>
                <div className="text-sm">
                  {wallet.nextExpiry
                    ? `${formatPrice(wallet.nextExpiry.amount)} on ${formatDate(wallet.nextExpiry.expiresAt)}`
                    : "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Redemption cap
                </div>
                <div className="text-sm">
                  {wallet.maxRedemptionPercent}% of a booking
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="wallet-amount">Add credit</Label>
                <p className="text-sm text-muted-foreground">
                  Positive tops the wallet up (offline referrals); negative
                  claws credit back and is refused if it would push the balance
                  below zero.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="space-y-1 sm:w-40">
                  <Label
                    htmlFor="wallet-amount"
                    className="text-xs text-muted-foreground"
                  >
                    Amount (EUR)
                  </Label>
                  <Input
                    id="wallet-amount"
                    type="number"
                    step="0.01"
                    placeholder="25.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="wallet-note"
                    className="text-xs text-muted-foreground"
                  >
                    Note (required)
                  </Label>
                  <Input
                    id="wallet-note"
                    placeholder="Offline referral — Maria P."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                <Button onClick={handleAdjust} disabled={!canSubmit}>
                  {isSubmitting ? "Saving..." : "Apply"}
                </Button>
              </div>
            </div>

            <ScrollArea className="max-h-[40vh]">
              {wallet.transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No wallet activity yet.
                </p>
              ) : (
                <Table dense>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wallet.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                        <TableCell>{KIND_LABEL[transaction.kind]}</TableCell>
                        <TableCell
                          className={
                            transaction.amount >= 0
                              ? "text-right text-green-600"
                              : "text-right text-red-600"
                          }
                        >
                          {transaction.amount >= 0 ? "+" : "−"}
                          {formatPrice(Math.abs(transaction.amount))}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {transaction.expiresAt
                            ? formatDate(transaction.expiresAt)
                            : "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {transaction.note ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
