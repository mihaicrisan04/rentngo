"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Fuel, 
  Cog, 
  CarFront, 
  Users,
  Gauge
} from "lucide-react";
import { Vehicle } from "@/types/vehicle";

interface VehicleSpecificationsProps {
  vehicle: Vehicle;
}

export function VehicleSpecifications({ vehicle }: VehicleSpecificationsProps) {
  const specifications = [
    {
      icon: CarFront,
      label: "Year",
      value: vehicle.year?.toString(),
      show: !!vehicle.year
    },
    {
      icon: Users,
      label: "Seats",
      value: vehicle.seats?.toString(),
      show: !!vehicle.seats
    },
    {
      icon: Cog,
      label: "Engine",
      value: vehicle.engineCapacity 
        ? `${vehicle.engineCapacity.toFixed(1)}L ${vehicle.engineType || ''}`.trim()
        : undefined,
      show: !!vehicle.engineCapacity
    },
    {
      icon: Fuel,
      label: "Fuel",
      value: vehicle.fuelType,
      show: !!vehicle.fuelType
    },
    {
      icon: Gauge,
      label: "Transmission",
      value: vehicle.transmission,
      show: !!vehicle.transmission
    },
    {
      icon: MapPin,
      label: "Location",
      value: vehicle.location,
      show: !!vehicle.location
    }
  ];

  const visibleSpecs = specifications.filter(spec => spec.show);

  return (
    <div className="space-y-6">
      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {visibleSpecs.map((spec, index) => {
              const IconComponent = spec.icon;
              return (
                <div key={index} className="flex items-center space-x-2">
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{spec.label}: {spec.value}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      {vehicle.features && vehicle.features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {vehicle.features.map((feature, index) => (
                <Badge key={index} variant="secondary">
                  {feature}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 