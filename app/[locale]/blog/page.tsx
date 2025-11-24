import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { BlogListClient } from "@/components/blog/blog-list-client";
import { getTranslations } from "next-intl/server";

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blogPage" });

  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: `https://rngo.ro/${locale}/blog`,
      languages: {
        en: "/en/blog",
        ro: "/ro/blog",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      type: "website",
      url: `https://rngo.ro/${locale}/blog`,
      siteName: "Rent'n Go Cluj",
      locale: locale,
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("subtitle"),
    },
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;

  // Preload data on server for SSR
  const preloadedBlogs = await fetchQuery(api.blogs.getAll);

  return <BlogListClient initialBlogs={preloadedBlogs} locale={locale} />;
}
