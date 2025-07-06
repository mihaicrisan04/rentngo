import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import createMiddleware from 'next-intl/middleware';

// Admin routes that require admin role
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

const ADMIN_USER_IDS = [
  "user_2wrgqldXONHGnBJvkeLqTMisRiZ", // mihai dev env
  "user_2ysDX4oi6GmtJ9xKYVBSFFFjflH", // tudor prod env
  "user_2xbWHVNoaZTbon4ptfxvjwet6lT", // mihai prod env
];

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
      const { userId } = await auth();
      
      // If no user is authenticated, redirect to sign-in
      if (!userId) {
        const homeUrl = new URL("/", req.url);
        return NextResponse.redirect(homeUrl);
      }
      
      // If user is authenticated but not an admin, redirect to home
      if (!ADMIN_USER_IDS.includes(userId)) {
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
