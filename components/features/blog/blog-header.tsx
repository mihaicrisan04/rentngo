"use client";

import { Clock, Calendar, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPublishDate } from "@/lib/blog-utils";
import { useTranslations } from "next-intl";

interface BlogHeaderProps {
  title: string;
  author: string;
  publishedAt?: number;
  readingTime?: number;
  tags?: string[];
  views?: number;
  locale: string;
}

export function BlogHeader({
  title,
  author,
  publishedAt,
  readingTime,
  tags,
  views,
  locale,
}: BlogHeaderProps) {
  const t = useTranslations("blogPage");

  return (
    <header className="space-y-6">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="font-medium">
          {t("by")} {author}
        </span>

        {publishedAt && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{formatPublishDate(publishedAt, locale)}</span>
          </div>
        )}

        {readingTime && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{t("minutesRead", { minutes: readingTime })}</span>
          </div>
        )}

        {views !== undefined && (
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            <span>{t("views", { count: views })}</span>
          </div>
        )}
      </div>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </header>
  );
}
