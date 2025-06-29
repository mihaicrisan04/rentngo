// app/dashboard/cars/[id]/page.tsx
"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { VehicleImage } from "@/components/vehicle-image";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EditVehicleForm } from "@/components/edit-vehicle-form";

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as Id<"vehicles">;
  
  const vehicle = useQuery(api.vehicles.getById, { id: vehicleId });
  const deleteVehicleMutation = useMutation(api.vehicles.remove);
  const uploadImages = useAction(api.vehicles.uploadImages as any);
  const setMainImage = useMutation(api.vehicles.setMainImage);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (!vehicle) {
    return <div className="flex justify-center items-center h-screen">Loading vehicle details...</div>;
  }

  const performDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteVehicleMutation({ id: vehicleId });
      router.push("/dashboard/vehicles");
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      alert("Failed to delete vehicle");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        const imageBuffers = await Promise.all(
          Array.from(e.target.files).map(async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            return arrayBuffer;
          })
        );

        await uploadImages({
          vehicleId,
          images: imageBuffers
        });
      } catch (error) {
        console.error("Error uploading images:", error);
        alert("Failed to upload images");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSetMainImage = async (imageId: Id<"_storage">) => {
    try {
      await setMainImage({ vehicleId, imageId });
    } catch (error) {
      console.error("Error setting main image:", error);
      alert("Failed to set main image");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">
          {vehicle.make} {vehicle.model}
        </h1>
        <div className="flex space-x-2 w-full sm:w-auto">
          {/* Edit Button */}
          <Button 
            onClick={() => setIsEditDialogOpen(true)}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            Edit
          </Button>

          {/* Delete Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={isDeleting}
                className="flex-1 sm:flex-none"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the 
                  vehicle and all its associated data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={performDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Yes, delete vehicle"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Vehicle Details */}
      <div className="bg-background rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Vehicle Information</h2>
            <dl className="space-y-3">
              {[
                { label: "Year", value: vehicle.year },
                { label: "Type", value: vehicle.type, capitalize: true },
                { label: "Transmission", value: vehicle.transmission, capitalize: true },
                { label: "Fuel Type", value: vehicle.fuelType, capitalize: true },
                { label: "Seats", value: vehicle.seats },
                { label: "Price per Day", value: `${vehicle.pricePerDay} RON` },
                { label: "Location", value: vehicle.location },
              ].map(item => (
                <div key={item.label}>
                  <dt className="text-sm font-medium text-muted-foreground">{item.label}</dt>
                  <dd className={`text-foreground ${item.capitalize ? 'capitalize' : ''}`}>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Image Upload & Gallery */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Images</h2>
            <div className="mb-4">
              <label htmlFor="image-upload" className="block text-sm font-medium text-muted-foreground mb-1">
                Upload New Images
              </label>
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
              />
              {isUploading && <p className="text-sm text-indigo-600 mt-1">Uploading...</p>}
            </div>

            {vehicle.images && vehicle.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {vehicle.images.map((imageId) => (
                  <div
                    key={imageId}
                    className={`relative group rounded-md overflow-hidden border ${
                      imageId === vehicle.mainImageId ? "ring-2 ring-indigo-500 ring-offset-2" : "border-gray-200"
                    }`}
                  >
                    <VehicleImage 
                      imageId={imageId} 
                      alt="Vehicle image" 
                      className="w-full h-32 object-cover" 
                    />
                    {imageId !== vehicle.mainImageId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetMainImage(imageId)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background text-xs"
                      >
                        Set Main
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No images uploaded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Vehicle Dialog */}
      {vehicleId && (
        <EditVehicleForm
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          vehicleId={vehicleId}
          onSuccess={() => {
            setIsEditDialogOpen(false);
            // Optionally, you can add a toast notification here or trigger a data refresh
            // For now, Convex queries should update automatically
          }}
        />
      )}
    </div>
  );
}