"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CalendarDays, TrendingUp, TrendingDown, Minus } from "lucide-react";

export function CurrentSeasonSelector() {
  const seasons = useQuery(api.seasons.getActive);
  const currentSeason = useQuery(api.seasons.getCurrent);
  const setCurrent = useMutation(api.seasons.setCurrent);
  const clearCurrent = useMutation(api.seasons.clearCurrent);

  const handleSetCurrent = async (seasonId: string) => {
    try {
      await setCurrent({ seasonId: seasonId as Id<"seasons">, setBy: "Admin" });
      
      const selectedSeason = seasons?.find(s => s._id === seasonId);
      toast.success("Current season updated", {
        description: `${selectedSeason?.name} is now the active season.`,
        position: "bottom-right",
      });
    } catch (error: any) {
      toast.error("Failed to set current season", {
        description: error.message || "Please try again later.",
        position: "bottom-right",
      });
      console.error("Set current error:", error);
    }
  };

  const handleClearCurrent = async () => {
    try {
      await clearCurrent();
      toast.success("Season cleared", {
        description: "Reverted to base pricing (no season active).",
        position: "bottom-right",
      });
    } catch (error: any) {
      toast.error("Failed to clear current season", {
        description: error.message || "Please try again later.",
        position: "bottom-right",
      });
      console.error("Clear current error:", error);
    }
  };

  const getCurrentSeasonInfo = () => {
    if (!currentSeason) {
      return {
        name: "No Season Active",
        description: "Base pricing is currently applied",
        multiplier: 1.0,
        icon: <Minus className="h-5 w-5" />,
        badge: <Badge variant="secondary" className="bg-gray-100 text-gray-800">Base Pricing</Badge>
      };
    }

    const { season } = currentSeason;
    const isIncrease = season.multiplier > 1;
    const isDecrease = season.multiplier < 1;

    return {
      name: season.name,
      description: season.description || "No description provided",
      multiplier: season.multiplier,
      icon: isIncrease ? <TrendingUp className="h-5 w-5" /> : isDecrease ? <TrendingDown className="h-5 w-5" /> : <Minus className="h-5 w-5" />,
      badge: <Badge className="bg-green-100 text-green-800">Current Season</Badge>
    };
  };

  const formatPeriods = (periods: any[]) => {
    if (!periods || periods.length === 0) return "No periods defined";
    
    return periods.map((period, index) => (
      <div key={index} className="text-sm flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <span>
          {new Date(period.startDate).toLocaleDateString('en-GB')} - {new Date(period.endDate).toLocaleDateString('en-GB')}
        </span>
        {period.description && (
          <span className="text-muted-foreground">({period.description})</span>
        )}
      </div>
    ));
  };

  const currentInfo = getCurrentSeasonInfo();

  if (!seasons) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Season</CardTitle>
          <CardDescription>Loading season information...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Season Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentInfo.icon}
            Current Season
          </CardTitle>
          <CardDescription>
            The currently active season affects all rental pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">{currentInfo.name}</h3>
                {currentInfo.badge}
              </div>
              <p className="text-sm text-muted-foreground">{currentInfo.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{currentInfo.multiplier}x</div>
              <div className="text-xs text-muted-foreground">Price Multiplier</div>
            </div>
          </div>

          {currentSeason && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Active Periods:</h4>
              <div className="space-y-1">
                {formatPeriods(currentSeason.season.periods)}
              </div>
            </div>
          )}

          {currentSeason && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCurrent}
                className="text-orange-600 hover:text-orange-700"
              >
                Clear Current Season
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Season Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Set Current Season</CardTitle>
          <CardDescription>
            Choose from your active seasons to apply seasonal pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {seasons.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No active seasons available.</p>
              <p className="text-sm">Create and activate seasons to enable seasonal pricing.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Season</label>
                <Select
                  value={currentSeason?.seasonId || ""}
                  onValueChange={handleSetCurrent}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a season to activate" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) => (
                      <SelectItem key={season._id} value={season._id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{season.name}</span>
                          <span className="ml-2 text-muted-foreground">
                            {season.multiplier}x
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Available Seasons:</h4>
                {seasons.map((season) => (
                  <div
                    key={season._id}
                    className={`p-3 rounded-lg border ${
                      currentSeason?.seasonId === season._id 
                        ? "bg-accent border-green-200" 
                        : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{season.name}</span>
                          {currentSeason?.seasonId === season._id && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Current
                            </Badge>
                          )}
                        </div>
                        {season.description && (
                          <p className="text-xs text-muted-foreground">{season.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{season.multiplier}x</div>
                        <div className="text-xs text-muted-foreground">
                          {season.multiplier > 1 ? "Price increase" : season.multiplier < 1 ? "Price decrease" : "Base price"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      {formatPeriods(season.periods)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 