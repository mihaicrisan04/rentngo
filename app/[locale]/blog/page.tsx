import { Metadata } from "next";
import { fetchStaticQuery } from "@/lib/convex-static";
import { api } from "@/convex/_generated/api";
import { BlogListClient } from "@/components/features/blog/blog-list-client";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/metadata";

// Statically prerendered per locale; re-generated in the background so new
// posts show up without a redeploy.
export const revalidate = 3600;

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blogPage" });

  return buildMetadata({
    locale,
    path: "/blog",
    title: { ro: t("title"), en: t("title") },
    description: { ro: t("subtitle"), en: t("subtitle") },
  });
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  const typedLocale = locale as "ro" | "en";

  const [featuredBlog, allBlogs] = await Promise.all([
    fetchStaticQuery(api.blogs.getFeatured, { locale: typedLocale }),
    fetchStaticQuery(api.blogs.getAll, { locale: typedLocale }),
  ]);

  // Filter out the featured blog from the list so it doesn't appear twice
  const blogs = featuredBlog
    ? allBlogs.filter((b) => b._id !== featuredBlog._id)
    : allBlogs;

  return (
    <BlogListClient
      featuredBlog={featuredBlog}
      initialBlogs={blogs}
      locale={locale}
    />
  );
}
