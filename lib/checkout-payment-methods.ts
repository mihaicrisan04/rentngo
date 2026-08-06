// Payment method config shared by the reservation and transfer checkouts.
// Labels are translation keys under `reservationPage.payment.methods`,
// resolved at render time by the shared CheckoutPaymentMethods component.

export const PAYMENT_METHOD_IDS = [
  "cash_on_delivery",
  "card_on_delivery",
  "card_online",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHOD_IDS)[number];

export interface PaymentMethodConfig {
  id: PaymentMethod;
  /** Key under `reservationPage.payment.methods` with `.label`/`.description`. */
  translationKey: string;
  disabled: boolean;
}

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: "cash_on_delivery",
    translationKey: "cashOnDelivery",
    disabled: false,
  },
  {
    id: "card_on_delivery",
    translationKey: "cardOnDelivery",
    disabled: false,
  },
  {
    id: "card_online",
    translationKey: "cardOnline",
    disabled: true,
  },
];

/**
 * Key under `reservationPage.payment.methods` for a stored payment method,
 * or null for unknown values.
 */
export function paymentMethodLabelKey(method: string): string | null {
  const config = PAYMENT_METHODS.find((m) => m.id === method);
  return config ? `${config.translationKey}.label` : null;
}
