"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { List, Pencil } from "lucide-react";
import { toast } from "sonner";
import { EditAffiliateDialog } from "@/components/admin/affiliates/edit-affiliate-dialog";
import { AffiliateConversionsDialog } from "@/components/admin/affiliates/affiliate-conversions-dialog";

export function AffiliatesTable() {
  const affiliates = useQuery(api.affiliates.listAffiliates);
  const updateAffiliate = useMutation(api.affiliates.updateAffiliate);
  const [editing, setEditing] = React.useState<Id<"affiliates"> | null>(null);
  const [viewingConversions, setViewingConversions] =
    React.useState<Id<"affiliates"> | null>(null);

  if (affiliates === undefined) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }
  if (affiliates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No affiliates yet. Add one to hand out a referral link.
      </p>
    );
  }

  const toggleActive = async (id: Id<"affiliates">, isActive: boolean) => {
    try {
      await updateAffiliate({ id, isActive });
    } catch (error) {
      console.error("Error toggling affiliate:", error);
      toast.error("Failed to update affiliate", { position: "bottom-left" });
    }
  };

  const editingAffiliate = affiliates.find((a) => a._id === editing) ?? null;
  const conversionsAffiliate =
    affiliates.find((a) => a._id === viewingConversions) ?? null;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Slug</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="text-right">Conversions</TableHead>
            <TableHead className="text-right">Reward</TableHead>
            <TableHead>Overrides</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {affiliates.map((affiliate) => (
            <TableRow key={affiliate._id}>
              <TableCell className="font-mono">/r/{affiliate.slug}</TableCell>
              <TableCell>
                <div>{affiliate.userName}</div>
                <div className="text-xs text-muted-foreground">
                  {affiliate.userEmail}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {affiliate.confirmedConversions}
              </TableCell>
              <TableCell className="text-right">
                {affiliate.currentRewardPercent}%
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {affiliate.rewardPercentOverride !== undefined && (
                    <Badge variant="secondary">
                      reward {affiliate.rewardPercentOverride}%
                    </Badge>
                  )}
                  {affiliate.referredDiscountOverride && (
                    <Badge variant="secondary">
                      referred{" "}
                      {affiliate.referredDiscountOverride.type === "percentage"
                        ? `${affiliate.referredDiscountOverride.value}%`
                        : `${affiliate.referredDiscountOverride.value} EUR`}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Switch
                  checked={affiliate.isActive}
                  onCheckedChange={(checked) =>
                    toggleActive(affiliate._id, checked)
                  }
                  aria-label={`Toggle ${affiliate.slug}`}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="View conversions"
                    onClick={() => setViewingConversions(affiliate._id)}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit affiliate"
                    onClick={() => setEditing(affiliate._id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingAffiliate && (
        <EditAffiliateDialog
          affiliate={editingAffiliate}
          open
          onOpenChange={(open) => !open && setEditing(null)}
        />
      )}
      {conversionsAffiliate && (
        <AffiliateConversionsDialog
          affiliateId={conversionsAffiliate._id}
          slug={conversionsAffiliate.slug}
          open
          onOpenChange={(open) => !open && setViewingConversions(null)}
        />
      )}
    </>
  );
}
