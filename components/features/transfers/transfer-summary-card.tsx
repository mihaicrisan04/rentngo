"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Car,
  ArrowRight,
  Route,
} from "lucide-react";
import { LocationData } from "@/lib/transfer-storage";
import { cn } from "@/lib/utils";
import { TransferRouteMap } from "@/components/features/transfers/transfer-route-map";
import { applyDiscountToTotal } from "@/lib/pricing";
import {
  CouponCodeInput,
  type AppliedCoupon,
} from "@/components/features/checkout/coupon-code-input";
import type { AffiliateDiscountPreview } from "@/hooks/use-affiliate-discount";
import { formatDuration } from "@/lib/mapbox";

interface Coordinates {
  lng: number;
  lat: number;
}

interface TransferSummaryCardProps {
  pickupLocation: LocationData;
  dropoffLocation: LocationData;
  pickupCoordinates?: Coordinates;
  dropoffCoordinates?: Coordinates;
  pickupDate: Date;
  pickupTime: string;
  returnDate?: Date;
  returnTime?: string;
  transferType: "one_way" | "round_trip";
  passengers: number;
  distanceKm: number;
  estimatedDurationMinutes: number;
  vehicle?: {
    make: string;
    model: string;
    year?: number;
  } | null;
  totalPrice: number;
  /** Advisory coupon preview; the server recomputes at booking time. */
  appliedCoupon?: AppliedCoupon | null;
  /** Customer email, so the coupon once-per-user check runs in the preview. */
  customerEmail?: string;
  /**
   * When provided, an embedded coupon field renders in the card footer and
   * fires this on apply/remove. Omit for a read-only summary.
   */
  onCouponAppliedChange?: (coupon: AppliedCoupon | null) => void;
  /** Automatic affiliate discount; an explicit coupon always beats it. */
  appliedAffiliateDiscount?: AffiliateDiscountPreview | null;
  className?: string;
}

export function TransferSummaryCard({
  pickupLocation,
  dropoffLocation,
  pickupCoordinates,
  dropoffCoordinates,
  pickupDate,
  pickupTime,
  returnDate,
  returnTime,
  transferType,
  passengers,
  distanceKm,
  estimatedDurationMinutes,
  vehicle,
  totalPrice,
  appliedCoupon,
  customerEmail,
  onCouponAppliedChange,
  appliedAffiliateDiscount,
  className,
}: TransferSummaryCardProps) {
  const t = useTranslations("transferPage");
  const tCoupon = useTranslations("common.coupon");
  const tReferral = useTranslations("common.referral");
  const locale = useLocale();

  // One discount per booking: an explicit coupon beats the automatic
  // affiliate discount (mirrors the server's pickDiscount)
  const affiliateDiscount = appliedCoupon ? null : appliedAffiliateDiscount;
  const discountAmount =
    appliedCoupon?.discountAmount ?? affiliateDiscount?.discountAmount ?? 0;
  const displayedTotal =
    discountAmount > 0
      ? applyDiscountToTotal(totalPrice, discountAmount)
      : totalPrice;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          {t("booking.summary")}
        </CardTitle>
        {pickupCoordinates && dropoffCoordinates && (
          <TransferRouteMap
            pickupCoordinates={pickupCoordinates}
            dropoffCoordinates={dropoffCoordinates}
            pickupLabel={pickupLocation.address.split(",")[0]}
            dropoffLabel={dropoffLocation.address.split(",")[0]}
            className="h-[100px] w-full mt-3 opacity-75"
            compact
          />
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <div className="w-0.5 h-8 bg-border" />
              <div className="h-3 w-3 rounded-full bg-red-500" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {t("confirmation.pickup")}
                </p>
                <p className="font-medium text-sm leading-tight">
                  {pickupLocation.address}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {t("confirmation.dropoff")}
                </p>
                <p className="font-medium text-sm leading-tight">
                  {dropoffLocation.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">
                {t("confirmation.date")}
              </p>
              <p className="font-medium">
                {pickupDate.toLocaleDateString(locale, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">
                {t("confirmation.time")}
              </p>
              <p className="font-medium">{pickupTime}</p>
            </div>
          </div>
        </div>

        {transferType === "round_trip" && returnDate && returnTime && (
          <>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowRight className="h-3 w-3 rotate-180" />
              <span>{t("confirmation.returnTrip")}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("confirmation.returnDate")}
                  </p>
                  <p className="font-medium">
                    {returnDate.toLocaleDateString(locale, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("confirmation.returnTime")}
                  </p>
                  <p className="font-medium">{returnTime}</p>
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{t("searchForm.passengerCount", { count: passengers })}</span>
          </div>
          <Badge variant="outline">
            {transferType === "one_way"
              ? t("searchForm.oneWay")
              : t("searchForm.roundTrip")}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{distanceKm} km</span>
          </div>
          <span className="text-muted-foreground">
            ~{formatDuration(estimatedDurationMinutes)}
          </span>
        </div>

        {vehicle && (
          <>
            <Separator />
            <div className="flex items-center gap-2 text-sm">
              <Car className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {vehicle.make} {vehicle.model}
                </p>
                {vehicle.year && (
                  <p className="text-xs text-muted-foreground">
                    {vehicle.year}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Simplified pricing display */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{distanceKm} km</span>
          </div>
          {transferType === "round_trip" && (
            <Badge variant="outline" className="text-xs">
              {t("searchForm.roundTrip")}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4 border-t pt-4">
        {onCouponAppliedChange && (
          <CouponCodeInput
            variant="embedded"
            bookingType="transfers"
            subtotal={totalPrice}
            email={customerEmail}
            onAppliedChange={onCouponAppliedChange}
          />
        )}
        <div className="flex flex-col gap-2">
          {appliedCoupon && discountAmount > 0 && (
            <div className="flex justify-between items-baseline text-sm text-green-600">
              <span>
                {tCoupon("discount")} ({appliedCoupon.code})
              </span>
              <span>−€{discountAmount.toFixed(2)}</span>
            </div>
          )}
          {affiliateDiscount && discountAmount > 0 && (
            <div className="flex justify-between items-baseline text-sm text-green-600">
              <span>
                {affiliateDiscount.kind === "referred"
                  ? tReferral("discount")
                  : tReferral("reward")}
              </span>
              <span>−€{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline">
            <span className="font-semibold">{t("pricing.totalPrice")}</span>
            <span className="text-2xl font-bold text-primary">
              €{displayedTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default TransferSummaryCard;
