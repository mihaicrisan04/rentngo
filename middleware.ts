import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


// Admin routes that require admin role
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

const ADMIN_USER_IDS = [
  "user_2wrgqldXONHGnBJvkeLqTMisRiZ", // Add your admin user IDs here
  // "user_another_admin_id",
];

export default clerkMiddleware(async (auth, req) => {
  // Then check admin routes specifically
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
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
