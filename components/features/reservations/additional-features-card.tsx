import * as React from "react";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from "lucide-react";
import { AdditionalFeatures } from "@/hooks/useReservationForm";
import { calculateIncludedKilometers, calculateExtraKilometersPrice, getMaxExtraKilometers } from "@/lib/vehicleUtils";
import { getBasePricePerDay } from "@/types/vehicle";

interface AdditionalFeaturesCardProps {
  additionalFeatures: AdditionalFeatures;
  setAdditionalFeatures: React.Dispatch<React.SetStateAction<AdditionalFeatures>>;
  days: number | null;
  vehicle?: any; // Pass the vehicle object instead of just pricePerDay
  additional50kmPrice?: number; // Price per 50km package
}

// SCDW calculation function (duplicated from pricing hook for display purposes)
const calculateSCDW = (days: number, dailyRate: number): number => {
  const base = dailyRate * 2;
  if (days <= 3) {
    return base;
  }
  const blocks = Math.ceil((days - 3) / 3);
  return base + 6 + 5 * (blocks - 1);
};

export function AdditionalFeaturesCard({
  additionalFeatures,
  setAdditionalFeatures,
  days,
  vehicle,
  additional50kmPrice = 5
}: AdditionalFeaturesCardProps) {
  const {
    scdwSelected,
    snowChainsSelected,
    childSeat1to4Count,
    childSeat5to12Count,
    extraKilometersCount
  } = additionalFeatures;

  const t = useTranslations('reservationPage');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('additionalFeatures.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* SCDW Insurance Option */}
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="scdw-insurance"
                checked={scdwSelected}
                onCheckedChange={(checked) => 
                  setAdditionalFeatures(prev => ({ ...prev, scdwSelected: checked === true }))
                }
              />
              <div className="flex-1">
                <div className="flex items-center space-x-1">
                  <Label htmlFor="scdw-insurance" className="text-sm font-medium cursor-pointer">
                    SCDW Insurance (Non-refundable)
                  </Label>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">SCDW Insurance Details</h4>
                        <p className="text-xs text-muted-foreground">
                          Super Collision Damage Waiver - provides additional protection for your rental.
                        </p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p><strong>Calculation:</strong></p>
                          <p>• Base cost: 2x daily rate</p>
                          <p>• Additional blocks (3+ days):</p>
                          <p>  - First block: +6 EUR</p>
                          <p>  - Each subsequent block: +5 EUR</p>
                        </div>
                        {days && vehicle && (
                          <div className="text-xs border-t pt-2 mt-2">
                            <p><strong>Your calculation:</strong></p>
                            <p>Days: {days} | Daily rate: {getBasePricePerDay(vehicle)} EUR</p>
                            <p>SCDW cost: {calculateSCDW(days, getBasePricePerDay(vehicle))} EUR</p>
                          </div>
                        )}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Non-refundable insurance</span>
                  <span className="font-medium">
                    {days && vehicle ? `${calculateSCDW(days, getBasePricePerDay(vehicle))} EUR` : '0 EUR'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Snow Chains */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="snow-chains"
                checked={snowChainsSelected}
                onCheckedChange={(checked) => 
                  setAdditionalFeatures(prev => ({ ...prev, snowChainsSelected: checked === true }))
                }
              />
              <div className="flex-1">
                <Label htmlFor="snow-chains" className="text-sm font-medium cursor-pointer">
                  {t('additionalFeatures.snowChains')}
                </Label>
                <div className="flex justify-between text-sm mt-1">
                                      <span className="text-muted-foreground">{t('additionalFeatures.pricePerDay')}</span>
                  <span className="font-medium">
                    {snowChainsSelected && days ? `${days * 3} EUR` : '0 EUR'}
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
                  {t('additionalFeatures.childSeat1to4')}
                </Label>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAdditionalFeatures(prev => ({ 
                        ...prev, 
                        childSeat1to4Count: Math.max(0, prev.childSeat1to4Count - 1) 
                      }))}
                      disabled={childSeat1to4Count === 0}
                    >
                      -
                    </Button>
                    <span className="min-w-[2rem] text-center">{childSeat1to4Count}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAdditionalFeatures(prev => ({ 
                        ...prev, 
                        childSeat1to4Count: Math.min(2, prev.childSeat1to4Count + 1) 
                      }))}
                      disabled={childSeat1to4Count === 2}
                    >
                      +
                    </Button>
                  </div>
                  <span className="font-medium">
                    {childSeat1to4Count > 0 && days ? `${childSeat1to4Count * days * 3} EUR` : '0 EUR'}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t('additionalFeatures.pricePerSeat')}
                </div>
              </div>
            </div>
          </div>

          {/* Child Seat 5-12 years */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-start space-x-2">
              <div className="flex-1">
                <Label className="text-sm font-medium">
                  {t('additionalFeatures.childSeat5to12')}
                </Label>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAdditionalFeatures(prev => ({ 
                        ...prev, 
                        childSeat5to12Count: Math.max(0, prev.childSeat5to12Count - 1) 
                      }))}
                      disabled={childSeat5to12Count === 0}
                    >
                      -
                    </Button>
                    <span className="min-w-[2rem] text-center">{childSeat5to12Count}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAdditionalFeatures(prev => ({ 
                        ...prev, 
                        childSeat5to12Count: Math.min(2, prev.childSeat5to12Count + 1) 
                      }))}
                      disabled={childSeat5to12Count === 2}
                    >
                      +
                    </Button>
                  </div>
                  <span className="font-medium">
                    {childSeat5to12Count > 0 && days ? `${childSeat5to12Count * days * 3} EUR` : '0 EUR'}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t('additionalFeatures.pricePerSeat')}
                </div>
              </div>
            </div>
          </div>

          {/* Extra Kilometers */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-start space-x-2">
              <div className="flex-1">
                <div className="flex items-center space-x-1">
                  <Label className="text-sm font-medium">
                    {t('additionalFeatures.extraKilometers')}
                  </Label>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">{t('additionalFeatures.extraKilometers')}</h4>
                        <p className="text-xs text-muted-foreground">
                          {t('additionalFeatures.extraKmDescription')}
                        </p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p><strong>{t('additionalFeatures.extraKmLimit')}</strong></p>
                          {days && (
                            <p>{t('additionalFeatures.baseKilometersIncluded', { 
                              km: calculateIncludedKilometers(days), 
                              days: days 
                            })}</p>
                          )}
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAdditionalFeatures(prev => ({ 
                        ...prev, 
                        extraKilometersCount: Math.max(0, prev.extraKilometersCount - 1) 
                      }))}
                      disabled={extraKilometersCount === 0}
                    >
                      -
                    </Button>
                    <span className="min-w-[2rem] text-center">{extraKilometersCount}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAdditionalFeatures(prev => ({ 
                        ...prev, 
                        extraKilometersCount: Math.min(Math.floor(getMaxExtraKilometers() / 50), prev.extraKilometersCount + 1) 
                      }))}
                      disabled={extraKilometersCount >= Math.floor(getMaxExtraKilometers() / 50)}
                    >
                      +
                    </Button>
                  </div>
                  <span className="font-medium">
                    {extraKilometersCount > 0 ? `${calculateExtraKilometersPrice(extraKilometersCount * 50, additional50kmPrice)} EUR` : '0 EUR'}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  +50 km for {additional50kmPrice} EUR each | Max: {getMaxExtraKilometers()} km extra
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
