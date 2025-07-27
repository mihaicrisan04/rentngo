"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, MoreHorizontal, Play, Square } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditSeasonDialog } from "@/components/admin/edit-season-dialog";
import { toast } from "sonner";

export function SeasonsTable() {
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
    try {
      await setCurrent({ seasonId, setBy: "Admin" });
      toast.success("Current season updated", {
        description: `${seasonName} is now the active season.`,
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

  const getStatusBadge = (season: any) => {
    const isCurrentSeason = currentSeason?.seasonId === season._id;
    
    if (isCurrentSeason) {
      return (
        <Badge className="bg-green-100 text-green-800">
          Current Season
        </Badge>
      );
    } else if (season.isActive) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Active
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          Inactive
        </Badge>
      );
    }
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
        <Table>
          <TableHeader>
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
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No seasons found. Create your first season to get started.
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
                  <TableCell>{getStatusBadge(season)}</TableCell>
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
