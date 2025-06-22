"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

const seasonSchema = z.object({
  name: z.string().min(1, "Season name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  multiplier: z.string()
    .min(1, "Multiplier is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Multiplier must be a valid number with up to 2 decimal places")
    .refine((val) => {
      const multiplier = parseFloat(val);
      return multiplier > 0 && multiplier <= 10;
    }, "Multiplier must be between 0.01 and 10.00"),
  isActive: z.boolean(),
  periods: z.array(z.object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    description: z.string().optional(),
  })).min(1, "At least one period is required"),
});

type SeasonFormData = z.infer<typeof seasonSchema>;

interface CreateSeasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Period {
  startDate: string;
  endDate: string;
  description: string;
}

export function CreateSeasonDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateSeasonDialogProps) {
  const createSeason = useMutation(api.seasons.create);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [periods, setPeriods] = useState<Period[]>([
    { startDate: "", endDate: "", description: "" }
  ]);

  const form = useForm<SeasonFormData>({
    resolver: zodResolver(seasonSchema),
    defaultValues: {
      name: "",
      description: "",
      multiplier: "1.00",
      isActive: true,
      periods: [{ startDate: "", endDate: "", description: "" }],
    },
  });

  const onSubmit = async (values: SeasonFormData) => {
    setIsSubmitting(true);

    try {
      // Filter out periods with empty dates and prepare the data
      const validPeriods = periods
        .filter(period => period.startDate && period.endDate)
        .map(period => ({
          startDate: period.startDate,
          endDate: period.endDate,
          description: period.description || undefined,
        }));

      if (validPeriods.length === 0) {
        toast.error("Please add at least one valid period");
        setIsSubmitting(false);
        return;
      }

      await createSeason({
        name: values.name,
        description: values.description || undefined,
        multiplier: parseFloat(values.multiplier),
        isActive: values.isActive,
        periods: validPeriods,
      });
      
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

  const addPeriod = () => {
    const newPeriods = [...periods, { startDate: "", endDate: "", description: "" }];
    setPeriods(newPeriods);
    form.setValue("periods", newPeriods);
  };

  const removePeriod = (index: number) => {
    if (periods.length > 1) {
      const newPeriods = periods.filter((_, i) => i !== index);
      setPeriods(newPeriods);
      form.setValue("periods", newPeriods);
    }
  };

  const updatePeriod = (index: number, field: keyof Period, value: string) => {
    const newPeriods = periods.map((period, i) => 
      i === index ? { ...period, [field]: value } : period
    );
    setPeriods(newPeriods);
    form.setValue("periods", newPeriods);
  };

  // Helper function to allow only numbers in text inputs
  const handleNumberInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[0-9.]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Season Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={isSubmitting}
                          placeholder="e.g., High Season"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="multiplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Multiplier</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          onKeyDown={handleNumberInput}
                          disabled={isSubmitting}
                          placeholder="e.g., 1.50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled={isSubmitting}
                        placeholder="e.g., Summer and holiday pricing"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active Season</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Active seasons can be set as the current season
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel>Season Periods</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPeriod}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Period
                  </Button>
                </div>
                
                {periods.map((period, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Period {index + 1}</h4>
                      {periods.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removePeriod(index)}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <FormLabel className="text-xs">Start Date</FormLabel>
                        <Input
                          type="date"
                          value={period.startDate}
                          onChange={(e) => updatePeriod(index, "startDate", e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <FormLabel className="text-xs">End Date</FormLabel>
                        <Input
                          type="date"
                          value={period.endDate}
                          onChange={(e) => updatePeriod(index, "endDate", e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <FormLabel className="text-xs">Description (Optional)</FormLabel>
                      <Input
                        value={period.description}
                        onChange={(e) => updatePeriod(index, "description", e.target.value)}
                        disabled={isSubmitting}
                        placeholder="e.g., Summer period"
                      />
                    </div>
                  </div>
                ))}
              </div>
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