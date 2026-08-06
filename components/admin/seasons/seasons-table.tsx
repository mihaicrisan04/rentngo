"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit,
  Trash2,
  MoreHorizontal,
  Play,
  Square,
  CalendarRange,
} from "lucide-react";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { toastWithUndo } from "@/components/admin/shared/undo-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const EditSeasonDialog = dynamic(
  () => import("@/components/admin/seasons/edit-season-dialog").then(m => m.EditSeasonDialog),
  { ssr: false }
);

interface SeasonsTableProps {
  onCreate?: () => void;
}

export function SeasonsTable({ onCreate }: SeasonsTableProps) {
  const [editingSeason, setEditingSeason] = useState<Id<"seasons"> | null>(null);
  
  const seasons = useQuery(api.seasons.getAll);
  const currentSeason = useQuery(api.seasons.getCurrent);
  const deleteSeason = useMutation(api.seasons.deleteSeason);
  const setCurrent = useMutation(api.seasons.setCurrent);
  const clearCurrent = useMutation(api.seasons.clearCurrent);

  const handleEdit = (seasonId: Id<"seasons">) => {
    setEditingSeason(seasonId);
  };

  const handleDelete = async (seasonId: Id<"seasons">, seasonName: string) => {
    if (confirm(`Are you sure you want to delete "${seasonName}"? This action cannot be undone.`)) {
      try {
        await deleteSeason({ id: seasonId });
        toast.success("Season deleted successfully", {
          description: `${seasonName} has been removed.`,
          position: "bottom-right",
        });
      } catch (error: any) {
        toast.error("Failed to delete season", {
          description: error.message || "Please try again later.",
          position: "bottom-right",
        });
        console.error("Delete error:", error);
      }
    }
  };

  const handleSetCurrent = async (seasonId: Id<"seasons">, seasonName: string) => {
    const previousSeasonId = currentSeason?.seasonId;
    try {
      await setCurrent({ seasonId, setBy: "Admin" });
      toastWithUndo({
        message: "Current season updated",
        description: `${seasonName} is now the active season.`,
        onUndo: () =>
          previousSeasonId
            ? setCurrent({ seasonId: previousSeasonId, setBy: "Admin" })
            : clearCurrent(),
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
    const previousSeasonId = currentSeason?.seasonId;
    try {
      await clearCurrent();
      toastWithUndo({
        message: "Season cleared",
        description: "Reverted to base pricing (no season active).",
        onUndo: () =>
          previousSeasonId
            ? setCurrent({ seasonId: previousSeasonId, setBy: "Admin" })
            : Promise.resolve(),
      });
    } catch (error: any) {
      toast.error("Failed to clear current season", {
        description: error.message || "Please try again later.",
        position: "bottom-right",
      });
      console.error("Clear current error:", error);
    }
  };

  const seasonStatus = (season: any) => {
    if (currentSeason?.seasonId === season._id) return "currentSeason";
    return season.isActive ? "active" : "inactive";
  };

  const formatPeriods = (periods: any[]) => {
    if (!periods || periods.length === 0) return "No periods defined";
    
    return periods.map((period, index) => (
      <div key={index} className="text-sm">
        <div className="font-medium">
          {new Date(period.startDate).toLocaleDateString('en-GB')} - {new Date(period.endDate).toLocaleDateString('en-GB')}
        </div>
        {period.description && (
          <div className="text-xs text-muted-foreground">{period.description}</div>
        )}
      </div>
    ));
  };

  if (!seasons) {
    return <div className="flex justify-center py-8">Loading seasons...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table containerClassName="overflow-x-visible">
          <TableHeader sticky>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Multiplier</TableHead>
              <TableHead>Periods</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {seasons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    icon={CalendarRange}
                    message="No seasons yet"
                    actionLabel={onCreate ? "Create season" : undefined}
                    onAction={onCreate}
                  />
                </TableCell>
              </TableRow>
            ) : (
              seasons.map((season) => (
                <TableRow key={season._id}>
                  <TableCell>
                    <div className="font-medium">{season.name}</div>
                  </TableCell>
                  <TableCell>
                    {season.description || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {season.multiplier}x
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {season.multiplier > 1 ? "Price increase" : season.multiplier < 1 ? "Price decrease" : "Base price"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {formatPeriods(season.periods)}
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={seasonStatus(season)} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEdit(season._id)}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {currentSeason?.seasonId === season._id ? (
                          <DropdownMenuItem
                            onClick={handleClearCurrent}
                            className="cursor-pointer text-orange-600 hover:text-orange-700"
                          >
                            <Square className="h-4 w-4 mr-2" />
                            Clear Current
                          </DropdownMenuItem>
                        ) : season.isActive ? (
                          <DropdownMenuItem
                            onClick={() => handleSetCurrent(season._id, season.name)}
                            className="cursor-pointer text-green-600 hover:text-green-700"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Set as Current
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem
                          onClick={() => handleDelete(season._id, season.name)}
                          className="cursor-pointer text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingSeason && (
        <EditSeasonDialog
          open={!!editingSeason}
          onOpenChange={(open: boolean) => !open && setEditingSeason(null)}
          seasonId={editingSeason}
        />
      )}
    </div>
  );
} 
