"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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
import { toast } from "sonner";

interface CreateAffiliateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAffiliateDialog({
  open,
  onOpenChange,
}: CreateAffiliateDialogProps) {
  const createAffiliate = useMutation(api.affiliates.createAffiliate);
  const [userEmail, setUserEmail] = useState("");
  const [slug, setSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await createAffiliate({ userEmail, slug });
      toast.success("Affiliate created", {
        description: `rngo.ro/r/${slug.trim().toLowerCase()} is live.`,
        position: "bottom-left",
      });
      setUserEmail("");
      setSlug("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating affiliate:", error);
      toast.error("Failed to create affiliate", {
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
          <DialogTitle>Add Affiliate</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="affiliate-email">User email</Label>
            <Input
              id="affiliate-email"
              type="email"
              placeholder="user@example.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The user must have signed in at least once.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="affiliate-slug">Referral slug</Label>
            <Input
              id="affiliate-slug"
              placeholder="john-doe"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
            />
            <p className="text-xs text-muted-foreground">
              Link becomes rngo.ro/r/&lt;slug&gt; — lowercase letters, digits
              and hyphens (3-32 chars).
            </p>
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
          <Button
            onClick={handleCreate}
            disabled={isSubmitting || !userEmail.trim() || !slug.trim()}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
