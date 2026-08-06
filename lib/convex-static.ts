import { ConvexHttpClient } from "convex/browser";
import type {
  FunctionReference,
  FunctionReturnType,
  OptionalRestArgs,
} from "convex/server";

/**
 * Like `fetchQuery` from `convex/nextjs`, but without the hardcoded
 * `cache: "no-store"` fetch option that helper always sets. An explicit
 * no-store fetch opts the whole route into dynamic rendering, which would
 * defeat prerendering of the public pages. Freshness is handled by the
 * calling page's `"use cache"` + `cacheLife()` instead, and Next never caches
 * POST fetches, so no extra staleness is introduced for dynamic renders.
 *
 * Use this for public, unauthenticated queries on statically rendered pages.
 * For authenticated or per-request data, keep using `fetchQuery` from
 * `convex/nextjs`.
 */
export async function fetchStaticQuery<
  Query extends FunctionReference<"query">,
>(
  query: Query,
  ...args: OptionalRestArgs<Query>
): Promise<FunctionReturnType<Query>> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (typeof url !== "string") {
    throw new Error("Environment variable NEXT_PUBLIC_CONVEX_URL is not set.");
  }
  const client = new ConvexHttpClient(url);
  return client.query(query, ...args);
}
