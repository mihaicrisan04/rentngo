import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import createMDX from "@next/mdx";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
  typescript: {
    // Optionally ignore TypeScript errors during builds
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          process.env.NEXT_PUBLIC_CONVEX_URL?.replace("https://", "").replace(
            "http://",
            "",
          ) ?? "ceaseless-trout-193.convex.cloud",
        port: "",
        pathname: "/api/storage/**",
      },
    ],
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

// Plugins are referenced by name (not imported function) so the options stay
// serializable — Turbopack can't pass JS functions across its Rust boundary.
// (This @next/mdx loader is only used for .mdx page files; the blog renders
// MDX at runtime via next-mdx-remote, which is unaffected by any of this.)
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: [
      "rehype-highlight",
      "rehype-slug",
      ["rehype-autolink-headings", { behavior: "wrap" }],
    ],
  },
});

export default withNextIntl(withMDX(nextConfig));
