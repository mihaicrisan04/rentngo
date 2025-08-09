"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// Assuming these types are defined in a shared location or are appropriate here
type VehicleType = "sedan" | "suv" | "hatchback" | "sports";
type TransmissionType = "automatic" | "manual";
type FuelType = "benzina" | "diesel" | "electric" | "hybrid";
type StatusType = "available" | "rented" | "maintenance"; // Assuming vehicle object has status

interface EditVehicleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId: Id<"vehicles">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const initialFormData = {
  make: "",
  model: "",
  year: new Date().getFullYear(),
  type: "sedan" as VehicleType,
  seats: 5,
  transmission: "automatic" as TransmissionType,
  fuelType: "benzina" as FuelType,
      // pricePerDay removed - using pricingTiers only
  location: "",
  features: [] as string[],
  status: "available" as StatusType, // Default status
  engineCapacity: 0, // Added engineCapacity
  engineType: "", // Added engineType
};

export function EditVehicleForm({
  open,
  onOpenChange,
  vehicleId,
  onSuccess,
  onCancel,
}: EditVehicleFormProps) {
  const vehicle = useQuery(api.vehicles.getById, vehicleId ? { id: vehicleId } : "skip");
  const updateVehicle = useMutation(api.vehicles.update); // IMPORTANT: Ensure api.vehicles.update exists
  const uploadImages = useAction(api.vehicles.uploadImages as any);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (open && vehicle) {
      setFormData({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year || new Date().getFullYear(),
        type: vehicle.type as VehicleType,
        seats: vehicle.seats || 5,
        transmission: vehicle.transmission as TransmissionType,
        fuelType: vehicle.fuelType as FuelType,
        // pricePerDay removed - using pricingTiers only
        location: vehicle.location || "",
        features: vehicle.features || [],
        status: (vehicle.status || "available") as StatusType, // Handle if status is not present
        engineCapacity: vehicle.engineCapacity || 0, // Add with fallback
        engineType: vehicle.engineType || "", // Add with fallback
      });
      setSelectedFiles(null);
      setPreviewUrls([]);
    } else if (!open) {
      // Reset form when dialog closes to avoid stale data
      setFormData(initialFormData);
      setSelectedFiles(null);
      setPreviewUrls([]);
    }
  }, [open, vehicle, vehicleId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(e.target.files);

      previewUrls.forEach(url => URL.revokeObjectURL(url));
      
      const urls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return; // Should not happen if form is open and populated

    setIsSubmitting(true);

    try {
      const vehicleDataToSubmit = {
        ...formData,
        year: Number(formData.year),
        seats: Number(formData.seats),
        // pricePerDay removed - using pricingTiers only
        engineCapacity: Number(formData.engineCapacity), // Ensure it's a number
        engineType: formData.engineType,
      };
      
      // IMPORTANT: This assumes your api.vehicles.update mutation takes { id, ...data }
      await updateVehicle({ id: vehicleId, ...vehicleDataToSubmit });

      if (selectedFiles && selectedFiles.length > 0) {
        const imageBuffers = await Promise.all(
          Array.from(selectedFiles).map(async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            return arrayBuffer;
          })
        );

        await uploadImages({
          vehicleId: vehicleId,
          images: imageBuffers,
        });
      }
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert("Failed to update vehicle. Please check console for details.");
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
    setFormData(prev => ({
      ...prev,
      features: checked === true
        ? [...prev.features, featureLower]
        : prev.features.filter(f => f !== featureLower)
    }));
  };
  
  if (!open && !vehicle) {
    // Don't render anything or render a loader if vehicle data is not yet available but dialog is supposed to be open
    // This check might need refinement based on how `open` and `vehicle` states interact
    return null; 
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Vehicle</DialogTitle>
        </DialogHeader>
        {vehicle ? (
        <ScrollArea className="max-h-[calc(80vh-150px)] pr-6">
          <form onSubmit={handleSubmit} id="vehicleEditForm" className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-make">Make</Label>
                <Input
                  id="edit-make"
                  type="text"
                  required
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-model">Model</Label>
                <Input
                  id="edit-model"
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="edit-year">Year</Label>
                <Input
                  id="edit-year"
                  type="number"
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: string) => setFormData({ ...formData, type: value as VehicleType })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="mt-1" id="edit-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="hatchback">Hatchback</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-seats">Seats</Label>
                <Input
                  id="edit-seats"
                  type="number"
                  required
                  min="1"
                  max="15"
                  value={formData.seats}
                  onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) || 0})}
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="edit-transmission">Transmission</Label>
                <Select
                  value={formData.transmission}
                  onValueChange={(value: string) => setFormData({ ...formData, transmission: value as TransmissionType })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="mt-1" id="edit-transmission">
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-fuelType">Fuel Type</Label>
                <Select
                  value={formData.fuelType}
                  onValueChange={(value: string) => setFormData({ ...formData, fuelType: value as FuelType })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="mt-1" id="edit-fuelType">
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="benzina">Benzina</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              
              <div className="md:col-span-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="edit-engineCapacity">Engine Capacity (e.g., 2.0)</Label>
                <Input
                  id="edit-engineCapacity"
                  type="number"
                  step="0.1"
                  required
                  value={formData.engineCapacity}
                  onChange={(e) => setFormData({ ...formData, engineCapacity: parseFloat(e.target.value) || 0 })}
                  className="mt-1"
                  disabled={isSubmitting}
                  placeholder="e.g., 1.6"
                />
              </div>

              <div>
                <Label htmlFor="edit-engineType">Engine Type (e.g., TSI, dCi)</Label>
                <Input
                  id="edit-engineType"
                  type="text"
                  required
                  value={formData.engineType}
                  onChange={(e) => setFormData({ ...formData, engineType: e.target.value })}
                  className="mt-1"
                  disabled={isSubmitting}
                  placeholder="e.g., TSI, dCi"
                />
              </div>
            </div>

            <div>
              <Label>Features</Label>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                {["Air Conditioning", "Bluetooth", "Parking Sensors", "Backup Camera", "GPS", "Sunroof", "Heated Seats"].map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-feature-${feature.toLowerCase().replace(/\s+/g, '-')}`}
                      checked={formData.features.includes(feature.toLowerCase())}
                      onCheckedChange={(checked: CheckedState) => handleFeatureChange(feature, checked)}
                      disabled={isSubmitting}
                    />
                    <Label htmlFor={`edit-feature-${feature.toLowerCase().replace(/\s+/g, '-')}`} className="font-normal">
                      {feature}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="edit-file-upload-input">Upload New Images</Label>
              <p className="mt-1 text-xs text-gray-500">Uploading new images will add them to the existing gallery. Current images are not shown here but will be preserved unless replaced by a more specific image update mechanism.</p>
              <div className="mt-2">
                <Input
                  id="edit-file-upload-input"
                  name="edit-file-upload-input"
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
                  <h3 className="text-sm font-medium text-gray-700">New Images Previews</h3>
                  <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="h-24 w-full object-cover rounded"
                          onLoad={() => URL.revokeObjectURL(url)} // Clean up object URLs after image loads
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>
        </ScrollArea>
        ) : (
          <div className="flex justify-center items-center h-40">Loading vehicle data...</div>
        )}
        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting || !vehicle}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="vehicleEditForm" // ensure this matches the form id
            disabled={isSubmitting || !vehicle}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
