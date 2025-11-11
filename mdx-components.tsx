import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold mb-6 mt-8 scroll-mt-20">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-bold mb-4 mt-6 scroll-mt-20">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-semibold mb-3 mt-5 scroll-mt-20">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-semibold mb-2 mt-4 scroll-mt-20">
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-lg font-semibold mb-2 mt-3 scroll-mt-20">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-base font-semibold mb-2 mt-3 scroll-mt-20">
        {children}
      </h6>
    ),
    p: ({ children }) => (
      <p className="mb-4 leading-7 text-foreground/90">{children}</p>
    ),
    a: ({ href, children }) => (
      <Link
        href={href as string}
        className="text-primary hover:underline font-medium"
      >
        {children}
      </Link>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-4 space-y-2 ml-4">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-4 space-y-2 ml-4">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-7">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary/30 pl-4 py-2 mb-4 italic bg-muted/30 rounded-r">
        {children}
      </blockquote>
    ),
    code: ({ children, className }) => {
      const isInline = !className;

      if (isInline) {
        return (
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
            {children}
          </code>
        );
      }

      return <code className={className}>{children}</code>;
    },
    pre: ({ children }) => (
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 text-sm">
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full divide-y divide-border">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
    tbody: ({ children }) => (
      <tbody className="divide-y divide-border">{children}</tbody>
    ),
    tr: ({ children }) => <tr className="hover:bg-muted/50">{children}</tr>,
    th: ({ children }) => (
      <th className="px-4 py-3 text-left text-sm font-semibold">{children}</th>
    ),
    td: ({ children }) => <td className="px-4 py-3 text-sm">{children}</td>,
    hr: () => <hr className="my-8 border-border" />,
    img: ({ src, alt }) => (
      <span className="block my-6">
        <Image
          src={src as string}
          alt={alt as string}
          width={800}
          height={600}
          className="rounded-lg"
        />
      </span>
    ),
    ...components,
  };
}
