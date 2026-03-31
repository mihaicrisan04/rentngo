"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye } from "lucide-react";
import { formatPublishDate } from "@/lib/blog-utils";
import { BlogListItem } from "@/types/blog";
import { useTranslations } from "next-intl";

interface BlogCardProps {
  blog: BlogListItem;
  locale: string;
  featured?: boolean;
}

export const BlogCard = React.memo(function BlogCard({
  blog,
  locale,
  featured = false,
}: BlogCardProps) {
  const t = useTranslations("blogPage");

  const coverImageUrl = useQuery(
    api.blogs.getImageUrl,
    blog.coverImage ? { imageId: blog.coverImage } : "skip",
  );

  if (featured) {
    return (
      <Link
        href={`/${locale}/blog/${blog.slug}`}
        className="group block"
        data-cv-auto=""
      >
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10 items-center rounded-3xl border border-border/50 bg-card p-3 md:p-4 hover:shadow-xl transition-all duration-300 hover:border-primary/20">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
            {coverImageUrl ? (
              <Image
                src={coverImageUrl}
                alt={blog.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center rounded-2xl">
                <span className="text-5xl text-muted-foreground/20">📝</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 py-2 md:py-4">
            <div className="flex flex-wrap gap-2">
              {blog.tags?.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs px-2.5 py-0.5 rounded-lg"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <h2 className="text-2xl md:text-3xl font-bold tracking-tight group-hover:text-primary transition-colors line-clamp-3">
              {blog.title}
            </h2>

            <p className="text-muted-foreground leading-relaxed line-clamp-3">
              {blog.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
              <span className="font-medium">{blog.author}</span>
              {blog.publishedAt && (
                <span>{formatPublishDate(blog.publishedAt, locale)}</span>
              )}
              {blog.readingTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{blog.readingTime}m</span>
                </div>
              )}
              {blog.views !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{blog.views}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/${locale}/blog/${blog.slug}`} data-cv-auto="">
      <div className="group h-full flex flex-col rounded-2xl border border-border/50 bg-card overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/20">
        <div className="relative aspect-[16/9] overflow-hidden">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={blog.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
              <span className="text-4xl text-muted-foreground/20">📝</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2.5 flex-1 p-4">
          <div className="flex flex-wrap gap-1.5">
            {blog.tags?.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] px-2 py-0.5 rounded-md"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <h3 className="text-base font-bold line-clamp-2 group-hover:text-primary transition-colors tracking-tight">
            {blog.title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {blog.description}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 px-4 py-3 mt-auto">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-medium truncate">{blog.author}</span>
            {blog.readingTime && (
              <div className="flex items-center gap-0.5 shrink-0">
                <Clock className="h-3 w-3" />
                <span>{blog.readingTime}m</span>
              </div>
            )}
          </div>
          {blog.views !== undefined && (
            <div className="flex items-center gap-0.5 shrink-0">
              <Eye className="h-3 w-3" />
              <span>{blog.views}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
});
