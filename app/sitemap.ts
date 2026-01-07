import { MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

const BASE_URL = "https://rngo.ro";

// Helper to create bilingual sitemap entries
function createBilingualEntry(
  path: string,
  options: {
    lastModified?: Date;
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    priority: number;
  }
): MetadataRoute.Sitemap {
  const { lastModified = new Date(), changeFrequency, priority } = options;

  return [
    {
      url: `${BASE_URL}/en${path}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: {
          en: `${BASE_URL}/en${path}`,
          ro: `${BASE_URL}/ro${path}`,
        },
      },
    },
    {
      url: `${BASE_URL}/ro${path}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: {
          en: `${BASE_URL}/en${path}`,
          ro: `${BASE_URL}/ro${path}`,
        },
      },
    },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch dynamic content
  const [blogs, vehicles] = await Promise.all([
    fetchQuery(api.blogs.getAll),
    fetchQuery(api.vehicles.getAllVehicles),
  ]);

  // Generate blog URLs
  const blogUrls = blogs.flatMap((blog) =>
    createBilingualEntry(`/blog/${blog.slug}`, {
      lastModified: blog.publishedAt
        ? new Date(blog.publishedAt)
        : new Date(blog._creationTime),
      changeFrequency: "monthly",
      priority: 0.8,
    })
  );

  // Generate vehicle/car detail URLs
  const vehicleUrls = vehicles.flatMap((vehicle) =>
    createBilingualEntry(`/cars/${vehicle._id}`, {
      lastModified: new Date(vehicle._creationTime),
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  return [
    // Homepage (root redirect)
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          en: `${BASE_URL}/en`,
          ro: `${BASE_URL}/ro`,
        },
      },
    },

    // Main pages - High priority
    ...createBilingualEntry("", {
      changeFrequency: "daily",
      priority: 1.0,
    }),

    // Cars listing page
    ...createBilingualEntry("/cars", {
      changeFrequency: "daily",
      priority: 0.9,
    }),

    // Transfers page
    ...createBilingualEntry("/transfers", {
      changeFrequency: "weekly",
      priority: 0.9,
    }),

    // Blog listing page
    ...createBilingualEntry("/blog", {
      changeFrequency: "daily",
      priority: 0.9,
    }),

    // About page
    ...createBilingualEntry("/about", {
      changeFrequency: "monthly",
      priority: 0.7,
    }),

    // Contact page
    ...createBilingualEntry("/contact", {
      changeFrequency: "monthly",
      priority: 0.7,
    }),

    // Terms and Conditions
    ...createBilingualEntry("/terms", {
      changeFrequency: "yearly",
      priority: 0.5,
    }),

    // Privacy Policy
    ...createBilingualEntry("/privacy", {
      changeFrequency: "yearly",
      priority: 0.5,
    }),

    // Dynamic content
    ...vehicleUrls,
    ...blogUrls,
  ];
}
