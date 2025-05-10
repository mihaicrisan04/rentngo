// app/dashboard/cars/[id]/page.tsx
"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { VehicleImage } from "@/components/VehicleImage";

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as Id<"vehicles">;
  
  const vehicle = useQuery(api.vehicles.getById, { id: vehicleId });
  const deleteVehicle = useMutation(api.vehicles.remove);
  const uploadImages = useAction(api.vehicles.uploadImages);
  const setMainImage = useMutation(api.vehicles.setMainImage);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  if (!vehicle) {
    return <div>Loading...</div>;
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      setIsDeleting(true);
      try {
        await deleteVehicle({ id: vehicleId });
        router.push("/dashboard/cars");
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        alert("Failed to delete vehicle");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
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
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {vehicle.make} {vehicle.model}
        </h1>
        <div className="space-x-2">
          <button
            onClick={() => router.push(`/dashboard/cars/${vehicleId}/edit`)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* Vehicle Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Vehicle Information</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-gray-600">Year</dt>
                <dd>{vehicle.year}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Type</dt>
                <dd className="capitalize">{vehicle.type}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Transmission</dt>
                <dd className="capitalize">{vehicle.transmission}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Fuel Type</dt>
                <dd className="capitalize">{vehicle.fuelType}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Seats</dt>
                <dd>{vehicle.seats}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Price per Day</dt>
                <dd>{vehicle.pricePerDay} RON</dd>
              </div>
              <div>
                <dt className="text-gray-600">Location</dt>
                <dd>{vehicle.location}</dd>
              </div>
            </dl>
          </div>

          {/* Image Upload */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Images</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Upload New Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="mt-1 block w-full"
              />
            </div>

            {/* Image Gallery */}
            <div className="grid grid-cols-2 gap-4">
              {vehicle.images.map((imageId) => (
                <div
                  key={imageId}
                  className={`relative group ${
                    imageId === vehicle.mainImageId ? "ring-2 ring-indigo-500" : ""
                  }`}
                >
                  <VehicleImage 
                    imageId={imageId} 
                    alt="Vehicle" 
                    className="w-full h-32 object-cover rounded" 
                  />
                  <button
                    onClick={() => handleSetMainImage(imageId)}
                    className={`absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity ${
                      imageId === vehicle.mainImageId ? "hidden" : ""
                    }`}
                  >
                    Set as Main
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}