/**
 * Client-side cookie helpers for the consent gate and referral attribution
 * (RNGO-26). Both cookies are first-party and readable by JS: the checkout
 * runs Convex mutations straight from the browser, so it must read the
 * referral pair itself to pass it as a mutation arg. The pair is NOT trusted
 * server-side — it must match an attribution row recorded via
 * recordReferralAttribution, and all amounts are recomputed on the server.
 */

export const CONSENT_COOKIE = "rngo_consent";
export const REFERRAL_COOKIE = "rngo_ref";

/** Consent choice is remembered for 6 months. */
const CONSENT_MAX_AGE_DAYS = 182;

export type ConsentStatus = "granted" | "denied" | "unset";

export interface StoredReferral {
  slug: string;
  visitorKey: string;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  for (const part of document.cookie.split("; ")) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq) === name) {
      return decodeURIComponent(part.slice(eq + 1));
    }
  }
  return null;
}

function writeCookie(name: string, value: string, maxAgeDays: number) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${
    maxAgeDays * 24 * 60 * 60
  }; SameSite=Lax${secure}`;
}

export function getConsentStatus(): ConsentStatus {
  const value = readCookie(CONSENT_COOKIE);
  return value === "granted" || value === "denied" ? value : "unset";
}

export function setConsentStatus(status: "granted" | "denied") {
  writeCookie(CONSENT_COOKIE, status, CONSENT_MAX_AGE_DAYS);
}

/** Cookie value is `<slug>:<visitorKey>`. */
export function getStoredReferral(): StoredReferral | null {
  const value = readCookie(REFERRAL_COOKIE);
  if (!value) return null;
  const sep = value.indexOf(":");
  if (sep <= 0 || sep === value.length - 1) return null;
  return { slug: value.slice(0, sep), visitorKey: value.slice(sep + 1) };
}

export function setStoredReferral(
  referral: StoredReferral,
  maxAgeDays: number,
) {
  writeCookie(
    REFERRAL_COOKIE,
    `${referral.slug}:${referral.visitorKey}`,
    maxAgeDays,
  );
}

/** Event dispatched by the consent banner when the visitor accepts. */
export const CONSENT_GRANTED_EVENT = "rngo:consent-granted";

/**
 * Event dispatched by ReferralCapture after the attribution is recorded and
 * the cookie is written. The checkout hook listens for it so a checkout that
 * mounted before the (async) capture still picks the referral up.
 */
export const REFERRAL_CAPTURED_EVENT = "rngo:referral-captured";
