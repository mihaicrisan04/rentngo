import { MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { carsPathWithoutLocale } from "@/lib/localized-routes";

const BASE_URL = "https://rngo.ro";

interface LocalizedPaths {
  ro: string;
  en: string;
}

function samePath(path: string): LocalizedPaths {
  return { ro: path, en: path };
}

function carsPaths(slug?: string): LocalizedPaths {
  return {
    ro: carsPathWithoutLocale("ro", slug),
    en: carsPathWithoutLocale("en", slug),
  };
}

/**
 * One URL per locale, each listing both as alternates with the same hreflang
 * codes the pages declare in their <head>. `lastModified` is only set where a
 * real date exists; a fresh timestamp on every fetch teaches Google to ignore it.
 */
function bilingualEntry(
  paths: LocalizedPaths,
  options: {
    lastModified?: Date;
    changeFrequency: NonNullable<
      MetadataRoute.Sitemap[number]["changeFrequency"]
    >;
    priority: number;
  },
): MetadataRoute.Sitemap {
  const roUrl = `${BASE_URL}/ro${paths.ro}`;
  const enUrl = `${BASE_URL}/en${paths.en}`;
  const alternates = {
    languages: { "ro-RO": roUrl, "en-US": enUrl, "x-default": roUrl },
  };
  return [roUrl, enUrl].map((url) => ({ url, alternates, ...options }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogSlugs, vehicles] = await Promise.all([
    fetchQuery(api.blogs.getAlternateSlugs),
    fetchQuery(api.vehicles.getAllVehicles),
  ]);

  const blogUrls = blogSlugs.flatMap((blog) =>
    bilingualEntry(
      { ro: `/blog/${blog.slugRo}`, en: `/blog/${blog.slugEn}` },
      {
        lastModified: new Date(blog.publishedAt ?? blog._creationTime),
        changeFrequency: "monthly",
        priority: 0.8,
      },
    ),
  );

  // A vehicle without a slug has no public URL
  const vehicleUrls = vehicles.flatMap((vehicle) =>
    vehicle.slug
      ? bilingualEntry(carsPaths(vehicle.slug), {
          lastModified: new Date(vehicle._creationTime),
          changeFrequency: "weekly",
          priority: 0.8,
        })
      : [],
  );

  return [
    ...bilingualEntry(samePath(""), { changeFrequency: "daily", priority: 1 }),
    ...bilingualEntry(carsPaths(), { changeFrequency: "daily", priority: 0.9 }),
    ...bilingualEntry(samePath("/transfers"), {
      changeFrequency: "weekly",
      priority: 0.9,
    }),
    ...bilingualEntry(samePath("/blog"), {
      changeFrequency: "daily",
      priority: 0.9,
    }),
    ...bilingualEntry(samePath("/about"), {
      changeFrequency: "monthly",
      priority: 0.7,
    }),
    ...bilingualEntry(samePath("/contact"), {
      changeFrequency: "monthly",
      priority: 0.7,
    }),
    ...bilingualEntry(samePath("/faq"), {
      changeFrequency: "monthly",
      priority: 0.7,
    }),
    ...bilingualEntry(samePath("/terms"), {
      changeFrequency: "yearly",
      priority: 0.5,
    }),
    ...bilingualEntry(samePath("/privacy"), {
      changeFrequency: "yearly",
      priority: 0.5,
    }),
    ...vehicleUrls,
    ...blogUrls,
  ];
}
