"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface AffiliateConversionsDialogProps {
  affiliateId: Id<"affiliates">;
  slug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AffiliateConversionsDialog({
  affiliateId,
  slug,
  open,
  onOpenChange,
}: AffiliateConversionsDialogProps) {
  const conversions = useQuery(api.affiliates.listConversions, {
    affiliateId,
  });
  const voidConversion = useMutation(api.affiliates.voidConversion);
  const [voidingId, setVoidingId] =
    React.useState<Id<"referralConversions"> | null>(null);

  const handleVoid = async (conversionId: Id<"referralConversions">) => {
    setVoidingId(conversionId);
    try {
      await voidConversion({ conversionId });
      toast.success("Conversion voided", {
        description: "The referrer's counter has been decremented.",
        position: "bottom-left",
      });
    } catch (error) {
      console.error("Error voiding conversion:", error);
      toast.error("Failed to void conversion", { position: "bottom-left" });
    } finally {
      setVoidingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Conversions — /r/{slug}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          {conversions === undefined ? (
            <p className="text-sm text-muted-foreground py-4">Loading...</p>
          ) : conversions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No conversions yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Referred email</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversions.map((conversion) => (
                  <TableRow key={conversion._id}>
                    <TableCell>
                      {new Date(conversion.createdAt).toLocaleDateString(
                        "en-GB",
                      )}
                    </TableCell>
                    <TableCell className="capitalize">
                      {conversion.bookingType}
                    </TableCell>
                    <TableCell>{conversion.referredEmail}</TableCell>
                    <TableCell className="text-right">
                      {conversion.referredDiscountAmount > 0
                        ? `${conversion.referredDiscountAmount} EUR`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          conversion.status === "confirmed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {conversion.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {conversion.status !== "voided" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={voidingId === conversion._id}
                          onClick={() => handleVoid(conversion._id)}
                        >
                          {voidingId === conversion._id
                            ? "Voiding..."
                            : "Void"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
