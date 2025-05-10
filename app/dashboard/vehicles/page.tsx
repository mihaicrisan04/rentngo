"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import { CreateVehicleForm } from "@/components/CreateVehicleForm";
import { VehicleImage } from "@/components/VehicleImage";

export default function VehiclesPage() {
  const vehicles = useQuery(api.vehicles.getAll);
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vehicles</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add New Vehicle
        </button>
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
        {vehicles?.map((vehicle: any) => (
          <Link
            key={vehicle._id}
            href={`/dashboard/vehicles/${vehicle._id}`}
            className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-w-16 aspect-h-9">
              {vehicle.mainImageId ? (
                <VehicleImage 
                  imageId={vehicle.mainImageId} 
                  alt={`${vehicle.make} ${vehicle.model}`} 
                  className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold">
                {vehicle.make} {vehicle.model}
              </h2>
              <p className="text-gray-600">{vehicle.year}</p>
              <p className="text-gray-600">{vehicle.type}</p>
              <p className="text-indigo-600 font-semibold mt-2">
                {vehicle.pricePerDay} RON/day
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Create Vehicle Form Modal */}
      {showCreateForm && (
        <CreateVehicleForm
          onSuccess={() => setShowCreateForm(false)}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
}