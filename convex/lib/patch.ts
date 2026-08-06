/**
 * Drops keys whose value is `undefined`, for building `ctx.db.patch` payloads
 * from optional mutation args. Convex omits unsupplied optional args, but this
 * guarantees a field can never be patched to `undefined` (which would remove
 * it) when it simply wasn't passed.
 */
export function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}
