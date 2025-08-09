/**
 * International phone validation helper
 * - Allows a curated set of country dial codes (EU-focused + major global)
 * - Accepts common separators (spaces, dashes, parentheses)
 * - Validates normalized E.164 format constraints
 */

/**
 * Curated list of allowed international dial codes.
 * Emphasis on Europe plus globally common countries.
 * Keep strings with leading '+'.
 */
export const ALLOWED_DIAL_CODES: string[] = [
  // Europe (EU and neighbors)
  "+30", // Greece
  "+31", // Netherlands
  "+32", // Belgium
  "+33", // France
  "+34", // Spain
  "+35", // prefix for multiple (we list specifics below, keep exact codes)
  "+350", // Gibraltar
  "+351", // Portugal
  "+352", // Luxembourg
  "+353", // Ireland
  "+354", // Iceland
  "+355", // Albania
  "+356", // Malta
  "+357", // Cyprus
  "+358", // Finland
  "+359", // Bulgaria
  "+36", // Hungary
  "+370", // Lithuania
  "+371", // Latvia
  "+372", // Estonia
  "+373", // Moldova
  "+374", // Armenia (wider Europe region)
  "+375", // Belarus
  "+376", // Andorra
  "+377", // Monaco
  "+378", // San Marino
  "+380", // Ukraine
  "+381", // Serbia
  "+382", // Montenegro
  "+383", // Kosovo
  "+385", // Croatia
  "+386", // Slovenia
  "+387", // Bosnia and Herzegovina
  "+389", // North Macedonia
  "+39", // Italy (incl. Vatican via +379 but we skip minor)
  "+40", // Romania
  "+41", // Switzerland
  "+420", // Czech Republic
  "+421", // Slovakia
  "+43", // Austria
  "+44", // United Kingdom
  "+45", // Denmark
  "+46", // Sweden
  "+47", // Norway
  "+48", // Poland
  "+49", // Germany

  // North America
  "+1", // USA/Canada/NANP
  
  // South America
  "+52", // Mexico
  "+54", // Argentina
  "+55", // Brazil
  "+56", // Chile
  "+57", // Colombia
  "+58", // Venezuela

  // Asia & Pacific
  "+60", // Malaysia
  "+61", // Australia
  "+62", // Indonesia
  "+63", // Philippines
  "+64", // New Zealand
  "+65", // Singapore
  "+66", // Thailand
  "+81", // Japan
  "+82", // South Korea
  "+84", // Vietnam
  "+86", // China
  "+852", // Hong Kong
  "+853", // Macao
  "+855", // Cambodia
  "+856", // Laos
  "+90", // Turkey
  "+91", // India
  "+92", // Pakistan
  "+94", // Sri Lanka
  "+95", // Myanmar
  "+98", // Iran

  // Middle East
  "+970", // Palestine
  "+971", // United Arab Emirates
  "+972", // Israel
  "+973", // Bahrain
  "+974", // Qatar
  "+975", // Bhutan
  "+976", // Mongolia
  "+977", // Nepal
  "+966", // Saudi Arabia
  "+968", // Oman
  "+964", // Iraq
  "+963", // Syria
  "+962", // Jordan
  "+961", // Lebanon

  // Africa
  "+20", // Egypt
  "+212", // Morocco
  "+213", // Algeria
  "+216", // Tunisia
  "+218", // Libya
  "+234", // Nigeria
  "+254", // Kenya
  "+255", // Tanzania
  "+256", // Uganda
  "+27", // South Africa
];

/**
 * Returns dial codes sorted by length descending so that longer (more specific) codes match first
 */
function getDialCodesSortedByLength(): string[] {
  return [...ALLOWED_DIAL_CODES].sort((a, b) => b.length - a.length);
}

/**
 * Normalize typical user-entered phone numbers into compact E.164-like string
 * Keeps leading '+' and digits; strips spaces, dashes, parentheses.
 */
export function normalizePhoneNumber(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  // Remove spaces, hyphens, parentheses
  const compact = trimmed.replace(/[\s\-()]/g, "");
  return compact;
}

/**
 * Validate an international phone number against E.164 constraints and allowed dial codes
 * - Must start with '+'
 * - Only digits afterwards
 * - Total length between 8 and 15 characters (inclusive) when normalized
 * - Country dial code must be in ALLOWED_DIAL_CODES
 */
export function isValidInternationalPhoneNumber(input: string): boolean {
  const normalized = normalizePhoneNumber(input);
  if (!normalized.startsWith("+")) return false;
  if (!/^\+\d+$/.test(normalized)) return false;

  // E.164 length constraints: max 15 digits total (including country code), min ~8 for practicality
  if (normalized.length < 8 || normalized.length > 16) {
    // 1 char for '+' + up to 15 digits => length <= 16
    return false;
  }

  // Check allowed dial codes
  const codes = getDialCodesSortedByLength();
  const hasAllowedPrefix = codes.some((code) => normalized.startsWith(code));
  return hasAllowedPrefix;
}

/**
 * Expose allowed dial codes (copy) for any consumer that needs to display or log them.
 */
export function getAllowedDialCodes(): string[] {
  return [...ALLOWED_DIAL_CODES];
}


