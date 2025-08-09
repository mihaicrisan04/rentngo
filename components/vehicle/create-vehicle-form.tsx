"use client";

import { useState, useEffect } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
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
import { CheckedState } from "@radix-ui/react-checkbox";
import { toast } from "sonner";

type VehicleType = "sedan" | "suv" | "hatchback" | "sports";
type TransmissionType = "automatic" | "manual";
type FuelType = "benzina" | "diesel" | "electric" | "hybrid";
type StatusType = "available" | "rented" | "maintenance";

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
  type: z.enum(["sedan", "suv", "hatchback", "sports"], {
    required_error: "Vehicle type is required",
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
  fuelType: z.enum(["benzina", "diesel", "electric", "hybrid"], {
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
  // pricePerDay removed - using pricingTiers only
  location: z.string().min(1, "Location is required").max(100, "Location must be less than 100 characters"),
  features: z.array(z.string()),
  status: z.enum(["available", "rented", "maintenance"]),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface CreateVehicleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateVehicleForm({
  open,
  onOpenChange,
  onSuccess,
  onCancel,
}: CreateVehicleFormProps) {
  const createVehicle = useMutation(api.vehicles.create);
  const uploadImages = useAction(api.vehicles.uploadImages as any);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear().toString(),
      type: "sedan",
      seats: "5",
      transmission: "automatic",
      fuelType: "benzina",
      engineCapacity: "",
      engineType: "",
      // pricePerDay removed - using pricingTiers only
      location: "",
      features: [],
      status: "available",
    },
  });

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      form.reset();
    } else {
      // Clean up when dialog closes
      setSelectedFiles(null);
      setPreviewUrls([]);
    }
  }, [open, form]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(e.target.files);

      previewUrls.forEach(url => URL.revokeObjectURL(url));
      
      const urls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const onSubmit = async (values: VehicleFormData) => {
    setIsSubmitting(true);

    try {
      const vehicleDataToSubmit = {
        make: values.make,
        model: values.model,
        year: parseInt(values.year),
        type: values.type as VehicleType,
        seats: parseInt(values.seats),
        transmission: values.transmission as TransmissionType,
         fuelType: values.fuelType as FuelType,
        engineCapacity: parseFloat(values.engineCapacity),
        engineType: values.engineType,
        // pricePerDay removed - using pricingTiers only
        location: values.location,
        features: values.features,
        status: values.status as StatusType,
      };

      const vehicleId = await createVehicle(vehicleDataToSubmit as any);

      if (selectedFiles && selectedFiles.length > 0) {
        const imageBuffers = await Promise.all(
          Array.from(selectedFiles).map(async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            return arrayBuffer;
          })
        );

        await uploadImages({
          vehicleId: vehicleId as Id<"vehicles">,
          images: imageBuffers,
        });
      }
      
      toast.success("Vehicle created successfully!", {
        description: `${values.make} ${values.model} has been added to your fleet.`,
        position: "bottom-left",
      });
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      toast.error("Failed to create vehicle", {
        description: "Please check the form and try again.",
        position: "bottom-left",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
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
          <DialogTitle>Create New Vehicle</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(80vh-150px)] pr-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
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
                          onKeyDown={handleNumberInput}
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
                          onKeyDown={handleNumberInput}
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
                         <SelectItem value="benzina">Benzina</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="electric">Electric</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
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
                      <FormLabel>Engine Capacity (e.g., 2.0)</FormLabel>
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
                      <FormLabel>Engine Type (e.g., TSI, dCi)</FormLabel>
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
                  name="location"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="features"
                render={() => (
                  <FormItem>
                    <FormLabel>Features</FormLabel>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                      {["Air Conditioning", "Bluetooth", "Parking Sensors", "Backup Camera", "GPS", "Sunroof", "Heated Seats"].map((feature) => (
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

              <div>
                <FormLabel htmlFor="file-upload-input">Images</FormLabel>
                <div className="mt-2">
                  <Input
                    id="file-upload-input"
                    name="file-upload-input"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={isSubmitting}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                  />
                   <p className="mt-1 text-xs text-gray-500">You can select multiple images. PNG, JPG, GIF up to 10MB each.</p>
                </div>

                {previewUrls.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700">Selected Images Previews</h3>
                    <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-full object-cover rounded"
                            onLoad={() => URL.revokeObjectURL(url)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            Create Vehicle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
