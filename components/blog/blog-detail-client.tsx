"use client";

import React, { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BlogContent, BlogHeader } from "@/components/blog";
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
}

export function BlogDetailClient({
  blog,
  coverImageUrl,
  locale,
  slug,
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
    <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href={`/${locale}/blog`}>
          <Button variant="ghost" className="mb-8">
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
          <div className="relative aspect-video w-full my-8 rounded-lg overflow-hidden">
            <Image
              src={coverImageUrl}
              alt={blog.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>
        )}

        <div className="mt-12">
          <BlogContent content={blog.content} />
        </div>
      </div>
  );
}
