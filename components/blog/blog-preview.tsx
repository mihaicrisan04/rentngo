"use client";

import { BlogContent } from "./blog-content";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, User } from "lucide-react";

interface BlogPreviewProps {
  title: string;
  author: string;
  content: string;
  readingTime?: number;
  tags?: string[];
}

export function BlogPreview({
  title,
  author,
  content,
  readingTime,
  tags,
}: BlogPreviewProps) {
  return (
    <div className="space-y-6">
      <Card className="p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-4">
              {title || "Untitled Blog Post"}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span className="font-medium">
                  {author || "Unknown Author"}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>

              {readingTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} min read</span>
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
          </div>

          <div className="border-t pt-6">
            {content ? (
              <BlogContent content={content} />
            ) : (
              <p className="text-muted-foreground italic text-center py-8">
                No content to preview. Start writing in the Content tab.
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="text-sm text-muted-foreground text-center">
        Preview shows how your blog will appear to readers
      </div>
    </div>
  );
}
