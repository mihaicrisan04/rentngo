"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { calculateIncludedKilometers } from "@/lib/pricing";

interface AdditionalFeaturesCardProps {
  days: number | null;
  additional50kmPrice: number;
  snowChainsSelected: boolean;
  onSnowChainsChange: (selected: boolean) => void;
  childSeat1to4Count: number;
  onChildSeat1to4CountChange: (count: number) => void;
  childSeat5to12Count: number;
  onChildSeat5to12CountChange: (count: number) => void;
  extraKilometersCount: number;
  onExtraKilometersCountChange: (count: number) => void;
}

function CounterButtons({
  count,
  max,
  onChange,
}: {
  count: number;
  max: number;
  onChange: (count: number) => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange(Math.max(0, count - 1))}
        disabled={count === 0}
      >
        -
      </Button>
      <span className="min-w-[2rem] text-center">{count}</span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange(Math.min(max, count + 1))}
        disabled={count === max}
      >
        +
      </Button>
    </div>
  );
}

export const AdditionalFeaturesCard = React.memo(
  function AdditionalFeaturesCard({
    days,
    additional50kmPrice,
    snowChainsSelected,
    onSnowChainsChange,
    childSeat1to4Count,
    onChildSeat1to4CountChange,
    childSeat5to12Count,
    onChildSeat5to12CountChange,
    extraKilometersCount,
    onExtraKilometersCountChange,
  }: AdditionalFeaturesCardProps) {
    const t = useTranslations("reservationPage");

    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("additionalFeatures.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Snow Chains */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="snow-chains"
                  checked={snowChainsSelected}
                  onCheckedChange={(checked) =>
                    onSnowChainsChange(checked === true)
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="snow-chains"
                    className="text-sm font-medium cursor-pointer"
                  >
                    {t("additionalFeatures.snowChains")}
                  </Label>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">
                      {t("additionalFeatures.pricePerDay")}
                    </span>
                    <span className="font-medium">
                      {snowChainsSelected && days ? `${days * 3} EUR` : "0 EUR"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Child Seat 1-4 years */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-start space-x-2">
                <div className="flex-1">
                  <Label className="text-sm font-medium">
                    {t("additionalFeatures.childSeat1to4")}
                  </Label>
                  <div className="flex items-center justify-between mt-2">
                    <CounterButtons
                      count={childSeat1to4Count}
                      max={2}
                      onChange={onChildSeat1to4CountChange}
                    />
                    <span className="font-medium">
                      {childSeat1to4Count > 0 && days
                        ? `${childSeat1to4Count * days * 3} EUR`
                        : "0 EUR"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t("additionalFeatures.pricePerSeat")}
                  </div>
                </div>
              </div>
            </div>

            {/* Child Seat 5-12 years */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-start space-x-2">
                <div className="flex-1">
                  <Label className="text-sm font-medium">
                    {t("additionalFeatures.childSeat5to12")}
                  </Label>
                  <div className="flex items-center justify-between mt-2">
                    <CounterButtons
                      count={childSeat5to12Count}
                      max={2}
                      onChange={onChildSeat5to12CountChange}
                    />
                    <span className="font-medium">
                      {childSeat5to12Count > 0 && days
                        ? `${childSeat5to12Count * days * 3} EUR`
                        : "0 EUR"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t("additionalFeatures.pricePerSeat")}
                  </div>
                </div>
              </div>
            </div>

            {/* Extra Kilometers */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-start space-x-2">
                <div className="flex-1">
                  <Label className="text-sm font-medium">
                    {t("additionalFeatures.extraKilometersPackages")}
                  </Label>
                  <div className="flex items-center justify-between mt-2">
                    <CounterButtons
                      count={extraKilometersCount}
                      max={100}
                      onChange={onExtraKilometersCountChange}
                    />
                    <span className="font-medium">
                      {extraKilometersCount > 0
                        ? `${extraKilometersCount * additional50kmPrice} EUR`
                        : "0 EUR"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t("additionalFeatures.extraKmDescription", {
                      price: additional50kmPrice,
                    })}
                    {days && (
                      <div className="mt-1">
                        {t("additionalFeatures.baseKilometersIncluded", {
                          km: calculateIncludedKilometers(days),
                          days: days,
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
);
