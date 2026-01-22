/**
 * Flight number validation utilities
 * 
 * Flight number format: Two letter airline code + space + flight number
 * Examples: "AA 1234", "LH 456", "BA 2847"
 * 
 * Based on IATA airline codes (2-letter codes)
 * 
 * PUBLIC APIs FOR FLIGHT VALIDATION:
 * 
 * 1. ICAO API Data Service (Official)
 *    - Provides official airline codes (DOC8585)
 *    - Free tier: 100 calls
 *    - URL: https://applications.icao.int/dataservices/
 * 
 * 2. Aviationstack
 *    - Real-time flight data and validation
 *    - Free tier: 100 requests/month
 *    - URL: https://aviationstack.com/
 * 
 * 3. Aviation Edge
 *    - Airline codes and flight data
 *    - Free tier available
 *    - URL: https://aviation-edge.com/
 * 
 * For production use, consider integrating with one of these APIs
 * to validate actual flight numbers and airline codes.
 */

export const FLIGHT_NUMBER_REGEX = /^[A-Z]{2}\s\d+$/;

/**
 * Validates flight number format
 * @param flightNumber - The flight number to validate
 * @returns true if valid format, false otherwise
 */
export function validateFlightNumber(flightNumber: string): boolean {
  if (!flightNumber || !flightNumber.trim()) {
    return true; // Optional field
  }
  
  return FLIGHT_NUMBER_REGEX.test(flightNumber.trim());
}

/**
 * Formats flight number input to proper format
 * @param input - Raw input string
 * @returns Formatted flight number
 */
export function formatFlightNumber(input: string): string {
  if (!input) return "";
  
  // Convert to uppercase and remove extra spaces
  let formatted = input.toUpperCase().replace(/\s+/g, ' ').trim();
  
  // If user types letters followed by numbers without space, add space
  formatted = formatted.replace(/^([A-Z]{2})(\d)/, '$1 $2');
  
  return formatted;
}

/**
 * Common airline codes for reference/validation
 * This is a subset - in production you might want to use a complete list
 * or integrate with an airline codes API
 */
export const COMMON_AIRLINE_CODES = [
  'AA', // American Airlines
  'AC', // Air Canada
  'AF', // Air France
  'AI', // Air India
  'BA', // British Airways
  'DL', // Delta Air Lines
  'EK', // Emirates
  'FR', // Ryanair
  'KL', // KLM
  'LH', // Lufthansa
  'QF', // Qantas
  'QR', // Qatar Airways
  'RO', // TAROM (Romanian airline)
  'SK', // SAS
  'TK', // Turkish Airlines
  'UA', // United Airlines
  'VS', // Virgin Atlantic
  'W6', // Wizz Air
] as const;

/**
 * Validates if airline code exists in common codes list
 * @param airlineCode - Two letter airline code
 * @returns true if code is in common list
 */
export function isCommonAirlineCode(airlineCode: string): boolean {
  return COMMON_AIRLINE_CODES.includes(airlineCode.toUpperCase() as any);
}

/**
 * Extracts airline code from flight number
 * @param flightNumber - Full flight number (e.g., "AA 1234")
 * @returns Airline code (e.g., "AA") or null if invalid
 */
export function extractAirlineCode(flightNumber: string): string | null {
  const match = flightNumber.trim().match(/^([A-Z]{2})\s\d+$/);
  return match ? match[1] : null;
}

/**
 * Extracts flight number from full flight string
 * @param flightNumber - Full flight number (e.g., "AA 1234")
 * @returns Flight number (e.g., "1234") or null if invalid
 */
export function extractFlightDigits(flightNumber: string): string | null {
  const match = flightNumber.trim().match(/^[A-Z]{2}\s(\d+)$/);
  return match ? match[1] : null;
} 