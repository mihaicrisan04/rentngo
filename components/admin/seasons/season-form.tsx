"use client";

import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";
import {
  emptySeasonPeriod,
  type SeasonFormData,
} from "@/components/admin/seasons/season-schema";

function handleNumberInput(e: React.KeyboardEvent<HTMLInputElement>) {
  if (
    !/[0-9.]/.test(e.key) &&
    ![
      "Backspace",
      "Delete",
      "Tab",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
    ].includes(e.key)
  ) {
    e.preventDefault();
  }
}

interface SeasonFormFieldsProps {
  form: UseFormReturn<SeasonFormData>;
  isSubmitting: boolean;
}

export function SeasonFormFields({
  form,
  isSubmitting,
}: SeasonFormFieldsProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "periods",
  });

  return (
    <>
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
            onClick={() => append({ ...emptySeasonPeriod })}
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Period
          </Button>
        </div>

        {fields.map((periodField, index) => (
          <div key={periodField.id} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Period {index + 1}</h4>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name={`periods.${index}.startDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`periods.${index}.endDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`periods.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Description (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSubmitting}
                      placeholder="e.g., Summer period"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
      </div>
    </>
  );
}
