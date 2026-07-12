import { NextRequest, NextResponse } from "next/server";
import { isValidAffiliateSlug, normalizeAffiliateSlug } from "@/lib/pricing";

/**
 * Canonical referral entry point: rngo.ro/r/<slug> (owner decision, RNGO-26 —
 * no bare rngo.ro/<slug>, which would collide with the locale router).
 *
 * This handler deliberately sets NO cookie: tracking is consent-gated, so it
 * only forwards the slug as a ?ref query param and redirects to the homepage
 * (the intl middleware adds the locale prefix, preserving the query). The
 * client-side ReferralCapture component validates the slug against Convex and
 * sets the referral cookie — but only after the visitor grants cookie consent.
 * Lives outside app/[locale] and is skipped in proxy.ts so the locale
 * redirect never swallows it.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const normalized = normalizeAffiliateSlug(decodeURIComponent(slug));
  const target = new URL("/", req.url);
  if (isValidAffiliateSlug(normalized)) {
    target.searchParams.set("ref", normalized);
  }
  // Invalid slugs redirect silently (no ?ref) — slug existence is never
  // probed here; validation happens in the consent-gated capture mutation.
  return NextResponse.redirect(target, 302);
}
