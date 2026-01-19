// Email utility functions for Convex email actions

// Payment method display names
export const getPaymentMethodLabel = (method: string): string => {
  const labels: Record<string, string> = {
    cash_on_delivery: "Cash on delivery",
    card_on_delivery: "Card payment on delivery",
    card_online: "Card payment online",
  };
  return labels[method] || method;
};

// Format currency values
export const formatCurrency = (
  amount: number,
  currency: string = "EUR"
): string => {
  return `${amount} ${currency}`;
};

// Calculate pricing breakdown
export const calculatePricingBreakdown = (
  pricePerDay: number,
  numberOfDays: number,
  additionalCharges?: Array<{ description: string; amount: number }>
) => {
  const rentalSubtotal = pricePerDay * numberOfDays;
  const additionalTotal =
    additionalCharges?.reduce((sum, charge) => sum + charge.amount, 0) || 0;
  const total = rentalSubtotal + additionalTotal;

  return {
    rentalSubtotal,
    additionalTotal,
    total,
  };
};

// Format duration for transfers
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}min`;
};
