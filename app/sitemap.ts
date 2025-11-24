import { MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = await fetchQuery(api.blogs.getAll);

  const blogUrls = blogs.flatMap((blog) => [
    {
      url: `https://rngo.ro/en/blog/${blog.slug}`,
      lastModified: blog.publishedAt
        ? new Date(blog.publishedAt)
        : new Date(blog._creationTime),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      alternates: {
        languages: {
          en: `https://rngo.ro/en/blog/${blog.slug}`,
          ro: `https://rngo.ro/ro/blog/${blog.slug}`,
        },
      },
    },
    {
      url: `https://rngo.ro/ro/blog/${blog.slug}`,
      lastModified: blog.publishedAt
        ? new Date(blog.publishedAt)
        : new Date(blog._creationTime),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      alternates: {
        languages: {
          en: `https://rngo.ro/en/blog/${blog.slug}`,
          ro: `https://rngo.ro/ro/blog/${blog.slug}`,
        },
      },
    },
  ]);

  return [
    {
      url: "https://rngo.ro",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          en: "https://rngo.ro/en",
          ro: "https://rngo.ro/ro",
        },
      },
    },
    {
      url: "https://rngo.ro/en/blog",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: {
          en: "https://rngo.ro/en/blog",
          ro: "https://rngo.ro/ro/blog",
        },
      },
    },
    {
      url: "https://rngo.ro/ro/blog",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: {
          en: "https://rngo.ro/en/blog",
          ro: "https://rngo.ro/ro/blog",
        },
      },
    },
    {
      url: "https://rngo.ro/en/cars",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          en: "https://rngo.ro/en/cars",
          ro: "https://rngo.ro/ro/cars",
        },
      },
    },
    {
      url: "https://rngo.ro/ro/cars",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          en: "https://rngo.ro/en/cars",
          ro: "https://rngo.ro/ro/cars",
        },
      },
    },
    {
      url: "https://rngo.ro/en/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          en: "https://rngo.ro/en/about",
          ro: "https://rngo.ro/ro/about",
        },
      },
    },
    {
      url: "https://rngo.ro/ro/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          en: "https://rngo.ro/en/about",
          ro: "https://rngo.ro/ro/about",
        },
      },
    },
    {
      url: "https://rngo.ro/en/contact",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          en: "https://rngo.ro/en/contact",
          ro: "https://rngo.ro/ro/contact",
        },
      },
    },
    {
      url: "https://rngo.ro/ro/contact",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          en: "https://rngo.ro/en/contact",
          ro: "https://rngo.ro/ro/contact",
        },
      },
    },
    ...blogUrls,
  ];
}
