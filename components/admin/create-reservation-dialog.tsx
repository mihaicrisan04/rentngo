"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
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
import { getPriceForDurationWithSeason } from "@/lib/vehicleUtils";

const Tabs = TabsPrimitive.Root;
const TabsList = TabsPrimitive.List;
const TabsTrigger = TabsPrimitive.Trigger;
const TabsContent = TabsPrimitive.Content;

const reservationSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  pickupTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter time in HH:MM format"),
  restitutionTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter time in HH:MM format"),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  restitutionLocation: z.string().min(1, "Return location is required"),
  paymentMethod: z.enum(["cash_on_delivery", "card_on_delivery", "card_online"], {
    required_error: "Payment method is required",
  }),
  totalPrice: z.string()
    .min(1, "Total price is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid number with up to 2 decimal places")
    .refine((val) => {
      const price = parseFloat(val);
      return price > 0;
    }, "Price must be greater than 0"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Please enter a valid email"),
  customerPhone: z.string().min(1, "Customer phone is required"),
  customerMessage: z.string().optional(),
  flightNumber: z.string().optional(),
  promoCode: z.string().optional(),
  isSCDWSelected: z.boolean(),
  deductibleAmount: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Deductible must be a valid number with up to 2 decimal places"),
  protectionCost: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Protection cost must be a valid number with up to 2 decimal places")
    .optional(),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

interface CreateReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateReservationDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateReservationDialogProps) {
  const vehicles = useQuery(api.vehicles.getAllVehicles);
  const createReservation = useMutation(api.reservations.createReservation);

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
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerMessage: "",
      flightNumber: "",
      promoCode: "",
      isSCDWSelected: false,
      deductibleAmount: "0",
      protectionCost: "0",
    },
  });

  // Watch form dates for seasonal pricing
  const watchedStartDate = form.watch("startDate");
  const watchedEndDate = form.watch("endDate");

  // Get seasonal pricing based on selected dates
  const { multiplier: seasonalMultiplier, seasonId } = useDateBasedSeasonalPricing(
    watchedStartDate ? new Date(watchedStartDate) : null,
    watchedEndDate ? new Date(watchedEndDate) : null,
  );

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (values: ReservationFormData) => {
    setIsSubmitting(true);

    try {
      const startDate = new Date(values.startDate).getTime();
      const endDate = new Date(values.endDate).getTime();

      await createReservation({
        vehicleId: values.vehicleId as Id<"vehicles">,
        startDate,
        endDate,
        pickupTime: values.pickupTime,
        restitutionTime: values.restitutionTime,
        pickupLocation: values.pickupLocation,
        restitutionLocation: values.restitutionLocation,
        paymentMethod: values.paymentMethod,
        totalPrice: parseFloat(values.totalPrice),
        customerInfo: {
          name: values.customerName,
          email: values.customerEmail,
          phone: values.customerPhone,
          message: values.customerMessage || undefined,
          flightNumber: values.flightNumber || undefined,
        },
        promoCode: values.promoCode || undefined,
        additionalCharges: undefined,
        isSCDWSelected: values.isSCDWSelected,
        deductibleAmount: parseFloat(values.deductibleAmount),
        protectionCost: values.protectionCost ? parseFloat(values.protectionCost) : undefined,
        seasonId: seasonId as Id<"seasons"> | undefined,
        seasonalMultiplier: seasonalMultiplier,
      });

      toast.success("Reservation created successfully");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating reservation:", error);
      toast.error("Failed to create reservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNumberInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[0-9.]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  };

  // Calculate suggested total price based on vehicle, days, and protection with seasonal pricing
  const calculateSuggestedPrice = () => {
    const vehicleId = form.watch("vehicleId");
    const startDate = form.watch("startDate");
    const endDate = form.watch("endDate");
    const protectionCost = parseFloat(form.watch("protectionCost") || "0");

    if (!vehicleId || !vehicles || !startDate || !endDate) return null;

    const selectedVehicle = vehicles.find(v => v._id === vehicleId);
    if (!selectedVehicle) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    const seasonalPricePerDay = getPriceForDurationWithSeason(selectedVehicle, days, seasonalMultiplier);
    const basePrice = seasonalPricePerDay * days;
    return basePrice + protectionCost;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Reservation</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(80vh-150px)] pr-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className={cn(
              "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full grid grid-cols-3"
            )}>
              <TabsTrigger 
                value="details"
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                )}
              >
                Reservation Details
              </TabsTrigger>
              <TabsTrigger 
                value="customer"
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                )}
              >
                Customer Info
              </TabsTrigger>
              <TabsTrigger 
                value="pricing"
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                )}
              >
                Pricing & Payment
              </TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                <TabsContent 
                  value="details" 
                  className={cn(
                    "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4"
                  )}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="vehicleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select vehicle" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vehicles?.filter(v => v.status === 'available').map((vehicle) => (
                                <SelectItem key={vehicle._id} value={vehicle._id}>
                                  {vehicle.make} {vehicle.model} ({vehicle.year}) - {Math.round((vehicle.pricingTiers && vehicle.pricingTiers.length > 0 ? vehicle.pricingTiers[0].pricePerDay : 50) * seasonalMultiplier)} EUR/day
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
                          
                          if (!vehicleId || !vehicles || !startDate || !endDate) {
                            return "Select vehicle and dates to see pricing";
                          }

                          const selectedVehicle = vehicles.find(v => v._id === vehicleId);
                          if (!selectedVehicle) return "";

                          const start = new Date(startDate);
                          const end = new Date(endDate);
                          const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

                          const seasonalPricePerDay = getPriceForDurationWithSeason(selectedVehicle, days, seasonalMultiplier);
                          return `${days} ${days !== 1 ? 'days' : 'day'} × ${seasonalPricePerDay} EUR = ${days * seasonalPricePerDay} EUR`;
                        })()}
                      </div>
                    </div>

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
                            <Input {...field} disabled={isSubmitting} placeholder="e.g., Bucharest Airport" />
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
                            <Input {...field} disabled={isSubmitting} placeholder="e.g., Bucharest Airport" />
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
                    "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4"
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
                            <Input {...field} type="email" disabled={isSubmitting} />
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
                    "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4"
                  )}
                >
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Protection & Insurance</h4>
                    
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
                                // If SCDW is selected, set deductible to 0
                                if (checked) {
                                  form.setValue("deductibleAmount", "0");
                                }
                              }}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Super Collision Damage Waiver (SCDW)
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Zero deductible protection
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
                                disabled={isSubmitting || form.watch("isSCDWSelected")}
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
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

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
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isSubmitting}
                              onClick={() => {
                                const suggestedPrice = calculateSuggestedPrice();
                                if (suggestedPrice !== null) {
                                  form.setValue("totalPrice", suggestedPrice.toString());
                                }
                              }}
                            >
                              Auto
                            </Button>
                          </div>
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
                          <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                              <SelectItem value="card_on_delivery">Card on Delivery</SelectItem>
                              <SelectItem value="card_online">Card Online</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="promoCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promo Code (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g., SUMMER2024"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Pricing Breakdown */}
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <h4 className="text-sm font-medium">Pricing Breakdown</h4>
                    {(() => {
                      const vehicleId = form.watch("vehicleId");
                      const startDate = form.watch("startDate");
                      const endDate = form.watch("endDate");
                      const protectionCost = parseFloat(form.watch("protectionCost") || "0");
                      const isSCDW = form.watch("isSCDWSelected");
                      
                      if (!vehicleId || !vehicles || !startDate || !endDate) {
                        return <p className="text-sm text-muted-foreground">Select vehicle and dates to see breakdown</p>;
                      }

                      const selectedVehicle = vehicles.find(v => v._id === vehicleId);
                      if (!selectedVehicle) return null;

                      const start = new Date(startDate);
                      const end = new Date(endDate);
                      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                      
                      const seasonalPricePerDay = getPriceForDurationWithSeason(selectedVehicle, days, seasonalMultiplier);
                      const basePrice = seasonalPricePerDay * days;

                      return (
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Base rental ({days} {days !== 1 ? 'days' : 'day'})</span>
                            <span>{basePrice.toFixed(2)} EUR</span>
                          </div>
                          {protectionCost > 0 && (
                            <div className="flex justify-between">
                              <span>Protection ({isSCDW ? 'SCDW' : 'Standard'})</span>
                              <span>{protectionCost.toFixed(2)} EUR</span>
                            </div>
                          )}
                          <div className="border-t pt-1 flex justify-between font-medium">
                            <span>Total</span>
                            <span>{(basePrice + protectionCost).toFixed(2)} EUR</span>
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
            {isSubmitting ? "Creating..." : "Create Reservation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
