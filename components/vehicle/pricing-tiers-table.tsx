import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PricingTier } from "@/types/vehicle";
import { useSeasonalPricing } from "@/hooks/useSeasonalPricing";
import { useTranslations, useLocale } from 'next-intl';

interface PricingTiersTableProps {
  pricingTiers?: PricingTier[];
  currency?: string;
  currentDays?: number | null;
}

export function PricingTiersTable({ 
  pricingTiers, 
  currentDays 
}: PricingTiersTableProps) {
  const t = useTranslations('pricingTiersTable');
  const locale = useLocale();
  const { multiplier: seasonalMultiplier } = useSeasonalPricing();

  // Don't render if no pricing tiers
  if (!pricingTiers || pricingTiers.length === 0) {
    return null;
  }

  // Sort pricing tiers by minDays for better display
  const sortedTiers = [...pricingTiers].sort((a, b) => a.minDays - b.minDays);

  // Helper function to format day range
  const formatDayRange = (minDays: number, maxDays: number): string => {
    if (maxDays >= 999) {
      return t('dayRangePlus', { 
        minDays, 
        plural: locale === 'ro' ? ((minDays === 1) ? "" : "le") : ((minDays === 1) ? "" : "s") 
      });
    }
    if (minDays === maxDays) {
      return t('exactDays', { 
        days: minDays, 
        plural: locale === 'ro' ? ((minDays === 1) ? "" : "le") : ((minDays === 1) ? "" : "s") 
      });
    }
    return t('dayRange', { 
      minDays, 
      maxDays, 
      plural: locale === 'ro' ? "le" : "s" 
    });
  };

  // Helper function to determine if tier is currently active
  const isActiveTier = (tier: PricingTier): boolean => {
    if (!currentDays) return false;
    return currentDays >= tier.minDays && currentDays <= tier.maxDays;
  };

  // Apply seasonal multiplier to pricing tier (final price user pays)
  const getFinalPrice = (basePrice: number): number => {
    return Math.round(basePrice * seasonalMultiplier);
  };

  // Calculate potential savings compared to shortest tier (with final pricing)
  const basePrice = sortedTiers[0] ? getFinalPrice(sortedTiers[0].pricePerDay) : 0;
  const calculateSavings = (tier: PricingTier): number => {
    const finalPrice = getFinalPrice(tier.pricePerDay);
    return basePrice - finalPrice;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('title')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('subtitle')}
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('rentalPeriod')}</TableHead>
              <TableHead>{t('pricePerDay')}</TableHead>
              <TableHead>{t('savings')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTiers.map((tier, index) => {
              const finalPrice = getFinalPrice(tier.pricePerDay);
              const savings = calculateSavings(tier);
              const isActive = isActiveTier(tier);
              
              return (
                <TableRow 
                  key={index}
                  className={isActive ? "bg-primary/5 border-primary/20" : ""}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {formatDayRange(tier.minDays, tier.maxDays)}
                      {isActive && (
                        <Badge variant="default" className="text-xs">
                          {t('current')}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    €{finalPrice.toFixed(2)}/{locale === 'ro' ? 'zi' : 'day'}
                  </TableCell>
                  <TableCell>
                    {savings > 0 ? (
                      <span className="text-green-600 font-medium">
                        {t('savingsAmount', { amount: savings.toFixed(2), day: locale === 'ro' ? 'zi' : 'day' })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {t('baseRate')}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {currentDays && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">{t('yourRental', { 
                days: currentDays, 
                plural: locale === 'ro' ? ((currentDays === 1) ? "" : "le") : ((currentDays === 1) ? "" : "s") 
              })}:</span>{' '}
              {(() => {
                const activeTier = sortedTiers.find(tier => 
                  currentDays >= tier.minDays && currentDays <= tier.maxDays
                );
                if (activeTier) {
                  const finalPrice = getFinalPrice(activeTier.pricePerDay);
                  const savings = calculateSavings(activeTier);
                  return (
                    <>
                      €{finalPrice.toFixed(2)}/{locale === 'ro' ? 'zi' : 'day'}
                      {savings > 0 && (
                        <span className="text-green-600 ml-2">
                          ({t('saveAmount', { amount: savings.toFixed(2), day: locale === 'ro' ? 'zi' : 'day' })})
                        </span>
                      )}
                    </>
                  );
                }
                return t('rateNotAvailable');
              })()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
