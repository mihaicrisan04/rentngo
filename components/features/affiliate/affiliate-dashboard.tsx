"use client";

import * as React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
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
import { Check, Copy, Link2, Share2 } from "lucide-react";
import { COMPANY } from "@/lib/company";
import { currentTier } from "@/lib/pricing";
import { buildReferralUrl, buildWhatsAppShareUrl } from "@/lib/referral";

/** Neither value ever changes after hydration, so there is nothing to watch. */
const subscribeToNothing = () => () => {};

/**
 * Self-service affiliate view on the profile page: referral code and link with
 * copy/WhatsApp/native sharing, tier progress and conversion history. The
 * wallet itself is a separate card (WalletCard), because credit can also reach
 * a customer who has no referral code. Non-affiliates get the enrolment CTA
 * while the program is open (RNGO-54), and the contact link while it is not.
 */
export function AffiliateDashboard() {
  const t = useTranslations("profile.affiliate");
  const locale = useLocale();
  const currentUser = useQuery(api.users.get);
  const affiliate = useQuery(api.affiliates.getMyAffiliate);
  const enrolment = useQuery(api.affiliates.getMyEnrolment);
  const createMyAffiliate = useMutation(api.affiliates.createMyAffiliate);
  const [copied, setCopied] = React.useState<"link" | "code" | null>(null);
  const [isEnrolling, setIsEnrolling] = React.useState(false);
  // Browser-only values, read through useSyncExternalStore so the server
  // render (canonical origin, no native share) hydrates without a mismatch.
  const origin = React.useSyncExternalStore(
    subscribeToNothing,
    () => window.location.origin,
    () => COMPANY.baseUrl,
  );
  const canShareNatively = React.useSyncExternalStore(
    subscribeToNothing,
    () => typeof navigator.share === "function",
    () => false,
  );

  const copy = async (value: string, target: "link" | "code") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(target);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard unavailable — the input stays selectable
    }
  };

  const enrol = async () => {
    setIsEnrolling(true);
    try {
      await createMyAffiliate();
    } catch {
      toast.error(t("notEnrolled.generateFailed"));
    } finally {
      setIsEnrolling(false);
    }
  };

  // Both queries resolve to `null` for "no Convex user record yet" (provisioning
  // lag, or a Clerk↔Convex id mismatch) as well as their real empty states, so
  // gate on the user record first: while it's loading (undefined) or unresolved
  // (null) render nothing, rather than mislabelling an actual affiliate as "not
  // enrolled". Only once the user exists do we trust affiliate === null.
  if (currentUser === undefined || affiliate === undefined) return null;
  if (currentUser === null) return null;
  // Waiting for `enrolment` too, so the card never flashes the contact link
  // before flipping to the enrolment CTA (or the other way round).
  if (affiliate === null && enrolment === undefined) return null;

  // Enrolment and every code are gated on the program kill-switch; while it is
  // off the card keeps the contact link.
  const programEnabled =
    affiliate?.programEnabled ?? enrolment?.programEnabled === true;
  const closedCard = (
    <Card className="rounded-2xl border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-border/50 bg-muted/40 p-6 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("notEnrolled.closedBody")}
          </p>
          <Button asChild variant="outline">
            <Link href={`/${locale}/contact`}>{t("notEnrolled.cta")}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // A closed program refuses every code and link, so an affiliate is shown the
  // same "not open yet" card as everybody else rather than a share UI that
  // cannot work.
  if (!programEnabled) return closedCard;

  if (affiliate === null) {
    return (
      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            {t("title")}
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/50 bg-muted/40 p-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("notEnrolled.body")}
            </p>
            <Button type="button" onClick={enrol} disabled={isEnrolling}>
              {isEnrolling
                ? t("notEnrolled.generating")
                : t("notEnrolled.generate")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const referralUrl = buildReferralUrl(origin, affiliate.slug);
  const shareMessage = t("share.message", {
    code: affiliate.slug.toUpperCase(),
    link: referralUrl,
  });

  const shareNatively = async () => {
    try {
      await navigator.share({ text: shareMessage, url: referralUrl });
    } catch {
      // Dismissed or unsupported — the WhatsApp and copy buttons stay
    }
  };

  const { confirmedConversions, tiers, nextTier, hasRewardOverride } =
    affiliate;
  // A negotiated percent replaces the tier table, so no tier name applies.
  const tier = hasRewardOverride
    ? null
    : currentTier(tiers, confirmedConversions);
  const progressToNext = nextTier
    ? Math.min(100, (confirmedConversions / nextTier.minConversions) * 100)
    : 100;
  const formatLedgerDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString(locale);

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
        {!affiliate.isActive && (
          <p className="text-sm text-destructive">{t("inactive")}</p>
        )}

        {/* Share: the code goes into the checkout promo field, the link sets
            the referral cookie */}
        <div className="space-y-4">
          <p className="text-sm font-medium">{t("share.title")}</p>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t("yourCode")}</p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={affiliate.slug}
                className="font-mono text-sm uppercase"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => copy(affiliate.slug, "code")}
                aria-label={t("copyCode")}
              >
                {copied === "code" ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t("codeInfo")}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t("yourLink")}</p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={referralUrl}
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => copy(referralUrl, "link")}
                aria-label={t("copyLink")}
              >
                {copied === "link" ? (
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

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="w-full sm:w-auto">
              <a
                href={buildWhatsAppShareUrl(shareMessage)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("share.whatsapp")}
              </a>
            </Button>
            {canShareNatively && (
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={shareNatively}
              >
                <Share2 className="h-4 w-4" />
                {t("share.native")}
              </Button>
            )}
          </div>
        </div>

        {/* Tier progress */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-muted/50 p-4 text-center">
            <p className="text-3xl font-bold">{confirmedConversions}</p>
            <p className="text-sm text-muted-foreground">{t("conversions")}</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4 text-center">
            <p className="text-3xl font-bold">
              {affiliate.currentRewardPercent}%
            </p>
            <p className="text-sm text-muted-foreground">
              {t("currentReward")}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">
              {hasRewardOverride
                ? t("tier.custom")
                : tier?.name
                  ? t("tier.current", { name: tier.name })
                  : t("tier.none")}
            </span>
            {nextTier && (
              <span className="font-medium">
                {confirmedConversions}/{nextTier.minConversions}
              </span>
            )}
          </div>
          {nextTier && (
            <>
              <Progress value={progressToNext} />
              <p className="text-sm text-muted-foreground">
                {nextTier.name
                  ? t("tier.next", {
                      name: nextTier.name,
                      count: nextTier.minConversions,
                      percent: nextTier.rewardPercent,
                    })
                  : t("nextTier", {
                      count: nextTier.minConversions,
                      percent: nextTier.rewardPercent,
                    })}
              </p>
            </>
          )}
        </div>

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
                      {formatLedgerDate(conversion.createdAt)}
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
