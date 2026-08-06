/** Shared display formatting helpers. */

export function formatPrice(price: number): string {
  return `${price.toFixed(2)} EUR`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}
