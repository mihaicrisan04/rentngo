// Email types based on Convex schema and application requirements

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  message?: string;
  flightNumber?: string;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year?: number;
  type?: "sedan" | "suv" | "hatchback" | "sports" | "truck" | "van";
  seats?: number;
  transmission?: "automatic" | "manual";
  fuelType?: "petrol" | "diesel" | "electric" | "hybrid" | "benzina";
  features?: string[];
}

export interface RentalDetails {
  startDate: string; // Formatted date string
  endDate: string; // Formatted date string
  pickupTime: string;
  restitutionTime: string;
  pickupLocation: string;
  restitutionLocation: string;
  numberOfDays: number;
}

export interface PricingDetails {
  pricePerDay: number;
  totalPrice: number;
  paymentMethod: "cash_on_delivery" | "card_on_delivery" | "card_online";
  promoCode?: string;
  additionalCharges?: Array<{
    description: string;
    amount: number;
  }>;
}

export interface ReservationEmailData {
  reservationId: string;
  customerInfo: CustomerInfo;
  vehicleInfo: VehicleInfo;
  rentalDetails: RentalDetails;
  pricingDetails: PricingDetails;
}

// Email template types for different email purposes
export type EmailType = "reservation_request" | "confirmation" | "reminder" | "cancellation" | "receipt";

export interface EmailTemplateProps {
  data: ReservationEmailData;
  type: EmailType;
}

// Preview props for email development
export interface EmailPreviewProps {
  customerInfo: CustomerInfo;
  vehicleInfo: VehicleInfo;
  rentalDetails: RentalDetails;
  pricingDetails: PricingDetails;
  reservationId: string;
} 