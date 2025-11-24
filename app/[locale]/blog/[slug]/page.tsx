import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { BlogDetailClient } from "@/components/blog/blog-detail-client";
import {
  BlogStructuredData,
  BreadcrumbStructuredData,
} from "@/components/blog/blog-structured-data";
import { notFound } from "next/navigation";
// import { getTranslations } from "next-intl/server";

interface BlogDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const blog = await fetchQuery(api.blogs.getBySlug, { slug });

  if (!blog) {
    return {
      title: "Blog Post Not Found | Rent'n Go Cluj",
    };
  }

  const coverImageUrl = blog.coverImage
    ? await fetchQuery(api.blogs.getImageUrl, { imageId: blog.coverImage })
    : null;

  return {
    title: `${blog.title} | Rent'n Go Blog`,
    description: blog.description,
    authors: [{ name: blog.author }],
    keywords: blog.tags?.join(", "),
    alternates: {
      canonical: `https://rngo.ro/${locale}/blog/${slug}`,
      languages: {
        en: `/en/blog/${slug}`,
        ro: `/ro/blog/${slug}`,
      },
    },
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: "article",
      url: `https://rngo.ro/${locale}/blog/${slug}`,
      publishedTime: blog.publishedAt
        ? new Date(blog.publishedAt).toISOString()
        : undefined,
      authors: [blog.author],
      tags: blog.tags,
      images: coverImageUrl
        ? [
            {
              url: coverImageUrl,
              alt: blog.title,
              width: 1200,
              height: 630,
            },
          ]
        : [],
      siteName: "Rent'n Go Cluj",
      locale: locale,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.description,
      images: coverImageUrl ? [coverImageUrl] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { locale, slug } = await params;
  const blog = await fetchQuery(api.blogs.getBySlug, { slug });

  if (!blog) {
    notFound();
  }

  const coverImageUrl = blog.coverImage
    ? await fetchQuery(api.blogs.getImageUrl, { imageId: blog.coverImage })
    : null;

  return (
    <>
      <BlogStructuredData
        blog={blog}
        locale={locale}
        slug={slug}
        coverImageUrl={coverImageUrl}
      />
      <BreadcrumbStructuredData blog={blog} locale={locale} slug={slug} />
      <BlogDetailClient
        blog={blog}
        coverImageUrl={coverImageUrl}
        locale={locale}
        slug={slug}
      />
    </>
  );
}
