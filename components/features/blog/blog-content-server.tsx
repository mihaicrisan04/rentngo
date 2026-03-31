import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { useMDXComponents } from "@/mdx-components";
import { BlogImage } from "./blog-image";

interface BlogContentServerProps {
  content: string;
}

export function BlogContentServer({ content }: BlogContentServerProps) {
  const components = useMDXComponents({ BlogImage });

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-20">
      <MDXRemote
        source={content}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeHighlight,
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: "wrap" }],
            ],
          },
        }}
      />
    </article>
  );
}
