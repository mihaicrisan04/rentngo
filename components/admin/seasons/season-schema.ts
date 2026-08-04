import { z } from "zod";

export const seasonFormSchema = z.object({
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

export type SeasonFormData = z.infer<typeof seasonFormSchema>;

export const emptySeasonPeriod = { startDate: "", endDate: "", description: "" };

export const emptySeasonFormValues: SeasonFormData = {
  name: "",
  description: "",
  multiplier: "1.00",
  isActive: true,
  periods: [{ ...emptySeasonPeriod }],
};

/** Form values → mutation payload (optionals as undefined, not ""). */
export function seasonFormToMutationValues(values: SeasonFormData) {
  return {
    name: values.name,
    description: values.description || undefined,
    multiplier: parseFloat(values.multiplier),
    isActive: values.isActive,
    periods: values.periods
      .filter((period) => period.startDate && period.endDate)
      .map((period) => ({
        startDate: period.startDate,
        endDate: period.endDate,
        description: period.description || undefined,
      })),
  };
}
