"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import { CreateVehicleForm } from "@/components/create-vehicle-form";
import { VehicleImage } from "@/components/vehicle-image";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Filters = {
  type?: "sedan" | "suv" | "hatchback" | "sports";
  transmission?: "automatic" | "manual";
  fuelType?: "petrol" | "diesel" | "electric" | "hybrid";
  minPrice?: number;
  maxPrice?: number;
  status?: "available" | "rented" | "maintenance";
};

export default function VehiclesPage() {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const observer = useRef<IntersectionObserver | null>(null);
  const ITEMS_PER_PAGE = 12;

  const {
    results: vehicles,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.vehicles.getAll,
    { filters },
    { initialNumItems: ITEMS_PER_PAGE }
  );

  // Last element callback for infinite scroll
  const lastElementRef = useCallback(
    (node: HTMLAnchorElement | null) => {
      if (status !== "CanLoadMore") return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && status === "CanLoadMore") {
          loadMore(ITEMS_PER_PAGE);
        }
      });
      if (node) observer.current.observe(node);
    },
    [status, loadMore]
  );

  const handleFilterChange = (key: keyof Filters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? undefined : value
    }));
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Vehicles</h1>
          <Button onClick={() => setIsCreateFormOpen(true)}>
            Add New Vehicle
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 bg-card text-card-foreground p-4 rounded-lg shadow">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={filters.type || "all"}
              onValueChange={(value) => handleFilterChange("type", value === "all" ? undefined : value as Filters["type"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sedan">Sedan</SelectItem>
                <SelectItem value="suv">SUV</SelectItem>
                <SelectItem value="hatchback">Hatchback</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Transmission</Label>
            <Select
              value={filters.transmission || "all"}
              onValueChange={(value) => handleFilterChange("transmission", value === "all" ? undefined : value as Filters["transmission"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Transmissions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transmissions</SelectItem>
                <SelectItem value="automatic">Automatic</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fuel Type</Label>
            <Select
              value={filters.fuelType || "all"}
              onValueChange={(value) => handleFilterChange("fuelType", value === "all" ? undefined : value as Filters["fuelType"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Fuel Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fuel Types</SelectItem>
                <SelectItem value="petrol">Petrol</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Min Price (RON/day)</Label>
            <Input
              type="number"
              value={filters.minPrice || ""}
              onChange={(e) => handleFilterChange("minPrice", e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Min price"
            />
          </div>

          <div className="space-y-2">
            <Label>Max Price (RON/day)</Label>
            <Input
              type="number"
              value={filters.maxPrice || ""}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Max price"
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => handleFilterChange("status", value === "all" ? undefined : value as Filters["status"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 w-full">
        {vehicles?.map((vehicle: any, index: number) => (
          <Link
            key={vehicle._id}
            href={`/dashboard/vehicles/${vehicle._id}`}
            ref={index === vehicles.length - 1 ? lastElementRef : null}
            className="block bg-card text-card-foreground rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-w-16 aspect-h-9">
              {vehicle.mainImageId ? ( // If there is a main image, use it
                <VehicleImage 
                  imageId={vehicle.mainImageId} 
                  alt={`${vehicle.make} ${vehicle.model}`} 
                  className="w-full h-48 object-cover" 
                />
              ) : (
                vehicle.images.length > 0 ? ( // If there are other images, use the first one
                  <VehicleImage
                    imageId={vehicle.images[0]}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-48 object-cover"
                  />
                ) : ( // If there are no images, show a placeholder
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )
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

      {/* Loading indicator */}
      {status === "LoadingMore" && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Create Vehicle Form Modal (Dialog) */}
      <CreateVehicleForm
        open={isCreateFormOpen}
        onOpenChange={setIsCreateFormOpen}
        onSuccess={() => {
          setIsCreateFormOpen(false);
        }}
        onCancel={() => {
          setIsCreateFormOpen(false);
        }}
      />
    </div>
  );
}