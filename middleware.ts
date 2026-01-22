import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import createMiddleware from 'next-intl/middleware';

// Admin routes that require admin role
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

/**
 * ADMIN CONFIGURATION
 *
 * Admin access is controlled via Clerk publicMetadata.
 * To grant admin access:
 * 1. Go to Clerk Dashboard → Users → Select user
 * 2. Edit "Public metadata" → Set: { "role": "admin" }
 * 3. Save
 *
 * Session token must include metadata (configured in Clerk Dashboard → Sessions):
 * { "metadata": "{{user.public_metadata}}" }
 */

// Create the internationalization middleware
const intlMiddleware = createMiddleware({
  locales: ['ro', 'en'],
  defaultLocale: 'ro',
  localePrefix: 'always' // Both /ro and /en will have explicit prefixes
});

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;

  // Skip internationalization for admin routes, API routes, and static files
  if (isAdminRoute(req) ||
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.includes('.')) {

    // Handle admin routes
    if (isAdminRoute(req)) {
      const { userId, sessionClaims } = await auth();

      // If no user is authenticated, redirect to sign-in
      if (!userId) {
        const homeUrl = new URL("/", req.url);
        return NextResponse.redirect(homeUrl);
      }

      // Check admin role from session claims (set via Clerk publicMetadata)
      const isAdmin = sessionClaims?.metadata?.role === "admin";
      if (!isAdmin) {
        const homeUrl = new URL("/", req.url);
        return NextResponse.redirect(homeUrl);
      }
    }

    return NextResponse.next();
  }

  // Apply internationalization to other routes
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
