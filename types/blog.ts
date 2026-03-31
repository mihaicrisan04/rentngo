import { Id } from "@/convex/_generated/dataModel";

export type BlogStatus = "draft" | "published";

// Public-facing types — queries map locale-specific fields to these generic names
export interface Blog {
  _id: Id<"blogs">;
  _creationTime: number;
  title: string;
  slug: string;
  author: string;
  description: string;
  content: string;
  coverImage?: Id<"_storage">;
  images?: Id<"_storage">[];
  tags?: string[];
  publishedAt?: number;
  status: BlogStatus;
  readingTime?: number;
  views?: number;
}

export interface BlogListItem {
  _id: Id<"blogs">;
  _creationTime: number;
  title: string;
  slug: string;
  author: string;
  description: string;
  coverImage?: Id<"_storage">;
  tags?: string[];
  publishedAt?: number;
  status: BlogStatus;
  readingTime?: number;
  views?: number;
}

// Admin types — include both locale variants
export interface BlogAdmin {
  _id: Id<"blogs">;
  _creationTime: number;
  title_ro: string;
  title_en: string;
  slug_ro: string;
  slug_en: string;
  author: string;
  description_ro: string;
  description_en: string;
  content_ro: string;
  content_en: string;
  coverImage?: Id<"_storage">;
  images?: Id<"_storage">[];
  tags?: string[];
  publishedAt?: number;
  status: BlogStatus;
  readingTime_ro?: number;
  readingTime_en?: number;
  views?: number;
}

export interface BlogAdminListItem {
  _id: Id<"blogs">;
  _creationTime: number;
  title_ro: string;
  title_en: string;
  slug_ro: string;
  slug_en: string;
  author: string;
  description_ro: string;
  description_en: string;
  coverImage?: Id<"_storage">;
  tags?: string[];
  publishedAt?: number;
  status: BlogStatus;
  readingTime_ro?: number;
  readingTime_en?: number;
  views?: number;
}

export interface BlogFormData {
  title_ro: string;
  title_en: string;
  slug_ro: string;
  slug_en: string;
  author: string;
  description_ro: string;
  description_en: string;
  content_ro: string;
  content_en: string;
  coverImage?: Id<"_storage">;
  images?: Id<"_storage">[];
  tags?: string[];
  publishedAt?: number;
  status: BlogStatus;
  readingTime_ro?: number;
  readingTime_en?: number;
}

export interface BlogCardProps {
  blog: BlogListItem;
  locale: string;
}

export interface BlogMetadata {
  title: string;
  author: string;
  publishedAt?: number;
  readingTime?: number;
  tags?: string[];
}
