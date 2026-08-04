"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { SeasonFormFields } from "@/components/admin/seasons/season-form";
import {
  seasonFormSchema,
  seasonFormToMutationValues,
  emptySeasonFormValues,
  type SeasonFormData,
} from "@/components/admin/seasons/season-schema";

interface EditSeasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seasonId: Id<"seasons">;
  onSuccess?: () => void;
}

export function EditSeasonDialog({
  open,
  onOpenChange,
  seasonId,
  onSuccess,
}: EditSeasonDialogProps) {
  const season = useQuery(api.seasons.getById, seasonId ? { id: seasonId } : "skip");
  const updateSeason = useMutation(api.seasons.update);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SeasonFormData>({
    resolver: zodResolver(seasonFormSchema),
    defaultValues: { ...emptySeasonFormValues, periods: [] },
  });

  useEffect(() => {
    if (season && open) {
      form.reset({
        name: season.name,
        description: season.description || "",
        multiplier: season.multiplier.toString(),
        isActive: season.isActive,
        periods: season.periods.map((period) => ({
          startDate: period.startDate,
          endDate: period.endDate,
          description: period.description || "",
        })),
      });
    } else if (!open) {
      form.reset({ ...emptySeasonFormValues, periods: [] });
    }
  }, [season, open, form]);

  const onSubmit = async (values: SeasonFormData) => {
    setIsSubmitting(true);
    try {
      const payload = seasonFormToMutationValues(values);

      if (payload.periods.length === 0) {
        toast.error("Please add at least one valid period");
        setIsSubmitting(false);
        return;
      }

      await updateSeason({ id: seasonId, ...payload });

      toast.success("Season updated successfully", {
        description: `${values.name} has been updated.`,
        position: "bottom-right",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating season:", error);
      toast.error("Failed to update season", {
        description: "Please check the form and try again.",
        position: "bottom-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!season) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Season: {season.name}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(80vh-150px)] pr-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              <SeasonFormFields form={form} isSubmitting={isSubmitting} />
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Season"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
