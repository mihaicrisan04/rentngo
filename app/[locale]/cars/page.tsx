import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { CarsPageClient } from "./CarsPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masini de Inchiriat Cluj-Napoca | Rent'n Go",
  description:
    "Găsește masini de inchiriat Cluj-Napoca cu Rent'n Go. Flotă largă de vehicule moderne, prețuri competitive, rezervare online rapidă. Car rentals Cluj-Napoca disponibile 24/7.",
  keywords:
    "masini de inchiriat cluj-napoca, car rentals cluj, închiriere auto cluj, rent car cluj-napoca, vehicule închiriere cluj",
  robots: "index, follow",
};

export default async function CarsPage() {
  const vehicles = await fetchQuery(api.vehicles.getAllVehiclesWithClasses, {});

  const vehiclesWithImageUrls = await Promise.all(
    vehicles.map(async (vehicle) => {
      let imageUrl: string | null = null;
      if (vehicle.mainImageId) {
        imageUrl = await fetchQuery(api.vehicles.getImageUrl, {
          imageId: vehicle.mainImageId,
        });
      }
      return {
        ...vehicle,
        imageUrl,
      };
    })
  );

  return <CarsPageClient initialVehicles={vehiclesWithImageUrls} />;
}