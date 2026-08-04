"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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

interface CreateSeasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateSeasonDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateSeasonDialogProps) {
  const createSeason = useMutation(api.seasons.create);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SeasonFormData>({
    resolver: zodResolver(seasonFormSchema),
    defaultValues: emptySeasonFormValues,
  });

  const onSubmit = async (values: SeasonFormData) => {
    setIsSubmitting(true);
    try {
      const payload = seasonFormToMutationValues(values);

      if (payload.periods.length === 0) {
        toast.error("Please add at least one valid period");
        setIsSubmitting(false);
        return;
      }

      await createSeason(payload);

      toast.success("Season created successfully", {
        description: `${values.name} has been added.`,
        position: "bottom-left",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating season:", error);
      toast.error("Failed to create season", {
        description: "Please check the form and try again.",
        position: "bottom-left",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Season</DialogTitle>
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
            {isSubmitting ? "Creating..." : "Create Season"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
