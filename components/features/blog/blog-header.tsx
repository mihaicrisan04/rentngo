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
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="rounded-lg px-2.5 py-0.5"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
        {title}
      </h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {t("by")} {author}
        </span>

        <div className="w-1 h-1 rounded-full bg-muted-foreground/40"></div>

        {publishedAt && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatPublishDate(publishedAt, locale)}</span>
          </div>
        )}

        {readingTime && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{t("minutesRead", { minutes: readingTime })}</span>
          </div>
        )}

        {views !== undefined && (
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            <span>{t("views", { count: views })}</span>
          </div>
        )}
      </div>
    </header>
  );
}
