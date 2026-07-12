"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BlogCard } from "@/components/features/blog/blog-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { BlogListItem } from "@/types/blog";
import Link from "next/link";

const POSTS_PER_PAGE = 30;

interface BlogListClientProps {
  featuredBlog: BlogListItem | null;
  initialBlogs: BlogListItem[];
  locale: string;
}

export function BlogListClient({
  featuredBlog: initialFeatured,
  initialBlogs,
  locale,
}: BlogListClientProps) {
  const t = useTranslations("blogPage");
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  // Live queries — SSR data used as initial, then live updates take over
  const liveFeatured = useQuery(api.blogs.getFeatured, {
    locale: locale as "ro" | "en",
  });
  const liveAll = useQuery(api.blogs.getAll, {
    locale: locale as "ro" | "en",
  });

  const featuredBlog = liveFeatured !== undefined ? liveFeatured : initialFeatured;

  // Filter out featured from the list
  const allBlogs = liveAll !== undefined ? liveAll : initialBlogs;
  const blogs = featuredBlog
    ? allBlogs.filter((b) => b._id !== featuredBlog._id)
    : allBlogs;

  const visibleBlogs = blogs.slice(0, visibleCount);
  const hasMore = visibleCount < blogs.length;

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="pt-16 pb-10 px-4 relative">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="accent-line"></div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-sm font-medium text-primary">
              {t("hero.badge")}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 leading-[1.1]">
            {t("hero.title")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl">
        {!featuredBlog && blogs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold mb-2">{t("noBlogsFound")}</h2>
            <p className="text-muted-foreground">{t("noBlogsDescription")}</p>
          </div>
        ) : (
          <div className="space-y-14">
            {/* Featured Post */}
            {featuredBlog && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 rounded-full bg-primary"></div>
                  <h2 className="text-lg font-bold tracking-tight">
                    {t("featuredPost")}
                  </h2>
                </div>
                <BlogCard blog={featuredBlog} locale={locale} featured />
              </section>
            )}

            {/* Rest of Posts */}
            {blogs.length > 0 && (
              <section>
                <div className="section-divider mb-10"></div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 rounded-full bg-primary"></div>
                    <h2 className="text-lg font-bold tracking-tight">
                      {t("latestPosts")}
                    </h2>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {blogs.length} {blogs.length === 1 ? "post" : "posts"}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleBlogs.map((blog) => (
                    <BlogCard key={blog._id} blog={blog} locale={locale} />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-10">
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded-xl px-8"
                      onClick={() =>
                        setVisibleCount((prev) => prev + POSTS_PER_PAGE)
                      }
                    >
                      {t("loadMore")}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {/* CTA Section */}
        <section className="my-20 relative overflow-hidden">
          <div className="relative rounded-3xl bg-gradient-to-br from-foreground/[0.03] via-primary/[0.05] to-foreground/[0.03] border border-border/50 p-10 md:p-16 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {t("cta.title")}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
              {t("cta.description")}
            </p>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground group px-8 h-13 text-base rounded-xl shadow-lg shadow-primary/20"
              asChild
            >
              <Link href={`/${locale}/cars`}>
                {t("cta.button")}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
