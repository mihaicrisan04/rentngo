"use client";

import { useState, useEffect } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { VehicleType, VehicleClass, TransmissionType, FuelType, VehicleStatus, PricingTier } from "@/types/vehicle";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

import { ModernImageUploadPreview } from "@/components/ui/modern-image-upload-preview";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { CheckedState } from "@radix-ui/react-checkbox";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;
const TabsList = TabsPrimitive.List;
const TabsTrigger = TabsPrimitive.Trigger;
const TabsContent = TabsPrimitive.Content;

const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required").max(50, "Make must be less than 50 characters"),
  model: z.string().min(1, "Model is required").max(50, "Model must be less than 50 characters"),
  year: z.string()
    .min(1, "Year is required")
    .regex(/^\d{4}$/, "Year must be a 4-digit number")
    .refine((val) => {
      const year = parseInt(val);
      return year >= 1900 && year <= new Date().getFullYear() + 1;
    }, "Year must be between 1900 and next year"),
  type: z.enum(["sedan", "suv", "hatchback", "sports", "truck", "van"], {
    required_error: "Vehicle type is required",
  }),
  class: z.enum(["economy", "compact", "intermediate", "standard", "full-size", "premium", "luxury", "sport", "executive", "commercial", "convertible", "super-sport", "supercars", "business", "van"], {
    required_error: "Vehicle class is required",
  }),
  seats: z.string()
    .min(1, "Number of seats is required")
    .regex(/^\d+$/, "Seats must be a number")
    .refine((val) => {
      const seats = parseInt(val);
      return seats >= 1 && seats <= 15;
    }, "Seats must be between 1 and 15"),
  transmission: z.enum(["automatic", "manual"], {
    required_error: "Transmission type is required",
  }),
  fuelType: z.enum(["diesel", "electric", "hybrid", "benzina"], {
    required_error: "Fuel type is required",
  }),
  engineCapacity: z.string()
    .min(1, "Engine capacity is required")
    .regex(/^\d+(\.\d+)?$/, "Engine capacity must be a valid number")
    .refine((val) => {
      const capacity = parseFloat(val);
      return capacity > 0 && capacity <= 10;
    }, "Engine capacity must be between 0.1 and 10.0"),
  engineType: z.string().min(1, "Engine type is required").max(20, "Engine type must be less than 20 characters"),
  // Remove pricePerDay validation as it's no longer needed
  warranty: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Warranty must be a valid number")
    .optional()
    .or(z.literal("")),
  features: z.array(z.string()),
  status: z.enum(["available", "rented", "maintenance"]),
  pricingTiers: z.array(z.object({
    minDays: z.number().min(1),
    maxDays: z.number().min(1),
    pricePerDay: z.number().min(0),
  })).min(1, "At least one pricing tier is required"),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface CreateVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const availableFeatures = [
  "Air Conditioning", "Bluetooth", "Parking Sensors", "Backup Camera", 
  "GPS", "Sunroof", "Heated Seats", "Cruise Control", "Leather Seats",
  "USB Charging", "Wireless Charging", "Premium Audio", "Android Auto", "Apple CarPlay",
];

export function CreateVehicleDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateVehicleDialogProps) {
  const createVehicle = useMutation(api.vehicles.create);
  const uploadImages = useAction(api.vehicles.uploadImages as any);
  const setMainImage = useMutation(api.vehicles.setMainImage);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([{ minDays: 1, maxDays: 999, pricePerDay: 50 }]);
  const [selectedImageFiles, setSelectedImageFiles] = useState<Array<{file: File; previewUrl: string; error?: string}>>([]);

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear().toString(),
      type: "sedan",
      class: "economy",
      seats: "5",
      transmission: "automatic",
      fuelType: "diesel",
      engineCapacity: "",
      engineType: "",
      // pricePerDay removed - using pricingTiers only
      warranty: "",
      features: [],
      status: "available",
      pricingTiers: [{ minDays: 1, maxDays: 999, pricePerDay: 50 }], // Default tier
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        make: "",
        model: "",
        year: new Date().getFullYear().toString(),
        type: "sedan",
        class: "economy",
        seats: "5",
        transmission: "automatic",
        fuelType: "diesel",
        engineCapacity: "",
        engineType: "",
        // pricePerDay removed - using pricingTiers only
        warranty: "",
        features: [],
        status: "available",
        pricingTiers: [{ minDays: 1, maxDays: 999, pricePerDay: 50 }], // Default tier
      });
      setPricingTiers([{ minDays: 1, maxDays: 999, pricePerDay: 50 }]); // Default tier
      setSelectedImageFiles([]);
    }
  }, [open, form]);



  const onSubmit = async (values: VehicleFormData) => {
    setIsSubmitting(true);

    try {
      const vehicleDataToSubmit = {
        make: values.make,
        model: values.model,
        year: parseInt(values.year),
        type: values.type as VehicleType,
        class: values.class as VehicleClass,
        seats: parseInt(values.seats),
        transmission: values.transmission as TransmissionType,
        fuelType: values.fuelType as FuelType,
        engineCapacity: parseFloat(values.engineCapacity),
        engineType: values.engineType,
        // pricePerDay removed - using pricingTiers only
        warranty: values.warranty ? parseFloat(values.warranty) : 0,
        features: values.features,
        status: values.status as VehicleStatus,
        pricingTiers: pricingTiers,
      };

      const vehicleId = await createVehicle(vehicleDataToSubmit);

      // Upload images if any are selected
      if (selectedImageFiles.length > 0) {
        const validFiles = selectedImageFiles.filter(f => !f.error);
        const imageBuffers = await Promise.all(
          validFiles.map(async (fileData) => {
            const arrayBuffer = await fileData.file.arrayBuffer();
            return arrayBuffer;
          })
        );

        const uploadedImageIds = await uploadImages({
          vehicleId: vehicleId as Id<"vehicles">,
          images: imageBuffers,
        });

        // Set main image (first image)
        if (uploadedImageIds && uploadedImageIds.length > 0) {
          await setMainImage({
            vehicleId: vehicleId as Id<"vehicles">,
            imageId: uploadedImageIds[0],
          });
        }
      }
      
      toast.success("Vehicle created successfully");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      toast.error("Failed to create vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeatureChange = (feature: string, checked: CheckedState) => {
    const featureLower = feature.toLowerCase();
    const currentFeatures = form.getValues("features");
    
    if (checked === true) {
      form.setValue("features", [...currentFeatures, featureLower]);
    } else {
      form.setValue("features", currentFeatures.filter(f => f !== featureLower));
    }
  };

  const addPricingTier = () => {
    const newTiers = [...pricingTiers, { minDays: 1, maxDays: 7, pricePerDay: 0 }];
    setPricingTiers(newTiers);
    form.setValue("pricingTiers", newTiers);
  };

  const removePricingTier = (index: number) => {
    const newTiers = pricingTiers.filter((_, i) => i !== index);
    setPricingTiers(newTiers);
    form.setValue("pricingTiers", newTiers);
  };

  const updatePricingTier = (index: number, field: keyof PricingTier, value: number) => {
    const newTiers = pricingTiers.map((tier, i) => 
      i === index ? { ...tier, [field]: value } : tier
    );
    setPricingTiers(newTiers);
    form.setValue("pricingTiers", newTiers);
  };

  // Helper function to allow only numbers in text inputs
  const handleNumberInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[0-9.]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  };

  // Helper function for integer-only inputs
  const handleIntegerInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  };





  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Vehicle</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(80vh-150px)] pr-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className={cn(
              "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full grid grid-cols-4"
            )}>
              <TabsTrigger 
                value="basic"
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                )}
              >
                Basic Info
              </TabsTrigger>
              <TabsTrigger 
                value="pricing"
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                )}
              >
                Pricing
              </TabsTrigger>
              <TabsTrigger 
                value="features"
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                )}
              >
                Features
              </TabsTrigger>
              <TabsTrigger 
                value="images"
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                )}
              >
                Images
              </TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                <TabsContent 
                  value="basic" 
                  className={cn(
                    "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4"
                  )}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Make</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              onKeyDown={handleIntegerInput}
                              disabled={isSubmitting}
                              placeholder="e.g., 2024"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sedan">Sedan</SelectItem>
                              <SelectItem value="suv">SUV</SelectItem>
                              <SelectItem value="hatchback">Hatchback</SelectItem>
                              <SelectItem value="sports">Sports</SelectItem>
                              <SelectItem value="truck">Truck</SelectItem>
                              <SelectItem value="van">Van</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="class"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="economy">Economy</SelectItem>
                              <SelectItem value="compact">Compact</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="full-size">Full-Size</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="luxury">Luxury</SelectItem>
                              <SelectItem value="sport">Sport</SelectItem>
                              <SelectItem value="executive">Executive</SelectItem>
                              <SelectItem value="commercial">Commercial</SelectItem>
                              <SelectItem value="convertible">Convertible</SelectItem>
                              <SelectItem value="super-sport">Super Sport</SelectItem>
                              <SelectItem value="supercars">Supercars</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="van">Van</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seats"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seats</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              onKeyDown={handleIntegerInput}
                              disabled={isSubmitting}
                              placeholder="e.g., 5"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="transmission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transmission</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select transmission" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="automatic">Automatic</SelectItem>
                              <SelectItem value="manual">Manual</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fuelType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fuel Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select fuel type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="diesel">Diesel</SelectItem>
                              <SelectItem value="electric">Electric</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                              <SelectItem value="benzina">Benzina</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="engineCapacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Engine Capacity (L)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              onKeyDown={handleNumberInput}
                              disabled={isSubmitting}
                              placeholder="e.g., 1.6"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="engineType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Engine Type</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={isSubmitting}
                              placeholder="e.g., TSI, dCi"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="warranty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Warranty (EUR)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              onKeyDown={handleNumberInput}
                              disabled={isSubmitting}
                              placeholder="e.g., 500.00"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="rented">Rented</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent 
                  value="pricing" 
                  className={cn(
                    "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4"
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FormLabel>Pricing Tiers</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addPricingTier}
                        disabled={isSubmitting}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Tier
                      </Button>
                    </div>
                    
                    {pricingTiers.map((tier, index) => (
                      <div key={index} className="flex items-end gap-2 p-3 border rounded-lg">
                        <div className="flex-1">
                          <FormLabel className="text-xs">Min Days</FormLabel>
                          <Input
                            type="text"
                            value={tier.minDays.toString()}
                            onKeyDown={handleIntegerInput}
                            onChange={(e) => updatePricingTier(index, "minDays", parseInt(e.target.value) || 1)}
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="flex-1">
                          <FormLabel className="text-xs">Max Days</FormLabel>
                          <Input
                            type="text"
                            value={tier.maxDays.toString()}
                            onKeyDown={handleIntegerInput}
                            onChange={(e) => updatePricingTier(index, "maxDays", parseInt(e.target.value) || 1)}
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="flex-1">
                          <FormLabel className="text-xs">Price/Day (EUR)</FormLabel>
                          <Input
                            type="text"
                            value={tier.pricePerDay.toString()}
                            onKeyDown={handleNumberInput}
                            onChange={(e) => updatePricingTier(index, "pricePerDay", parseFloat(e.target.value) || 0)}
                            disabled={isSubmitting}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removePricingTier(index)}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent 
                  value="features" 
                  className={cn(
                    "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4"
                  )}
                >
                  <FormField
                    control={form.control}
                    name="features"
                    render={() => (
                      <FormItem>
                        <FormLabel>Features</FormLabel>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                          {availableFeatures.map((feature) => (
                            <div key={feature} className="flex items-center space-x-2">
                              <Checkbox
                                id={`feature-${feature.toLowerCase().replace(/\s+/g, '-')}`}
                                checked={form.watch("features").includes(feature.toLowerCase())}
                                onCheckedChange={(checked: CheckedState) => handleFeatureChange(feature, checked)}
                                disabled={isSubmitting}
                              />
                              <FormLabel htmlFor={`feature-${feature.toLowerCase().replace(/\s+/g, '-')}`} className="font-normal">
                                {feature}
                              </FormLabel>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent 
                  value="images" 
                  className={cn(
                    "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4"
                  )}
                >
                  <ModernImageUploadPreview
                    files={selectedImageFiles}
                    onFilesChange={setSelectedImageFiles}
                    onError={(error) => {
                      toast.error(error);
                    }}
                    maxFiles={10}
                    disabled={isSubmitting}
                    label="Vehicle Images"
                    description="Select images for this vehicle. First image will be the main display image. Images will be uploaded when you create the vehicle. PNG, JPG, GIF, WebP up to 10MB each."
                  />
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
            {isSubmitting ? "Creating..." : "Create Vehicle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
