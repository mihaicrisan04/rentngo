import { Id } from "@/convex/_generated/dataModel";

export type BlogStatus = "draft" | "published";

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

export interface BlogFormData {
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
