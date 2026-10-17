import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import createMDX from "@next/mdx";
import { permanentRedirects } from "./lib/seo-redirects";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["desktop.tail2362eb.ts.net"],
  reactCompiler: true,
  cacheComponents: true,
  partialPrefetching: true,
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
  // Next streams metadata into <body> for crawlers outside its bot list, and
  // plain Googlebot is not on it; Google ignores a canonical or hreflang found
  // there. Next's default list (html-bots.ts) plus Googlebot, which costs
  // Googlebot the prerendered shell in exchange for complete <head> tags.
  htmlLimitedBots:
    /Googlebot|[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight/i,
  // Permanent so search engines move old rankings over; the middleware
  // would only answer these URLs with a temporary 307 or a 404.
  async redirects() {
    return permanentRedirects();
  },
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
