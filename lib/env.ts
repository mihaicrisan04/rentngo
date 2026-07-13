/**
 * True only on Vercel production deployments (rngo.ro). Preview deployments
 * (dev.rngo.ro) and local builds must never be indexed by search engines, so
 * anything SEO-facing should branch on this instead of NODE_ENV.
 *
 * VERCEL_ENV is set at build time per deployment: "production" | "preview"
 * | "development" (undefined outside Vercel).
 */
export const IS_PRODUCTION_DEPLOYMENT = process.env.VERCEL_ENV === "production";
