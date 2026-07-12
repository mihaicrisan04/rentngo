"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { validateAffiliateSettings, type AffiliateTier } from "@/lib/pricing";

/**
 * Global program config + tier editor. Every business number lives here (or
 * in a per-affiliate override) — nothing is hardcoded. Until first saved,
 * the backend serves the seeded placeholder defaults.
 */
export function AffiliateSettingsCard() {
  const settings = useQuery(api.affiliates.getSettings);
  const updateSettings = useMutation(api.affiliates.updateSettings);

  const [enabled, setEnabled] = React.useState(true);
  const [windowDays, setWindowDays] = React.useState("30");
  const [discountType, setDiscountType] = React.useState<
    "percentage" | "fixed"
  >("fixed");
  const [discountValue, setDiscountValue] = React.useState("10");
  const [tiers, setTiers] = React.useState<
    Array<{ minConversions: string; rewardPercent: string }>
  >([]);
  const [hydrated, setHydrated] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Populate the form once from the server values; afterwards the admin's
  // in-progress edits win over reactive refetches
  React.useEffect(() => {
    if (settings && !hydrated) {
      setEnabled(settings.enabled);
      setWindowDays(String(settings.attributionWindowDays));
      setDiscountType(settings.referredDiscountType);
      setDiscountValue(String(settings.referredDiscountValue));
      setTiers(
        settings.tiers.map((tier) => ({
          minConversions: String(tier.minConversions),
          rewardPercent: String(tier.rewardPercent),
        })),
      );
      setHydrated(true);
    }
  }, [settings, hydrated]);

  const handleSave = async () => {
    const parsedTiers: AffiliateTier[] = tiers.map((tier) => ({
      minConversions: Number(tier.minConversions),
      rewardPercent: Number(tier.rewardPercent),
    }));
    const candidate = {
      enabled,
      attributionWindowDays: Number(windowDays),
      referredDiscountType: discountType,
      referredDiscountValue: Number(discountValue),
      tiers: parsedTiers,
    };
    const error = validateAffiliateSettings(candidate);
    if (error) {
      toast.error(error, { position: "bottom-left" });
      return;
    }

    setIsSaving(true);
    try {
      await updateSettings(candidate);
      toast.success("Affiliate settings saved", { position: "bottom-left" });
    } catch (err) {
      console.error("Error saving affiliate settings:", err);
      toast.error("Failed to save settings", { position: "bottom-left" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Program Settings</CardTitle>
        <CardDescription>
          Referred-customer discount, attribution window and the reward tiers
          unlocked by confirmed conversions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label htmlFor="affiliate-enabled">Program enabled</Label>
            <p className="text-sm text-muted-foreground">
              Disabling stops new attributions, discounts and conversions
            </p>
          </div>
          <Switch
            id="affiliate-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="attribution-window">
              Attribution window (days)
            </Label>
            <Input
              id="attribution-window"
              type="number"
              min={1}
              value={windowDays}
              onChange={(e) => setWindowDays(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Referred discount type</Label>
            <Select
              value={discountType}
              onValueChange={(value) =>
                setDiscountType(value as "percentage" | "fixed")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed (EUR)</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="referred-value">
              Referred discount {discountType === "fixed" ? "(EUR)" : "(%)"}
            </Label>
            <Input
              id="referred-value"
              type="number"
              min={0}
              step="0.01"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Reward tiers</Label>
              <p className="text-sm text-muted-foreground">
                Confirmed conversions → % discount on the affiliate&apos;s own
                bookings (highest reached tier applies)
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setTiers((prev) => [
                  ...prev,
                  { minConversions: "", rewardPercent: "" },
                ])
              }
            >
              <Plus className="h-4 w-4 mr-1" />
              Add tier
            </Button>
          </div>
          {tiers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No tiers — affiliates earn no reward until one is added.
            </p>
          )}
          {tiers.map((tier, index) => (
            <div key={index} className="flex items-end gap-3">
              <div className="space-y-1 flex-1">
                <Label className="text-xs text-muted-foreground">
                  Conversions required
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={tier.minConversions}
                  onChange={(e) =>
                    setTiers((prev) =>
                      prev.map((item, i) =>
                        i === index
                          ? { ...item, minConversions: e.target.value }
                          : item,
                      ),
                    )
                  }
                />
              </div>
              <div className="space-y-1 flex-1">
                <Label className="text-xs text-muted-foreground">
                  Reward (%)
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.5"
                  value={tier.rewardPercent}
                  onChange={(e) =>
                    setTiers((prev) =>
                      prev.map((item, i) =>
                        i === index
                          ? { ...item, rewardPercent: e.target.value }
                          : item,
                      ),
                    )
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove tier"
                onClick={() =>
                  setTiers((prev) => prev.filter((_, i) => i !== index))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving || !hydrated}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
