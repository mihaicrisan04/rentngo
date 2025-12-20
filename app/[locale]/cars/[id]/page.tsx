import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { CarDetailClient } from "./CarDetailClient";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const vehicle = await fetchQuery(api.vehicles.getById, {
      id: id as Id<"vehicles">,
    });

    if (!vehicle) {
      return {
        title: "Vehicle Not Found | Rent'n Go",
        description: "The requested vehicle could not be found.",
      };
    }

    const vehicleName = `${vehicle.make} ${vehicle.model}${vehicle.year ? ` ${vehicle.year}` : ""}`;

    return {
      title: `${vehicleName} - Masini de Inchiriat Cluj-Napoca | Rent'n Go`,
      description: `Închiriază ${vehicleName} în Cluj-Napoca cu Rent'n Go. ${vehicle.seats || ""} locuri, ${vehicle.fuelType || "Petrol"}, ${vehicle.transmission || "Manual"}. Rezervare online rapidă pentru masini de inchiriat Cluj.`,
      keywords: `${vehicleName}, masini de inchiriat cluj-napoca, ${vehicle.make} închiriere, car rental ${vehicle.model}, rent ${vehicle.make} cluj`,
      robots: "index, follow",
    };
  } catch {
    return {
      title: "Vehicle | Rent'n Go",
      description: "Car rental in Cluj-Napoca",
    };
  }
}

export default async function CarDetailPage({ params }: PageProps) {
  const { id } = await params;

  const vehicle = await fetchQuery(api.vehicles.getById, {
    id: id as Id<"vehicles">,
  });

  if (!vehicle) {
    notFound();
  }

  let mainImageUrl: string | null = null;
  if (vehicle.mainImageId) {
    mainImageUrl = await fetchQuery(api.vehicles.getImageUrl, {
      imageId: vehicle.mainImageId,
    });
  }

  const imageUrls: Record<string, string> = {};
  if (vehicle.images && vehicle.images.length > 0) {
    const urls = await Promise.all(
      vehicle.images.map(async (imageId) => {
        const url = await fetchQuery(api.vehicles.getImageUrl, {
          imageId,
        });
        return { imageId: imageId.toString(), url };
      })
    );
    urls.forEach(({ imageId, url }) => {
      if (url) {
        imageUrls[imageId] = url;
      }
    });
  }

  return (
    <CarDetailClient
      vehicle={vehicle}
      mainImageUrl={mainImageUrl}
      imageUrls={imageUrls}
    />
  );
}