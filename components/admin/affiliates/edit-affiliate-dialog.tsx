"use client";

import * as React from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface EditAffiliateDialogProps {
  affiliate: {
    _id: Id<"affiliates">;
    slug: string;
    rewardPercentOverride?: number;
    referredDiscountOverride?: {
      type: "percentage" | "fixed";
      value: number;
    };
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Slug + per-affiliate overrides. An empty override field falls back to the
 * global settings; a filled one replaces them for this affiliate only.
 */
export function EditAffiliateDialog({
  affiliate,
  open,
  onOpenChange,
}: EditAffiliateDialogProps) {
  const updateAffiliate = useMutation(api.affiliates.updateAffiliate);
  const [slug, setSlug] = React.useState(affiliate.slug);
  const [rewardOverride, setRewardOverride] = React.useState(
    affiliate.rewardPercentOverride !== undefined
      ? String(affiliate.rewardPercentOverride)
      : "",
  );
  const [referredType, setReferredType] = React.useState<
    "percentage" | "fixed"
  >(affiliate.referredDiscountOverride?.type ?? "fixed");
  const [referredValue, setReferredValue] = React.useState(
    affiliate.referredDiscountOverride
      ? String(affiliate.referredDiscountOverride.value)
      : "",
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateAffiliate({
        id: affiliate._id,
        slug,
        rewardPercentOverride:
          rewardOverride.trim() === "" ? null : Number(rewardOverride),
        referredDiscountOverride:
          referredValue.trim() === ""
            ? null
            : { type: referredType, value: Number(referredValue) },
      });
      toast.success("Affiliate updated", { position: "bottom-left" });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating affiliate:", error);
      toast.error("Failed to update affiliate", {
        description:
          error instanceof Error ? error.message : "Please try again.",
        position: "bottom-left",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Affiliate</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-slug">Referral slug</Label>
            <Input
              id="edit-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
            />
            <p className="text-xs text-muted-foreground">
              Changing the slug breaks previously shared links.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-reward-override">
              Reward override (%) — blank uses the tier table
            </Label>
            <Input
              id="edit-reward-override"
              type="number"
              min={0}
              max={100}
              step="0.5"
              placeholder="from tiers"
              value={rewardOverride}
              onChange={(e) => setRewardOverride(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>
              Referred discount override — blank uses global settings
            </Label>
            <div className="flex gap-2">
              <Select
                value={referredType}
                onValueChange={(value) =>
                  setReferredType(value as "percentage" | "fixed")
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed (EUR)</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="from settings"
                value={referredValue}
                onChange={(e) => setReferredValue(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting || !slug.trim()}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
