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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { formatPrice } from "@/lib/format";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";

/**
 * A decision returns the status the conversion actually landed on, not the
 * requested one: a booking cancelled while the row sat in the queue comes
 * back `voided`, and a second click comes back unchanged.
 */
function toastDecision(
  status: string,
  requested: "approved" | "rejected",
): void {
  if (status === requested) {
    toast.success(
      requested === "approved" ? "Conversion approved" : "Conversion rejected",
      {
        description:
          requested === "approved"
            ? "The referrer's wallet credit has been minted."
            : "No credit was granted.",
        position: "bottom-left",
      },
    );
    return;
  }
  if (status === "voided") {
    toast.warning("Conversion voided instead", {
      description: "Its booking is no longer live, so no credit was granted.",
      position: "bottom-left",
    });
    return;
  }
  toast.info("Nothing to do", {
    description: `The conversion is already ${status}.`,
    position: "bottom-left",
  });
}

export function ReferralApprovalsTable() {
  const approvals = useQuery(api.affiliates.listPendingApprovals);
  const approveConversion = useMutation(api.affiliates.approveConversion);
  const rejectConversion = useMutation(api.affiliates.rejectConversion);
  const [busyId, setBusyId] = React.useState<Id<"referralConversions"> | null>(
    null,
  );
  const [rejecting, setRejecting] =
    React.useState<Id<"referralConversions"> | null>(null);
  const [reason, setReason] = React.useState("");

  const handleApprove = async (conversionId: Id<"referralConversions">) => {
    setBusyId(conversionId);
    try {
      const { status } = await approveConversion({ conversionId });
      toastDecision(status, "approved");
    } catch (error) {
      console.error("Error approving conversion:", error);
      toast.error("Failed to approve", {
        description:
          error instanceof Error ? error.message : "Please try again.",
        position: "bottom-left",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async () => {
    if (!rejecting) return;
    setBusyId(rejecting);
    try {
      const { status } = await rejectConversion({
        conversionId: rejecting,
        reason: reason.trim() || undefined,
      });
      toastDecision(status, "rejected");
      setRejecting(null);
      setReason("");
    } catch (error) {
      console.error("Error rejecting conversion:", error);
      toast.error("Failed to reject", {
        description:
          error instanceof Error ? error.message : "Please try again.",
        position: "bottom-left",
      });
    } finally {
      setBusyId(null);
    }
  };

  if (approvals === undefined) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }
  if (approvals.length === 0) {
    return (
      <EmptyState
        icon={CheckCheck}
        message="Nothing waiting for approval. Conversions land here once their rental is marked completed."
      />
    );
  }

  return (
    <>
      <Table containerClassName="overflow-x-visible" dense>
        <TableHeader sticky>
          <TableRow>
            <TableHead>Referrer</TableHead>
            <TableHead>Referred</TableHead>
            <TableHead>Booking</TableHead>
            <TableHead className="text-right">Booking total</TableHead>
            <TableHead className="text-right">Credit to grant</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {approvals.map((approval) => (
            <TableRow key={approval._id}>
              <TableCell>
                <div>{approval.referrerName}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  /r/{approval.referrerSlug}
                </div>
              </TableCell>
              <TableCell>{approval.referredEmail}</TableCell>
              <TableCell>
                <div className="capitalize">{approval.bookingType}</div>
                <div className="text-xs text-muted-foreground">
                  {approval.bookingNumber === null
                    ? "deleted"
                    : `#${approval.bookingNumber}`}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {approval.bookingTotal === null
                  ? "—"
                  : formatPrice(approval.bookingTotal)}
              </TableCell>
              <TableCell className="text-right">
                <div>{formatPrice(approval.projectedCredit)}</div>
                <div className="text-xs text-muted-foreground">
                  {approval.projectedRewardPercent}%
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    disabled={busyId === approval._id}
                    onClick={() => handleApprove(approval._id)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === approval._id}
                    onClick={() => {
                      setRejecting(approval._id);
                      setReason("");
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={rejecting !== null}
        onOpenChange={(open) => !open && setRejecting(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject conversion</DialogTitle>
            <DialogDescription>
              The referrer earns nothing for this referral. The reason is kept
              on the conversion for the history table.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason</Label>
            <Textarea
              id="reject-reason"
              rows={3}
              placeholder="Suspected self-referral"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejecting(null)}
              disabled={busyId !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={busyId !== null}
            >
              {busyId !== null ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
