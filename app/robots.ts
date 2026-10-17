import { MetadataRoute } from "next";
import { IS_PRODUCTION_DEPLOYMENT } from "@/lib/env";

const DISALLOWED_PATHS = ["/admin/", "/api/"];

/**
 * AI crawler user-agents we explicitly welcome (list verified July 2026).
 *
 * The `*` catch-all below already permits them; naming them makes the opt-in
 * unambiguous and keeps AI access intact if the wildcard rule is ever
 * tightened.
 *
 * NOTE: this list includes TRAINING crawlers (GPTBot, ClaudeBot, CCBot,
 * Amazonbot, meta-externalagent, Bytespider) as well as retrieval/search
 * crawlers — the goal is maximum AI visibility ("so AI models recommend us").
 * If the client later prefers retrieval-only, move the training crawlers into
 * a `disallow: "/"` rule. Google-Extended and Applebot-Extended are training
 * opt-out *tokens* (default: allowed); they are listed only to make the
 * training opt-in explicit for Google/Apple.
 */
const AI_CRAWLERS = [
  // Retrieval / AI search (feed cited AI answers)
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "DuckAssistBot",
  "Applebot",
  "MistralAI-User",
  // Training (build model corpora)
  "GPTBot",
  "ClaudeBot",
  "CCBot",
  "Amazonbot",
  "meta-externalagent",
  "Bytespider",
  // Training opt-in tokens
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  // Preview deployments (dev.rngo.ro) would otherwise be indexed as duplicate
  // content competing with rngo.ro.
  if (!IS_PRODUCTION_DEPLOYMENT) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: AI_CRAWLERS,
        allow: "/",
        disallow: DISALLOWED_PATHS,
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED_PATHS,
      },
    ],
    sitemap: "https://rngo.ro/sitemap.xml",
  };
}
