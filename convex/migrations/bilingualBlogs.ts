import { internalMutation } from "../_generated/server";

/**
 * Migration to convert single-language blog fields to bilingual (RO + EN).
 * Copies existing title/description/content/readingTime to both _ro and _en variants.
 *
 * Usage: npx convex run migrations/bilingualBlogs
 */
export default internalMutation({
  args: {},
  handler: async (ctx) => {
    const blogs = await ctx.db.query("blogs").collect();
    let updated = 0;

    for (const blog of blogs) {
      const raw = blog as any;
      // Skip if already migrated
      if (raw.title_ro !== undefined) continue;

      await ctx.db.patch(blog._id, {
        title_ro: raw.title ?? "",
        title_en: raw.title ?? "",
        description_ro: raw.description ?? "",
        description_en: raw.description ?? "",
        content_ro: raw.content ?? "",
        content_en: raw.content ?? "",
        readingTime_ro: raw.readingTime,
        readingTime_en: raw.readingTime,
        // Clear old fields
        title: undefined,
        description: undefined,
        content: undefined,
        readingTime: undefined,
      } as any);
      updated++;
    }

    return { updated, total: blogs.length };
  },
});
