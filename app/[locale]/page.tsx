import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { HomePageClient } from "./HomePageClient";

export default async function HomePage() {
  const featuredVehicles = await fetchQuery(api.featuredCars.getFeaturedVehicles);

  let vehicles = featuredVehicles;
  let title = "Featured Cars";

  if (!vehicles || vehicles.length === 0) {
    const fallback = await fetchQuery(api.vehicles.getAll, {
      paginationOpts: { numItems: 3, cursor: null },
    });
    vehicles = fallback?.page || [];
    title = vehicles.length > 0 ? "Our Latest Cars" : "No Cars Available";
  }

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

  return (
    <HomePageClient
      initialVehicles={vehiclesWithImageUrls}
      initialTitle={title}
    />
  );
}
