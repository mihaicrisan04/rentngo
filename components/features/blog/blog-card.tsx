"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye } from "lucide-react";
import { formatPublishDate } from "@/lib/blogUtils";
import { BlogListItem } from "@/types/blog";
import { useTranslations } from "next-intl";

interface BlogCardProps {
  blog: BlogListItem;
  locale: string;
}

export function BlogCard({ blog, locale }: BlogCardProps) {
  const t = useTranslations("blogPage");

  const coverImageUrl = useQuery(
    api.blogs.getImageUrl,
    blog.coverImage ? { imageId: blog.coverImage } : "skip",
  );

  return (
    <Link href={`/${locale}/blog/${blog.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 h-full flex flex-col gap-0 p-3">
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg mb-3">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={blog.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-4xl text-muted-foreground/30">📝</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-wrap gap-1.5">
            {blog.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>
          <h3 className="text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {blog.title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {blog.description}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2 mt-2">
          <div className="flex items-center gap-2 min-w-0">
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
      </Card>
    </Link>
  );
}
