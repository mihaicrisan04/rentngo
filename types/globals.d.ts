/**
 * Clerk Session Claims Type Extension
 *
 * This extends Clerk's JWT session token to include custom metadata.
 * The `role` field is set via publicMetadata in Clerk Dashboard.
 *
 * ADMIN CONFIGURATION:
 * 1. Go to Clerk Dashboard → Users → Select user
 * 2. Scroll to "Public metadata" section
 * 3. Set: { "role": "admin" }
 * 4. Save changes
 */
export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: "admin" | "user";
    };
  }
}
