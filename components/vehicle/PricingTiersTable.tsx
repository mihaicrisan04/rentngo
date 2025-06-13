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

interface PricingTiersTableProps {
  pricingTiers?: PricingTier[];
  currency?: string;
  currentDays?: number | null;
}

export function PricingTiersTable({ 
  pricingTiers, 
  currency = "EUR",
  currentDays 
}: PricingTiersTableProps) {
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
      return `${minDays}+ days`;
    }
    if (minDays === maxDays) {
      return `${minDays} day${minDays === 1 ? '' : 's'}`;
    }
    return `${minDays}-${maxDays} days`;
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
        <CardTitle className="text-lg">Pricing Tiers</CardTitle>
        <p className="text-sm text-muted-foreground">
          Longer rentals get better rates!
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rental Period</TableHead>
              <TableHead>Price per Day</TableHead>
              <TableHead>Savings</TableHead>
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
                          Current
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    €{finalPrice.toFixed(2)}/{currency === "EUR" ? "day" : "zi"}
                  </TableCell>
                  <TableCell>
                    {savings > 0 ? (
                      <span className="text-green-600 font-medium">
                        -€{savings.toFixed(2)}/day
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Base rate
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
              <span className="font-medium">Your rental ({currentDays} day{currentDays === 1 ? '' : 's'}):</span>{' '}
              {(() => {
                const activeTier = sortedTiers.find(tier => 
                  currentDays >= tier.minDays && currentDays <= tier.maxDays
                );
                if (activeTier) {
                  const finalPrice = getFinalPrice(activeTier.pricePerDay);
                  const savings = calculateSavings(activeTier);
                  return (
                    <>
                      €{finalPrice.toFixed(2)}/day
                      {savings > 0 && (
                        <span className="text-green-600 ml-2">
                          (Save €{savings.toFixed(2)}/day)
                        </span>
                      )}
                    </>
                  );
                }
                return "Rate not available for this duration";
              })()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 