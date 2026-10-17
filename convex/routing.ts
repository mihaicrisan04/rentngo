import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalMutation,
  internalQuery,
  type ActionCtx,
} from "./_generated/server";
import {
  assertPlausibleRouteDistance,
  assertValidCoordinates,
  MapboxRouteError,
  parseMapboxRoute,
  routeCacheKey,
  type Coordinates,
} from "../lib/pricing";

const ROUTE_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAPBOX_TIMEOUT_MS = 3_000;

const cachedRouteValidator = v.union(
  v.object({
    distanceKm: v.number(),
    durationMinutes: v.number(),
  }),
  v.null(),
);

export const getCachedRoute = internalQuery({
  args: {
    key: v.string(),
    freshAfter: v.number(),
  },
  returns: cachedRouteValidator,
  handler: async (ctx, args) => {
    const cached = await ctx.db
      .query("routeCache")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (!cached || cached.createdAt < args.freshAfter) return null;
    return {
      distanceKm: cached.distanceKm,
      durationMinutes: cached.durationMinutes,
    };
  },
});

export const saveCachedRoute = internalMutation({
  args: {
    key: v.string(),
    distanceKm: v.number(),
    durationMinutes: v.number(),
    createdAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("routeCache")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("routeCache", args);
    }
    return null;
  },
});

export interface RouteResult {
  distanceKm: number;
  durationMinutes: number;
  source: "server_mapbox" | "route_cache";
}

async function fetchMapboxRoute(
  token: string,
  pickup: Coordinates,
  dropoff: Coordinates,
): Promise<Omit<RouteResult, "source">> {
  const coordinates = `${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}`;
  const url = new URL(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}`,
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("overview", "false");

  const response = await fetch(url, {
    signal: AbortSignal.timeout(MAPBOX_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new ConvexError({
      code: "ROUTE_PROVIDER_UNAVAILABLE",
      message: "Route verification is temporarily unavailable.",
    });
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ConvexError({
      code: "ROUTE_PROVIDER_UNAVAILABLE",
      message: "Route verification returned an invalid response.",
    });
  }
  return parseMapboxRoute(payload);
}

export async function resolveRouteDistance(
  ctx: ActionCtx,
  args: {
    pickup: Coordinates;
    dropoff: Coordinates;
  },
): Promise<RouteResult> {
  try {
    assertValidCoordinates(args.pickup);
    assertValidCoordinates(args.dropoff);
  } catch {
    throw new ConvexError({
      code: "INVALID_COORDINATES",
      message: "Select valid pickup and dropoff locations.",
    });
  }
  const key = routeCacheKey(args.pickup, args.dropoff);
  const now = Date.now();
  const cached: { distanceKm: number; durationMinutes: number } | null =
    await ctx.runQuery(internal.routing.getCachedRoute, {
      key,
      freshAfter: now - ROUTE_CACHE_TTL_MS,
    });
  if (cached) {
    try {
      assertPlausibleRouteDistance(
        cached.distanceKm,
        args.pickup,
        args.dropoff,
      );
      if (
        !Number.isFinite(cached.durationMinutes) ||
        cached.durationMinutes < 0
      ) {
        throw new Error("Invalid cached transfer duration.");
      }
      return { ...cached, source: "route_cache" };
    } catch {
      console.error("[routing] Ignoring invalid route cache entry", { key });
    }
  }

  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) {
    console.error("[routing] MAPBOX_ACCESS_TOKEN missing", { key });
    throw new ConvexError({
      code: "ROUTE_PROVIDER_UNAVAILABLE",
      message: "Route verification is temporarily unavailable.",
    });
  }

  try {
    const route = await fetchMapboxRoute(token, args.pickup, args.dropoff);
    assertPlausibleRouteDistance(route.distanceKm, args.pickup, args.dropoff);
    await ctx.runMutation(internal.routing.saveCachedRoute, {
      key,
      ...route,
      createdAt: now,
    });
    return { ...route, source: "server_mapbox" };
  } catch (error) {
    if (error instanceof ConvexError) throw error;
    if (error instanceof MapboxRouteError && error.code === "NO_ROUTE") {
      throw new ConvexError({
        code: "NO_ROUTE",
        message: "No driving route exists between the selected locations.",
      });
    }
    console.error("[routing] Mapbox route verification failed", {
      error: error instanceof Error ? error.message : String(error),
      key,
    });
    throw new ConvexError({
      code: "ROUTE_PROVIDER_UNAVAILABLE",
      message: "Route verification is temporarily unavailable.",
    });
  }
}
