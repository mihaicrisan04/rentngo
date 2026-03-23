import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { BlogDetailClient } from "@/components/features/blog/blog-detail-client";
import { BlogContentServer } from "@/components/features/blog/blog-content-server";
import {
  BlogStructuredData,
  BreadcrumbStructuredData,
} from "@/components/features/blog/blog-structured-data";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/metadata";

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
      title: "Blog Post Not Found",
    };
  }

  const coverImageUrl = blog.coverImage
    ? await fetchQuery(api.blogs.getImageUrl, { imageId: blog.coverImage })
    : null;

  return buildMetadata({
    locale,
    path: `/blog/${slug}`,
    title: { ro: blog.title, en: blog.title },
    description: { ro: blog.description, en: blog.description },
    type: "article",
    ...(blog.tags && {
      keywords: { ro: blog.tags.join(", "), en: blog.tags.join(", ") },
    }),
    ...(coverImageUrl && {
      image: { url: coverImageUrl, width: 1200, height: 630, alt: blog.title },
    }),
    article: {
      publishedTime: blog.publishedAt
        ? new Date(blog.publishedAt).toISOString()
        : undefined,
      authors: [blog.author],
      tags: blog.tags,
    },
  });
}

export async function generateStaticParams() {
  const blogs = await fetchQuery(api.blogs.getAll);
  return blogs.map((blog) => ({ slug: blog.slug }));
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
      >
        <BlogContentServer content={blog.content} />
      </BlogDetailClient>
    </>
  );
}
