"use client";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { useEffect, useState } from "react";
import { useMDXComponents } from "@/mdx-components";
import { BlogImage } from "./blog-image";

interface BlogContentProps {
  content: string;
}

export function BlogContent({ content }: BlogContentProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(
    null,
  );
  const components = useMDXComponents({ BlogImage });

  useEffect(() => {
    const processContent = async () => {
      try {
        const serialized = await serialize(content, {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeHighlight,
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: "wrap" }],
            ],
          },
        });
        setMdxSource(serialized);
      } catch (error) {
        console.error("Error processing MDX content:", error);
      }
    };

    processContent();
  }, [content]);

  if (!mdxSource) {
    return (
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p>Loading content...</p>
      </div>
    );
  }

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-20">
      <MDXRemote {...mdxSource} components={components} />
    </article>
  );
}
