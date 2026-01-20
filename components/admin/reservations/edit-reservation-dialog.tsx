"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { getBasePricePerDay } from "@/types/vehicle";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useDateBasedSeasonalPricing } from "@/hooks/useDateBasedSeasonalPricing";
import {
  getPriceForDurationWithSeason,
  calculateVehiclePricing,
} from "@/lib/vehicleUtils";
import { Trash2, Plus } from "lucide-react";

const Tabs = TabsPrimitive.Root;
const TabsList = TabsPrimitive.List;
const TabsTrigger = TabsPrimitive.Trigger;
const TabsContent = TabsPrimitive.Content;

// SCDW calculation function (from useReservationPricing.ts)
const calculateSCDW = (days: number, dailyRate: number): number => {
  const base = dailyRate * 2; // cost for 1–3 days
  if (days <= 3) {
    return base;
  }
  const blocks = Math.ceil((days - 3) / 3);
  return base + 6 + 5 * (blocks - 1);
};

const reservationSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  pickupTime: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Please enter time in HH:MM format",
    ),
  restitutionTime: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Please enter time in HH:MM format",
    ),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  restitutionLocation: z.string().min(1, "Return location is required"),
  paymentMethod: z.enum(
    ["cash_on_delivery", "card_on_delivery", "card_online"],
    {
      required_error: "Payment method is required",
    },
  ),
  totalPrice: z
    .string()
    .min(1, "Total price is required")
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "Price must be a valid number with up to 2 decimal places",
    )
    .refine((val) => {
      const price = parseFloat(val);
      return price > 0;
    }, "Price must be greater than 0"),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"], {
    required_error: "Status is required",
  }),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Please enter a valid email"),
  customerPhone: z.string().min(1, "Customer phone is required"),
  customerMessage: z.string().optional(),
  flightNumber: z.string().optional(),
  isSCDWSelected: z.boolean(),
  deductibleAmount: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "Deductible must be a valid number with up to 2 decimal places",
    ),
  protectionCost: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "Protection cost must be a valid number with up to 2 decimal places",
    )
    .optional(),
  additionalCharges: z.array(
    z.object({
      description: z.string().min(1, "Description is required"),
      amount: z
        .string()
        .regex(
          /^\d+(\.\d{1,2})?$/,
          "Amount must be a valid number with up to 2 decimal places",
        )
        .refine((val) => {
          const amount = parseFloat(val);
          return amount >= 0;
        }, "Amount must be 0 or greater"),
    }),
  ),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

interface EditReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservationId: Id<"reservations">;
  onSuccess?: () => void;
}

export function EditReservationDialog({
  open,
  onOpenChange,
  reservationId,
  onSuccess,
}: EditReservationDialogProps) {
  const reservation = useQuery(
    api.reservations.getReservationById,
    reservationId ? { reservationId } : "skip",
  );
  const vehicles = useQuery(api.vehicles.getAllVehicles);
  const updateReservation = useMutation(
    api.reservations.updateReservationDetails,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      vehicleId: "",
      startDate: "",
      endDate: "",
      pickupTime: "10:00",
      restitutionTime: "10:00",
      pickupLocation: "",
      restitutionLocation: "",
      paymentMethod: "cash_on_delivery",
      totalPrice: "",
      status: "pending",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerMessage: "",
      flightNumber: "",
      isSCDWSelected: false,
      deductibleAmount: "0",
      protectionCost: "0",
      additionalCharges: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "additionalCharges",
  });

  // Watch all pricing-related fields for automatic total calculation
  const watchedFields = form.watch([
    "vehicleId",
    "startDate",
    "endDate",
    "pickupTime",
    "restitutionTime",
    "isSCDWSelected",
    "protectionCost",
    "additionalCharges",
  ]);

  // Watch form dates for seasonal pricing
  const watchedStartDate = form.watch("startDate");
  const watchedEndDate = form.watch("endDate");

  // Get seasonal pricing based on selected dates
  const { multiplier: currentSeasonalMultiplier, seasonId: currentSeasonId } = useDateBasedSeasonalPricing(
    watchedStartDate ? new Date(watchedStartDate) : null,
    watchedEndDate ? new Date(watchedEndDate) : null,
  );

  useEffect(() => {
    if (open && reservation) {
      form.reset({
        vehicleId: reservation.vehicleId,
        startDate: new Date(reservation.startDate).toISOString().split("T")[0],
        endDate: new Date(reservation.endDate).toISOString().split("T")[0],
        pickupTime: reservation.pickupTime,
        restitutionTime: reservation.restitutionTime,
        pickupLocation: reservation.pickupLocation,
        restitutionLocation: reservation.restitutionLocation,
        paymentMethod: reservation.paymentMethod,
        totalPrice: reservation.totalPrice.toString(),
        status: reservation.status,
        customerName: reservation.customerInfo.name,
        customerEmail: reservation.customerInfo.email,
        customerPhone: reservation.customerInfo.phone,
        customerMessage: reservation.customerInfo.message || "",
        flightNumber: reservation.customerInfo.flightNumber || "",
        isSCDWSelected: reservation.isSCDWSelected || false,
        deductibleAmount: (reservation.deductibleAmount || 0).toString(),
        protectionCost: (reservation.protectionCost || 0).toString(),
        additionalCharges:
          reservation.additionalCharges?.map((charge) => ({
            description: charge.description,
            amount: charge.amount.toString(),
          })) || [],
      });
    } else if (!open) {
      form.reset();
    }
  }, [open, reservation, form]);

  // Helper function to get calculated rental days using vehicleUtils logic
  const getRentalDays = () => {
    const vehicleId = form.watch("vehicleId");
    const startDate = form.watch("startDate");
    const endDate = form.watch("endDate");
    const pickupTime = form.watch("pickupTime");
    const restitutionTime = form.watch("restitutionTime");

    if (
      !vehicleId ||
      !vehicles ||
      !startDate ||
      !endDate ||
      !pickupTime ||
      !restitutionTime
    ) {
      return null;
    }

    const selectedVehicle = vehicles.find((v) => v._id === vehicleId);
    if (!selectedVehicle) return null;

    const pickup = new Date(startDate);
    const restitution = new Date(endDate);

    const priceDetails = calculateVehiclePricing(
      selectedVehicle,
      pickup,
      restitution,
      undefined, // deliveryLocation not used here
      undefined, // restitutionLocation not used here
      pickupTime,
      restitutionTime,
    );

    return priceDetails.days;
  };

  // Calculate suggested total price based on vehicle, days, and protection with seasonal pricing
  const calculateSuggestedPrice = () => {
    const vehicleId = form.watch("vehicleId");
    const startDate = form.watch("startDate");
    const endDate = form.watch("endDate");
    const pickupTime = form.watch("pickupTime");
    const restitutionTime = form.watch("restitutionTime");
    const isSCDWSelected = form.watch("isSCDWSelected");
    const protectionCost = parseFloat(form.watch("protectionCost") || "0");
    const additionalCharges = form.watch("additionalCharges");

    if (
      !vehicleId ||
      !vehicles ||
      !startDate ||
      !endDate ||
      !pickupTime ||
      !restitutionTime
    )
      return null;

    const selectedVehicle = vehicles.find((v) => v._id === vehicleId);
    if (!selectedVehicle) return null;

    const pickup = new Date(startDate);
    const restitution = new Date(endDate);

    const priceDetails = calculateVehiclePricing(
      selectedVehicle,
      pickup,
      restitution,
      undefined,
      undefined,
      pickupTime,
      restitutionTime,
    );

    if (!priceDetails.days) return null;

    // Use reservation's historical multiplier if available, otherwise use current seasonal pricing
    const effectiveMultiplier =
      reservation?.seasonalMultiplier || currentSeasonalMultiplier;
    const seasonalPricePerDay = getPriceForDurationWithSeason(
      selectedVehicle,
      priceDetails.days,
      effectiveMultiplier,
    );
    const basePrice = seasonalPricePerDay * priceDetails.days;

    // Calculate SCDW cost if selected, otherwise use manual protection cost
    let finalProtectionCost = protectionCost;
    if (isSCDWSelected) {
      finalProtectionCost = calculateSCDW(
        priceDetails.days,
        seasonalPricePerDay,
      );
    }

    const additionalChargesTotal = additionalCharges.reduce((total, charge) => {
      return total + parseFloat(charge.amount || "0");
    }, 0);

    return basePrice + finalProtectionCost + additionalChargesTotal;
  };

  // Auto-update total price when pricing factors change
  useEffect(() => {
    const suggestedPrice = calculateSuggestedPrice();
    if (suggestedPrice !== null) {
      form.setValue("totalPrice", suggestedPrice.toFixed(2));
    }
  }, watchedFields);

  // Auto-calculate SCDW cost when checkbox is toggled
  useEffect(() => {
    const isSCDWSelected = form.watch("isSCDWSelected");
    const vehicleId = form.watch("vehicleId");
    const startDate = form.watch("startDate");
    const endDate = form.watch("endDate");
    const pickupTime = form.watch("pickupTime");
    const restitutionTime = form.watch("restitutionTime");

    if (
      isSCDWSelected &&
      vehicleId &&
      vehicles &&
      startDate &&
      endDate &&
      pickupTime &&
      restitutionTime
    ) {
      const selectedVehicle = vehicles.find((v) => v._id === vehicleId);
      if (selectedVehicle) {
        const pickup = new Date(startDate);
        const restitution = new Date(endDate);

        const priceDetails = calculateVehiclePricing(
          selectedVehicle,
          pickup,
          restitution,
          undefined,
          undefined,
          pickupTime,
          restitutionTime,
        );

        if (priceDetails.days) {
          const scdwCost = calculateSCDW(
            priceDetails.days,
            getBasePricePerDay(selectedVehicle),
          );

          form.setValue("protectionCost", scdwCost.toFixed(2));
          form.setValue("deductibleAmount", "0");
        }
      }
    } else if (!isSCDWSelected) {
      // Reset protection cost when SCDW is deselected
      form.setValue("protectionCost", "0");
    }
  }, [
    form.watch("isSCDWSelected"),
    form.watch("vehicleId"),
    form.watch("startDate"),
    form.watch("endDate"),
    form.watch("pickupTime"),
    form.watch("restitutionTime"),
  ]);

  const onSubmit = async (values: ReservationFormData) => {
    if (!reservation) return;

    setIsSubmitting(true);

    try {
      const startDate = new Date(values.startDate).getTime();
      const endDate = new Date(values.endDate).getTime();

      await updateReservation({
        reservationId,
        vehicleId: values.vehicleId as Id<"vehicles">,
        startDate,
        endDate,
        pickupTime: values.pickupTime,
        restitutionTime: values.restitutionTime,
        pickupLocation: values.pickupLocation,
        restitutionLocation: values.restitutionLocation,
        paymentMethod: values.paymentMethod,
        totalPrice: parseFloat(values.totalPrice),
        status: values.status,
        customerInfo: {
          name: values.customerName,
          email: values.customerEmail,
          phone: values.customerPhone,
          message: values.customerMessage || undefined,
          flightNumber: values.flightNumber || undefined,
        },
        isSCDWSelected: values.isSCDWSelected,
        deductibleAmount: parseFloat(values.deductibleAmount),
        protectionCost: values.protectionCost
          ? parseFloat(values.protectionCost)
          : undefined,
        additionalCharges:
          values.additionalCharges.length > 0
            ? values.additionalCharges.map((charge) => ({
                description: charge.description,
                amount: parseFloat(charge.amount),
              }))
            : undefined,
        // Update seasonal data if dates or vehicle changed
        seasonId: currentSeasonId as Id<"seasons"> | undefined,
        seasonalMultiplier: currentSeasonalMultiplier,
      });

      toast.success("Reservation updated successfully");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating reservation:", error);
      toast.error("Failed to update reservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNumberInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
  };

  if (!reservation) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Reservation</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(80vh-150px)] pr-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList
              className={cn(
                "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full grid grid-cols-3",
              )}
            >
              <TabsTrigger
                value="details"
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
                )}
              >
                Reservation Details
              </TabsTrigger>
              <TabsTrigger
                value="customer"
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
                )}
              >
                Customer Info
              </TabsTrigger>
              <TabsTrigger
                value="pricing"
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
                )}
              >
                Pricing & Payment
              </TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 py-4"
              >
                <TabsContent
                  value="details"
                  className={cn(
                    "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4",
                  )}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="vehicleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select vehicle" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vehicles?.map((vehicle) => (
                                <SelectItem
                                  key={vehicle._id}
                                  value={vehicle._id}
                                >
                                  {vehicle.make} {vehicle.model} ({vehicle.year}
                                  ) -{" "}
                                  {getPriceForDurationWithSeason(
                                    vehicle,
                                    getRentalDays() || 0,
                                    currentSeasonalMultiplier,
                                  )}{" "}
                                  EUR/day
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-end">
                      <div className="text-sm text-muted-foreground">
                        {(() => {
                          const vehicleId = form.watch("vehicleId");
                          const startDate = form.watch("startDate");
                          const endDate = form.watch("endDate");
                          const pickupTime = form.watch("pickupTime");
                          const restitutionTime = form.watch("restitutionTime");

                          if (
                            !vehicleId ||
                            !vehicles ||
                            !startDate ||
                            !endDate ||
                            !pickupTime ||
                            !restitutionTime
                          ) {
                            return "Select vehicle, dates and times to see pricing";
                          }

                          const selectedVehicle = vehicles.find(
                            (v) => v._id === vehicleId,
                          );
                          if (!selectedVehicle) return "";

                          const pickup = new Date(startDate);
                          const restitution = new Date(endDate);

                          const priceDetails = calculateVehiclePricing(
                            selectedVehicle,
                            pickup,
                            restitution,
                            undefined,
                            undefined,
                            pickupTime,
                            restitutionTime,
                          );

                          if (!priceDetails.days) return "";

                          // Use reservation's historical multiplier if available, otherwise use current seasonal pricing
                          const effectiveMultiplier =
                            reservation?.seasonalMultiplier ||
                            currentSeasonalMultiplier;
                          const seasonalPricePerDay =
                            getPriceForDurationWithSeason(
                              selectedVehicle,
                              priceDetails.days,
                              effectiveMultiplier,
                            );

                          return `${priceDetails.days} ${priceDetails.days !== 1 ? "days" : "day"} × ${seasonalPricePerDay} EUR = ${priceDetails.days * seasonalPricePerDay} EUR`;
                        })()}
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">
                                Confirmed
                              </SelectItem>
                              <SelectItem value="cancelled">
                                Cancelled
                              </SelectItem>
                              <SelectItem value="completed">
                                Completed
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div></div> {/* Empty div for spacing */}
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pickupTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Time</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="time"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="restitutionTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Return Time</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="time"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pickupLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Location</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="restitutionLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Return Location</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent
                  value="customer"
                  className={cn(
                    "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4",
                  )}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Phone</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="flightNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Flight Number (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., RO 123"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="customerMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Message (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Any special requests or notes..."
                            disabled={isSubmitting}
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent
                  value="pricing"
                  className={cn(
                    "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4",
                  )}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="totalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Price (EUR)</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input
                                {...field}
                                onKeyDown={handleNumberInput}
                                disabled={isSubmitting}
                                placeholder="e.g., 250.00"
                                className="bg-muted/30"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isSubmitting}
                              onClick={() => {
                                const suggestedPrice =
                                  calculateSuggestedPrice();
                                if (suggestedPrice !== null) {
                                  form.setValue(
                                    "totalPrice",
                                    suggestedPrice.toFixed(2),
                                  );
                                }
                              }}
                            >
                              Recalc
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Updates automatically when pricing factors change
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash_on_delivery">
                                Cash on Delivery
                              </SelectItem>
                              <SelectItem value="card_on_delivery">
                                Card on Delivery
                              </SelectItem>
                              <SelectItem value="card_online">
                                Card Online
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">
                      Protection & Insurance
                    </h4>

                    <FormField
                      control={form.control}
                      name="isSCDWSelected"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                // SCDW cost will be auto-calculated in useEffect
                              }}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Super Collision Damage Waiver (SCDW)
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Zero deductible protection (cost calculated
                              automatically)
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="deductibleAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deductible Amount (EUR)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                disabled={
                                  isSubmitting || form.watch("isSCDWSelected")
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="protectionCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Protection Cost (EUR)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                disabled={isSubmitting}
                                className={
                                  form.watch("isSCDWSelected")
                                    ? "bg-muted/30"
                                    : ""
                                }
                              />
                            </FormControl>
                            {form.watch("isSCDWSelected") && (
                              <p className="text-xs text-muted-foreground">
                                Auto-calculated SCDW cost
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Additional Charges Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">
                        Additional Charges
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ description: "", amount: "0" })}
                        disabled={isSubmitting}
                        className="h-8"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Charge
                      </Button>
                    </div>

                    {fields.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No additional charges added
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {fields.map((field, index) => (
                          <div key={field.id} className="flex gap-2 items-end">
                            <FormField
                              control={form.control}
                              name={`additionalCharges.${index}.description`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel className="text-xs">
                                    Description
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="e.g., Delivery fee"
                                      disabled={isSubmitting}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`additionalCharges.${index}.amount`}
                              render={({ field }) => (
                                <FormItem className="w-32">
                                  <FormLabel className="text-xs">
                                    Amount (EUR)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      placeholder="0.00"
                                      disabled={isSubmitting}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => remove(index)}
                              disabled={isSubmitting}
                              className="h-10 w-10 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <h4 className="text-sm font-medium">Pricing Breakdown</h4>
                    {(() => {
                      const vehicleId = form.watch("vehicleId");
                      const startDate = form.watch("startDate");
                      const endDate = form.watch("endDate");
                      const pickupTime = form.watch("pickupTime");
                      const restitutionTime = form.watch("restitutionTime");
                      const isSCDWSelected = form.watch("isSCDWSelected");
                      const protectionCost = parseFloat(
                        form.watch("protectionCost") || "0",
                      );
                      const additionalCharges = form.watch("additionalCharges");

                      if (
                        !vehicleId ||
                        !vehicles ||
                        !startDate ||
                        !endDate ||
                        !pickupTime ||
                        !restitutionTime
                      ) {
                        return (
                          <p className="text-sm text-muted-foreground">
                            Select vehicle, dates and times to see breakdown
                          </p>
                        );
                      }

                      const selectedVehicle = vehicles.find(
                        (v) => v._id === vehicleId,
                      );
                      if (!selectedVehicle) return null;

                      const pickup = new Date(startDate);
                      const restitution = new Date(endDate);

                      const priceDetails = calculateVehiclePricing(
                        selectedVehicle,
                        pickup,
                        restitution,
                        undefined,
                        undefined,
                        pickupTime,
                        restitutionTime,
                      );

                      if (!priceDetails.days) return null;

                      // Use reservation's historical multiplier if available, otherwise use current seasonal pricing
                      const effectiveMultiplier =
                        reservation?.seasonalMultiplier ||
                        currentSeasonalMultiplier;
                      const seasonalPricePerDay = getPriceForDurationWithSeason(
                        selectedVehicle,
                        priceDetails.days,
                        effectiveMultiplier,
                      );
                      const basePrice = seasonalPricePerDay * priceDetails.days;

                      const additionalChargesTotal = additionalCharges.reduce(
                        (total, charge) => {
                          return total + parseFloat(charge.amount || "0");
                        },
                        0,
                      );

                      return (
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>
                              Base rental ({priceDetails.days}{" "}
                              {priceDetails.days !== 1 ? "days" : "day"})
                            </span>
                            <span>{basePrice.toFixed(2)} EUR</span>
                          </div>
                          {protectionCost > 0 && (
                            <div className="flex justify-between">
                              <span>
                                Protection (
                                {isSCDWSelected
                                  ? "SCDW (auto-calculated)"
                                  : "Standard"}
                                )
                              </span>
                              <span>{protectionCost.toFixed(2)} EUR</span>
                            </div>
                          )}
                          {additionalCharges.map((charge, index) => {
                            const amount = parseFloat(charge.amount || "0");
                            if (amount > 0) {
                              return (
                                <div
                                  key={index}
                                  className="flex justify-between"
                                >
                                  <span>
                                    {charge.description ||
                                      `Additional charge ${index + 1}`}
                                  </span>
                                  <span>{amount.toFixed(2)} EUR</span>
                                </div>
                              );
                            }
                            return null;
                          })}
                          <div className="border-t pt-1 flex justify-between font-medium">
                            <span>Total</span>
                            <span>
                              {(
                                basePrice +
                                protectionCost +
                                additionalChargesTotal
                              ).toFixed(2)}{" "}
                              EUR
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </TabsContent>
              </form>
            </Form>
          </Tabs>
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
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
