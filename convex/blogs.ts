import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./users";

const localeValidator = v.union(v.literal("ro"), v.literal("en"));

// Helper to resolve the slug for a given locale, with legacy fallback
function resolveSlug(
  blog: { slug_ro?: string; slug_en?: string; slug?: string },
  locale: "ro" | "en",
): string {
  if (locale === "ro") return blog.slug_ro ?? blog.slug ?? "";
  return blog.slug_en ?? blog.slug ?? "";
}

export const getAll = query({
  args: { locale: localeValidator },
  returns: v.array(
    v.object({
      _id: v.id("blogs"),
      _creationTime: v.number(),
      title: v.string(),
      slug: v.string(),
      author: v.string(),
      description: v.string(),
      coverImage: v.optional(v.id("_storage")),
      tags: v.optional(v.array(v.string())),
      publishedAt: v.optional(v.number()),
      status: v.union(v.literal("draft"), v.literal("published")),
      readingTime: v.optional(v.number()),
      views: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, args) => {
    const { locale } = args;
    const blogs = await ctx.db
      .query("blogs")
      .filter((q) => q.eq(q.field("status"), "published"))
      .order("desc")
      .collect();

    return blogs.map((blog) => ({
      _id: blog._id,
      _creationTime: blog._creationTime,
      title: (locale === "ro" ? blog.title_ro : blog.title_en) ?? blog.title ?? "",
      slug: resolveSlug(blog, locale),
      author: blog.author,
      description: (locale === "ro" ? blog.description_ro : blog.description_en) ?? blog.description ?? "",
      coverImage: blog.coverImage,
      tags: blog.tags,
      publishedAt: blog.publishedAt,
      status: blog.status,
      readingTime: (locale === "ro" ? blog.readingTime_ro : blog.readingTime_en) ?? blog.readingTime,
      views: blog.views,
    }));
  },
});

// Get the featured blog post (manually selected by admin)
export const getFeatured = query({
  args: { locale: localeValidator },
  returns: v.union(
    v.object({
      _id: v.id("blogs"),
      _creationTime: v.number(),
      title: v.string(),
      slug: v.string(),
      author: v.string(),
      description: v.string(),
      coverImage: v.optional(v.id("_storage")),
      tags: v.optional(v.array(v.string())),
      publishedAt: v.optional(v.number()),
      status: v.union(v.literal("draft"), v.literal("published")),
      readingTime: v.optional(v.number()),
      views: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const { locale } = args;
    const blog = await ctx.db
      .query("blogs")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "published"),
          q.eq(q.field("isFeatured"), true),
        ),
      )
      .first();

    if (!blog) return null;

    return {
      _id: blog._id,
      _creationTime: blog._creationTime,
      title: (locale === "ro" ? blog.title_ro : blog.title_en) ?? blog.title ?? "",
      slug: resolveSlug(blog, locale),
      author: blog.author,
      description: (locale === "ro" ? blog.description_ro : blog.description_en) ?? blog.description ?? "",
      coverImage: blog.coverImage,
      tags: blog.tags,
      publishedAt: blog.publishedAt,
      status: blog.status,
      readingTime: (locale === "ro" ? blog.readingTime_ro : blog.readingTime_en) ?? blog.readingTime,
      views: blog.views,
    };
  },
});

// Get published blogs with server-side pagination (excludes featured)
export const getPublished = query({
  args: { locale: localeValidator, paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const { locale } = args;
    const result = await ctx.db
      .query("blogs")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "published"),
          q.neq(q.field("isFeatured"), true),
        ),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: result.page.map((blog) => ({
        _id: blog._id,
        _creationTime: blog._creationTime,
        title: (locale === "ro" ? blog.title_ro : blog.title_en) ?? blog.title ?? "",
        slug: resolveSlug(blog, locale),
        author: blog.author,
        description: (locale === "ro" ? blog.description_ro : blog.description_en) ?? blog.description ?? "",
        coverImage: blog.coverImage,
        tags: blog.tags,
        publishedAt: blog.publishedAt,
        status: blog.status as "draft" | "published",
        readingTime: (locale === "ro" ? blog.readingTime_ro : blog.readingTime_en) ?? blog.readingTime,
        views: blog.views,
      })),
    };
  },
});

// Set a blog as featured (unsets any previous featured blog)
export const setFeatured = mutation({
  args: { id: v.id("blogs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Unset any currently featured blog
    const currentFeatured = await ctx.db
      .query("blogs")
      .filter((q) => q.eq(q.field("isFeatured"), true))
      .collect();

    for (const blog of currentFeatured) {
      if (blog._id !== args.id) {
        await ctx.db.patch(blog._id, { isFeatured: false });
      }
    }

    // Set the new featured blog
    await ctx.db.patch(args.id, { isFeatured: true });
  },
});

// Unset featured status
export const unsetFeatured = mutation({
  args: { id: v.id("blogs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.db.patch(args.id, { isFeatured: false });
  },
});

export const getAllAdmin = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("blogs"),
      _creationTime: v.number(),
      title_ro: v.string(),
      title_en: v.string(),
      slug_ro: v.string(),
      slug_en: v.string(),
      author: v.string(),
      description_ro: v.string(),
      description_en: v.string(),
      coverImage: v.optional(v.id("_storage")),
      tags: v.optional(v.array(v.string())),
      publishedAt: v.optional(v.number()),
      status: v.union(v.literal("draft"), v.literal("published")),
      readingTime_ro: v.optional(v.number()),
      readingTime_en: v.optional(v.number()),
      views: v.optional(v.number()),
      isFeatured: v.optional(v.boolean()),
    }),
  ),
  handler: async (ctx) => {
    const blogs = await ctx.db.query("blogs").order("desc").collect();

    return blogs.map((blog) => ({
      _id: blog._id,
      _creationTime: blog._creationTime,
      title_ro: blog.title_ro ?? blog.title ?? "",
      title_en: blog.title_en ?? blog.title ?? "",
      slug_ro: blog.slug_ro ?? blog.slug ?? "",
      slug_en: blog.slug_en ?? blog.slug ?? "",
      author: blog.author,
      description_ro: blog.description_ro ?? blog.description ?? "",
      description_en: blog.description_en ?? blog.description ?? "",
      coverImage: blog.coverImage,
      tags: blog.tags,
      publishedAt: blog.publishedAt,
      status: blog.status,
      readingTime_ro: blog.readingTime_ro ?? blog.readingTime,
      readingTime_en: blog.readingTime_en ?? blog.readingTime,
      views: blog.views,
      isFeatured: blog.isFeatured,
    }));
  },
});

export const getBySlug = query({
  args: { slug: v.string(), locale: localeValidator },
  returns: v.union(
    v.object({
      _id: v.id("blogs"),
      _creationTime: v.number(),
      title: v.string(),
      slug: v.string(),
      alternateSlug: v.string(),
      author: v.string(),
      description: v.string(),
      content: v.string(),
      coverImage: v.optional(v.id("_storage")),
      images: v.optional(v.array(v.id("_storage"))),
      tags: v.optional(v.array(v.string())),
      publishedAt: v.optional(v.number()),
      status: v.union(v.literal("draft"), v.literal("published")),
      readingTime: v.optional(v.number()),
      views: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const { slug, locale } = args;

    // Try locale-specific slug index first
    const indexName = locale === "ro" ? "by_slug_ro" : "by_slug_en";
    const slugField = locale === "ro" ? "slug_ro" : "slug_en";
    let blog = await ctx.db
      .query("blogs")
      .withIndex(indexName as any, (q: any) => q.eq(slugField, slug))
      .first();

    // Fallback to legacy shared slug
    if (!blog) {
      blog = await ctx.db
        .query("blogs")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
    }

    if (!blog) return null;

    const otherLocale = locale === "ro" ? "en" : "ro";

    return {
      _id: blog._id,
      _creationTime: blog._creationTime,
      title: (locale === "ro" ? blog.title_ro : blog.title_en) ?? blog.title ?? "",
      slug: resolveSlug(blog, locale),
      alternateSlug: resolveSlug(blog, otherLocale),
      author: blog.author,
      description: (locale === "ro" ? blog.description_ro : blog.description_en) ?? blog.description ?? "",
      content: (locale === "ro" ? blog.content_ro : blog.content_en) ?? blog.content ?? "",
      coverImage: blog.coverImage,
      images: blog.images,
      tags: blog.tags,
      publishedAt: blog.publishedAt,
      status: blog.status,
      readingTime: (locale === "ro" ? blog.readingTime_ro : blog.readingTime_en) ?? blog.readingTime,
      views: blog.views,
    };
  },
});

export const getById = query({
  args: { id: v.id("blogs") },
  returns: v.union(
    v.object({
      _id: v.id("blogs"),
      _creationTime: v.number(),
      title_ro: v.optional(v.string()),
      title_en: v.optional(v.string()),
      slug_ro: v.optional(v.string()),
      slug_en: v.optional(v.string()),
      author: v.string(),
      description_ro: v.optional(v.string()),
      description_en: v.optional(v.string()),
      content_ro: v.optional(v.string()),
      content_en: v.optional(v.string()),
      coverImage: v.optional(v.id("_storage")),
      images: v.optional(v.array(v.id("_storage"))),
      tags: v.optional(v.array(v.string())),
      publishedAt: v.optional(v.number()),
      status: v.union(v.literal("draft"), v.literal("published")),
      readingTime_ro: v.optional(v.number()),
      readingTime_en: v.optional(v.number()),
      views: v.optional(v.number()),
      isFeatured: v.optional(v.boolean()),
      // Legacy fields (present before migration)
      title: v.optional(v.string()),
      slug: v.optional(v.string()),
      description: v.optional(v.string()),
      content: v.optional(v.string()),
      readingTime: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title_ro: v.string(),
    title_en: v.string(),
    slug_ro: v.string(),
    slug_en: v.string(),
    author: v.string(),
    description_ro: v.string(),
    description_en: v.string(),
    content_ro: v.string(),
    content_en: v.string(),
    coverImage: v.optional(v.id("_storage")),
    images: v.optional(v.array(v.id("_storage"))),
    tags: v.optional(v.array(v.string())),
    publishedAt: v.optional(v.number()),
    status: v.union(v.literal("draft"), v.literal("published")),
    readingTime_ro: v.optional(v.number()),
    readingTime_en: v.optional(v.number()),
  },
  returns: v.id("blogs"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Check both slugs for uniqueness
    const existingRo = await ctx.db
      .query("blogs")
      .withIndex("by_slug_ro", (q) => q.eq("slug_ro", args.slug_ro))
      .first();
    if (existingRo) {
      throw new Error("A blog with this Romanian slug already exists");
    }

    const existingEn = await ctx.db
      .query("blogs")
      .withIndex("by_slug_en", (q) => q.eq("slug_en", args.slug_en))
      .first();
    if (existingEn) {
      throw new Error("A blog with this English slug already exists");
    }

    const blogId = await ctx.db.insert("blogs", {
      title_ro: args.title_ro,
      title_en: args.title_en,
      slug_ro: args.slug_ro,
      slug_en: args.slug_en,
      author: args.author,
      description_ro: args.description_ro,
      description_en: args.description_en,
      content_ro: args.content_ro,
      content_en: args.content_en,
      coverImage: args.coverImage,
      images: args.images || [],
      tags: args.tags || [],
      publishedAt: args.publishedAt,
      status: args.status,
      readingTime_ro: args.readingTime_ro,
      readingTime_en: args.readingTime_en,
      views: 0,
    });

    return blogId;
  },
});

export const update = mutation({
  args: {
    id: v.id("blogs"),
    title_ro: v.optional(v.string()),
    title_en: v.optional(v.string()),
    slug_ro: v.optional(v.string()),
    slug_en: v.optional(v.string()),
    author: v.optional(v.string()),
    description_ro: v.optional(v.string()),
    description_en: v.optional(v.string()),
    content_ro: v.optional(v.string()),
    content_en: v.optional(v.string()),
    coverImage: v.optional(v.id("_storage")),
    images: v.optional(v.array(v.id("_storage"))),
    tags: v.optional(v.array(v.string())),
    publishedAt: v.optional(v.number()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
    readingTime_ro: v.optional(v.number()),
    readingTime_en: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { id, ...updates } = args;

    if (updates.slug_ro) {
      const existing = await ctx.db
        .query("blogs")
        .withIndex("by_slug_ro", (q) => q.eq("slug_ro", updates.slug_ro!))
        .first();
      if (existing && existing._id !== id) {
        throw new Error("A blog with this Romanian slug already exists");
      }
    }

    if (updates.slug_en) {
      const existing = await ctx.db
        .query("blogs")
        .withIndex("by_slug_en", (q) => q.eq("slug_en", updates.slug_en!))
        .first();
      if (existing && existing._id !== id) {
        throw new Error("A blog with this English slug already exists");
      }
    }

    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("blogs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const blog = await ctx.db.get(args.id);

    if (!blog) {
      throw new Error("Blog not found");
    }

    if (blog.coverImage) {
      await ctx.storage.delete(blog.coverImage);
    }

    if (blog.images && blog.images.length > 0) {
      for (const imageId of blog.images) {
        await ctx.storage.delete(imageId);
      }
    }

    await ctx.db.delete(args.id);
  },
});

export const removeImage = mutation({
  args: {
    blogId: v.id("blogs"),
    imageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { blogId, imageId } = args;

    const blog = await ctx.db.get(blogId);

    if (!blog) {
      throw new Error("Blog not found");
    }

    const currentImages = blog.images || [];

    const updatedImages = currentImages.filter((id) => id !== imageId);

    const updates: Record<string, unknown> = {
      images: updatedImages,
    };

    if (blog.coverImage === imageId) {
      updates.coverImage = undefined;
    }

    await ctx.db.patch(blogId, updates);

    await ctx.storage.delete(imageId);
  },
});

export const getImageUrl = query({
  args: { imageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.imageId);
  },
});

// Get the alternate locale slug for a blog (used by language switcher)
export const getAlternateSlug = query({
  args: { slug: v.string(), locale: localeValidator },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const { slug, locale } = args;

    const indexName = locale === "ro" ? "by_slug_ro" : "by_slug_en";
    const slugField = locale === "ro" ? "slug_ro" : "slug_en";
    let blog = await ctx.db
      .query("blogs")
      .withIndex(indexName as any, (q: any) => q.eq(slugField, slug))
      .first();

    if (!blog) {
      blog = await ctx.db
        .query("blogs")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
    }

    if (!blog) return null;

    const otherLocale = locale === "ro" ? "en" : "ro";
    return resolveSlug(blog, otherLocale);
  },
});

// Get paired slugs for all published blogs (used by sitemap)
export const getAlternateSlugs = query({
  args: {},
  returns: v.array(
    v.object({
      slugRo: v.string(),
      slugEn: v.string(),
      publishedAt: v.optional(v.number()),
      _creationTime: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const blogs = await ctx.db
      .query("blogs")
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();

    return blogs.map((blog) => ({
      slugRo: resolveSlug(blog, "ro"),
      slugEn: resolveSlug(blog, "en"),
      publishedAt: blog.publishedAt,
      _creationTime: blog._creationTime,
    }));
  },
});

export const incrementViews = mutation({
  args: { slug: v.string(), locale: v.optional(localeValidator) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { slug, locale } = args;
    let blog = null;

    // Try locale-specific slug if locale is provided
    if (locale === "ro") {
      blog = await ctx.db
        .query("blogs")
        .withIndex("by_slug_ro", (q) => q.eq("slug_ro", slug))
        .first();
    } else if (locale === "en") {
      blog = await ctx.db
        .query("blogs")
        .withIndex("by_slug_en", (q) => q.eq("slug_en", slug))
        .first();
    }

    // Fallback to legacy slug
    if (!blog) {
      blog = await ctx.db
        .query("blogs")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
    }

    if (!blog) {
      throw new Error("Blog not found");
    }

    const currentViews = blog.views || 0;
    await ctx.db.patch(blog._id, { views: currentViews + 1 });
  },
});
