"use client";

import React, { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BlogHeader } from "@/components/features/blog";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Blog } from "@/types/blog";

interface BlogDetailClientProps {
  blog: Blog;
  coverImageUrl: string | null;
  locale: string;
  slug: string;
  children: React.ReactNode;
}

export function BlogDetailClient({
  blog,
  coverImageUrl,
  locale,
  slug,
  children,
}: BlogDetailClientProps) {
  const t = useTranslations("blogDetail");
  const viewTracked = useRef(false);
  const incrementViews = useMutation(api.blogs.incrementViews);

  useEffect(() => {
    if (!viewTracked.current) {
      incrementViews({ slug });
      viewTracked.current = true;
    }
  }, [slug, incrementViews]);

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link href={`/${locale}/blog`}>
        <Button variant="ghost" className="mb-8 rounded-xl">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("backToBlogs")}
        </Button>
      </Link>

      <BlogHeader
        title={blog.title}
        author={blog.author}
        publishedAt={blog.publishedAt}
        readingTime={blog.readingTime}
        tags={blog.tags}
        views={blog.views}
        locale={locale}
      />

      {coverImageUrl && (
        <div className="relative aspect-video w-full my-10 rounded-2xl overflow-hidden shadow-xl">
          <Image
            src={coverImageUrl}
            alt={blog.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent"></div>
        </div>
      )}

      <div className="mt-12">{children}</div>
    </div>
  );
}
