"use client";

import * as React from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Check, Copy, Link2 } from "lucide-react";

/**
 * Self-service affiliate view on the profile page (RNGO-26): referral link,
 * confirmed-conversion counter, current tier reward and history. Renders
 * nothing for non-affiliates; enrolment is admin-provisioned.
 */
export function AffiliateDashboard() {
  const t = useTranslations("profile.affiliate");
  const locale = useLocale();
  const affiliate = useQuery(api.affiliates.getMyAffiliate);
  const [copied, setCopied] = React.useState(false);

  if (!affiliate) return null;

  const referralUrl = `${
    typeof window !== "undefined"
      ? window.location.origin
      : "https://rngo.ro"
  }/r/${affiliate.slug}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the input stays selectable
    }
  };

  const { confirmedConversions, currentRewardPercent, nextTier } = affiliate;
  const progressToNext = nextTier
    ? Math.min(100, (confirmedConversions / nextTier.minConversions) * 100)
    : 100;

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {(!affiliate.isActive || !affiliate.programEnabled) && (
          <p className="text-sm text-destructive">{t("inactive")}</p>
        )}

        {/* Referral link */}
        <div className="space-y-2">
          <p className="text-sm font-medium">{t("yourLink")}</p>
          <div className="flex gap-2">
            <Input readOnly value={referralUrl} className="font-mono text-sm" />
            <Button
              type="button"
              variant="outline"
              onClick={copyLink}
              aria-label={t("copyLink")}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("referredDiscountInfo", {
              discount:
                affiliate.referredDiscount.type === "percentage"
                  ? `${affiliate.referredDiscount.value}%`
                  : `${affiliate.referredDiscount.value} EUR`,
            })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-muted/50 p-4 text-center">
            <p className="text-3xl font-bold">{confirmedConversions}</p>
            <p className="text-sm text-muted-foreground">{t("conversions")}</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4 text-center">
            <p className="text-3xl font-bold">{currentRewardPercent}%</p>
            <p className="text-sm text-muted-foreground">
              {t("currentReward")}
            </p>
          </div>
        </div>

        {/* Next-tier progress */}
        {nextTier && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("nextTier", {
                  count: nextTier.minConversions,
                  percent: nextTier.rewardPercent,
                })}
              </span>
              <span className="font-medium">
                {confirmedConversions}/{nextTier.minConversions}
              </span>
            </div>
            <Progress value={progressToNext} />
          </div>
        )}

        {/* History */}
        {affiliate.conversions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("history")}</p>
            <div className="space-y-1">
              {affiliate.conversions.map((conversion, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-sm"
                >
                  <span>
                    {conversion.bookingType === "reservation"
                      ? t("bookingRental")
                      : t("bookingTransfer")}
                    <span className="text-muted-foreground ml-2">
                      {new Date(conversion.createdAt).toLocaleDateString(
                        locale,
                      )}
                    </span>
                  </span>
                  <Badge
                    variant={
                      conversion.status === "confirmed"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {t(`status.${conversion.status}`)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
