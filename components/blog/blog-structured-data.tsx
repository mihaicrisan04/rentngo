import { Blog } from "@/types/blog";

interface BlogStructuredDataProps {
  blog: Blog;
  locale: string;
  slug: string;
  coverImageUrl?: string | null;
}

export function BlogStructuredData({
  blog,
  locale,
  slug,
  coverImageUrl,
}: BlogStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.description,
    image: coverImageUrl || undefined,
    author: {
      "@type": "Person",
      name: blog.author,
    },
    datePublished: blog.publishedAt
      ? new Date(blog.publishedAt).toISOString()
      : undefined,
    dateModified: new Date(blog._creationTime).toISOString(),
    publisher: {
      "@type": "Organization",
      name: "Rent'n Go Cluj",
      logo: {
        "@type": "ImageObject",
        url: "https://rngo.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://rngo.com/${locale}/blog/${slug}`,
    },
    keywords: blog.tags?.join(", "),
    articleBody: blog.description,
    wordCount: blog.content.split(/\s+/).length,
    timeRequired: `PT${blog.readingTime || 5}M`,
    inLanguage: locale,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface BreadcrumbStructuredDataProps {
  blog: Blog;
  locale: string;
  slug: string;
}

export function BreadcrumbStructuredData({
  blog,
  locale,
  slug,
}: BreadcrumbStructuredDataProps) {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `https://rngo.com/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `https://rngo.com/${locale}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: blog.title,
        item: `https://rngo.com/${locale}/blog/${slug}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
    />
  );
}
