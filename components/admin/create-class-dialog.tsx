"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const classSchema = z.object({
  name: z
    .string()
    .min(1, "Class name is required")
    .max(50, "Class name must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9\s-]+$/,
      "Class name can only contain letters, numbers, spaces, and hyphens",
    ),
  displayName: z
    .string()
    .max(50, "Display name must be less than 50 characters")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional()
    .or(z.literal("")),
});

type ClassFormData = z.infer<typeof classSchema>;

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (classId: Id<"vehicleClasses">) => void;
}

export function CreateClassDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateClassDialogProps) {
  const createClass = useMutation(api.vehicleClasses.create);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
    },
  });

  const onSubmit = async (values: ClassFormData) => {
    setIsSubmitting(true);

    try {
      const newClassId = await createClass({
        name: values.name.trim(),
        displayName: values.displayName?.trim() || undefined,
        description: values.description?.trim() || undefined,
        isActive: true,
      });

      toast.success("Vehicle class created successfully");
      form.reset();
      onOpenChange(false);
      onSuccess?.(newClassId);
    } catch (error) {
      console.error("Error creating vehicle class:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create vehicle class",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Vehicle Class</DialogTitle>
          <DialogDescription>
            Add a new vehicle class to categorize your vehicles.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Class Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Economy, Luxury, Sport"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    The internal name for this class (required)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Economy Cars, Luxury Vehicles"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional display name for customer-facing views
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of this vehicle class..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description (max 200 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Class"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
