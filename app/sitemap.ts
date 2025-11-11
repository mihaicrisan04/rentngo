import { MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = await fetchQuery(api.blogs.getAll);

  const blogUrls = blogs.flatMap((blog) => [
    {
      url: `https://rngo.com/en/blog/${blog.slug}`,
      lastModified: blog.publishedAt
        ? new Date(blog.publishedAt)
        : new Date(blog._creationTime),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      alternates: {
        languages: {
          en: `https://rngo.com/en/blog/${blog.slug}`,
          ro: `https://rngo.com/ro/blog/${blog.slug}`,
        },
      },
    },
  ]);

  return [
    {
      url: "https://rngo.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          en: "https://rngo.com/en",
          ro: "https://rngo.com/ro",
        },
      },
    },
    {
      url: "https://rngo.com/en/blog",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: {
          en: "https://rngo.com/en/blog",
          ro: "https://rngo.com/ro/blog",
        },
      },
    },
    {
      url: "https://rngo.com/en/cars",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          en: "https://rngo.com/en/cars",
          ro: "https://rngo.com/ro/cars",
        },
      },
    },
    {
      url: "https://rngo.com/en/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          en: "https://rngo.com/en/about",
          ro: "https://rngo.com/ro/about",
        },
      },
    },
    {
      url: "https://rngo.com/en/contact",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          en: "https://rngo.com/en/contact",
          ro: "https://rngo.com/ro/contact",
        },
      },
    },
    ...blogUrls,
  ];
}
