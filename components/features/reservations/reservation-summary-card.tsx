"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Info, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { calculateIncludedKilometers } from "@/lib/pricing";
import type { UseReservationPricingResult } from "@/hooks/use-reservation-pricing";
import type { Vehicle } from "@/types/vehicle";

interface ReservationSummaryCardProps {
  vehicle: Vehicle;
  deliveryLocation: string;
  restitutionLocation: string;
  pickupDate: Date | undefined;
  pickupTime: string | null;
  returnDate: Date | undefined;
  returnTime: string | null;
  flightNumber: string;
  snowChainsSelected: boolean;
  childSeat1to4Count: number;
  childSeat5to12Count: number;
  extraKilometersCount: number;
  isSCDWSelected: boolean;
  onSCDWChange: (selected: boolean) => void;
  pricing: UseReservationPricingResult;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export const ReservationSummaryCard = React.memo(
  function ReservationSummaryCard({
    vehicle,
    deliveryLocation,
    restitutionLocation,
    pickupDate,
    pickupTime,
    returnDate,
    returnTime,
    flightNumber,
    snowChainsSelected,
    childSeat1to4Count,
    childSeat5to12Count,
    extraKilometersCount,
    isSCDWSelected,
    onSCDWChange,
    pricing,
    isSubmitting,
    onSubmit,
  }: ReservationSummaryCardProps) {
    const t = useTranslations("reservationPage");
    const locale = useLocale();

    const {
      breakdown,
      snowChainsPrice,
      childSeat1to4Price,
      childSeat5to12Price,
      extraKilometersPrice,
      totalAdditionalFeatures,
    } = pricing;
    const days = breakdown?.rentalDays ?? null;
    const basePrice = breakdown?.basePrice ?? null;
    const totalPrice = breakdown?.totalPrice ?? null;
    const deliveryFee = breakdown?.deliveryFee ?? 0;
    const returnFee = breakdown?.returnFee ?? 0;
    const totalLocationFees = breakdown?.totalLocationFees ?? 0;
    const warrantyAmount = breakdown?.warrantyAmount ?? 0;
    const scdwPrice = breakdown?.scdwPrice ?? 0;

    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>{t("reservationSummary.title")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Summary Details */}
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium text-muted-foreground">
                  {t("reservationSummary.vehicle")}:
                </span>
                <span>
                  {vehicle.make} {vehicle.model} ({vehicle.year})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium text-muted-foreground">
                  {t("reservationSummary.pickup")}:
                </span>
                <span>
                  {deliveryLocation || t("reservationSummary.notSelected")}
                </span>
              </div>

              {pickupDate && pickupTime && (
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-muted-foreground">
                    {t("reservationSummary.pickupDate")}:
                  </span>
                  <span>
                    {pickupDate.toLocaleDateString(locale)} at {pickupTime}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium text-muted-foreground">
                  {t("reservationSummary.return")}:
                </span>
                <span>
                  {restitutionLocation || t("reservationSummary.notSelected")}
                </span>
              </div>

              {returnDate && returnTime && (
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-muted-foreground">
                    {t("reservationSummary.returnDate")}:
                  </span>
                  <span>
                    {returnDate.toLocaleDateString(locale)} at {returnTime}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium text-muted-foreground">
                  {t("reservationSummary.duration")}:
                </span>
                <span>
                  {days
                    ? t("reservationSummary.daysCount", {
                        days,
                        plural:
                          locale === "ro"
                            ? days === 1
                              ? ""
                              : "le"
                            : days === 1
                              ? ""
                              : "s",
                      })
                    : t("reservationSummary.notCalculated")}
                </span>
              </div>

              {days && (
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-muted-foreground">
                    {t("reservationSummary.totalKilometers")}:
                  </span>
                  <span>
                    {calculateIncludedKilometers(days) +
                      extraKilometersCount * 50}{" "}
                    km
                  </span>
                </div>
              )}

              {flightNumber && (
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-muted-foreground">
                    {t("reservationSummary.flight")}:
                  </span>
                  <span>{flightNumber}</span>
                </div>
              )}
            </div>

            {/* Protection Toggle */}
            <div className="border-t pt-4 space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {t("protectionOptions.title")}
                </h4>
                <div className="p-3 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Label className="font-medium">
                        {isSCDWSelected
                          ? t("protectionOptions.scdwInsurance")
                          : t("protectionOptions.standardWarranty")}
                      </Label>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">
                              {t("protectionOptions.title")}
                            </h4>
                            <div className="text-xs text-muted-foreground space-y-2">
                              <div>
                                <p className="font-medium">
                                  {t("protectionOptions.warrantyDefault")}:
                                </p>
                                <p>
                                  • {t("protectionOptions.refundableDeposit")}
                                </p>
                                <p>
                                  • {t("protectionOptions.returnedEndRental")}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium">
                                  {t("protectionOptions.scdwInsurance")}:
                                </p>
                                <p>
                                  {t(
                                    "protectionOptions.superCollisionDamageWaiver",
                                  )}
                                </p>
                                <p>
                                  {t(
                                    "protectionOptions.nonRefundableButProvidesAdditionalProtection",
                                  )}
                                </p>
                                <p>
                                  {t("protectionOptions.noDepositRequired")}
                                </p>
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                    <p className="text-sm font-medium">
                      {isSCDWSelected
                        ? `${scdwPrice || 0} EUR `
                        : `${warrantyAmount || 0} EUR `}
                    </p>
                  </div>

                  <div className="flex items-center justify-center space-x-4">
                    <Label
                      className={`text-sm font-medium ${!isSCDWSelected ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {t("protectionOptions.standardWarranty")}
                    </Label>
                    <Switch
                      id="protection-toggle"
                      checked={isSCDWSelected}
                      onCheckedChange={onSCDWChange}
                    />
                    <Label
                      className={`text-sm font-medium ${isSCDWSelected ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {t("protectionOptions.scdw")}
                    </Label>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    {isSCDWSelected
                      ? t("protectionOptions.nonRefundableInsurance")
                      : t("protectionOptions.refundableIfNoDamages")}
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {t("reservationSummary.basePrice", {
                    days: days || 0,
                    plural:
                      locale === "ro"
                        ? days === 1
                          ? ""
                          : "le"
                        : days === 1
                          ? ""
                          : "s",
                  })}
                  :
                </span>
                <span>{basePrice || 0} EUR</span>
              </div>

              {deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{t("reservationSummary.pickupLocationFee")}:</span>
                  <span>{deliveryFee} EUR</span>
                </div>
              )}

              {returnFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{t("reservationSummary.returnLocationFee")}:</span>
                  <span>{returnFee} EUR</span>
                </div>
              )}

              {totalLocationFees > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground/60">
                  <span>{t("reservationSummary.totalLocationFees")}:</span>
                  <span>{totalLocationFees} EUR</span>
                </div>
              )}

              {isSCDWSelected && scdwPrice > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{t("protectionOptions.scdwInsurance")}:</span>
                  <span>{scdwPrice} EUR</span>
                </div>
              )}

              {snowChainsSelected && snowChainsPrice > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{t("additionalFeatures.snowChains")}:</span>
                  <span>{snowChainsPrice} EUR</span>
                </div>
              )}

              {childSeat1to4Count > 0 && childSeat1to4Price > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{t("additionalFeatures.childSeat1to4")}:</span>
                  <span>{childSeat1to4Price} EUR</span>
                </div>
              )}

              {childSeat5to12Count > 0 && childSeat5to12Price > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{t("additionalFeatures.childSeat5to12")}:</span>
                  <span>{childSeat5to12Price} EUR</span>
                </div>
              )}

              {extraKilometersCount > 0 && (extraKilometersPrice || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{t("additionalFeatures.extraKilometers")}:</span>
                  <span>{extraKilometersPrice || 0} EUR</span>
                </div>
              )}

              {totalAdditionalFeatures > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground/60">
                  <span>{t("reservationSummary.totalAdditionalFeatures")}:</span>
                  <span>{totalAdditionalFeatures} EUR</span>
                </div>
              )}

              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>{t("reservationSummary.totalPrice")}:</span>
                  <span className="text-green-600">
                    {totalPrice || 0} EUR
                    {!isSCDWSelected && warrantyAmount > 0 && (
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        + {warrantyAmount} EUR{" "}
                        {t("reservationSummary.warranty")}
                      </span>
                    )}
                  </span>
                </div>
                {!isSCDWSelected && warrantyAmount > 0 && (
                  <div className="text-right text-xs text-muted-foreground mt-1">
                    {t("reservationSummary.warrantyRefundable")}
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={onSubmit}
              size="lg"
              className="w-full bg-[#055E3B] hover:bg-[#055E3B]/80 text-white font-bold py-4 text-lg rounded-xl h-14"
              disabled={isSubmitting}
            >
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting
                ? t("reservationSummary.processing")
                : t("reservationSummary.sendReservationRequest")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  },
);
