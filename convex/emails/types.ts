// Email types for Convex email actions
// Duplicated from types/email.ts to work within Convex Node actions

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
  isSCDWSelected?: boolean;
  deductibleAmount?: number;
  protectionCost?: number;
}

export interface ReservationEmailData {
  reservationNumber: number;
  customerInfo: CustomerInfo;
  vehicleInfo: VehicleInfo;
  rentalDetails: RentalDetails;
  pricingDetails: PricingDetails;
  locale?: "en" | "ro";
}

// Transfer email types

export interface TransferLocation {
  address: string;
}

export interface TransferVehicleInfo {
  make: string;
  model: string;
  year?: number;
  type?: "sedan" | "suv" | "hatchback" | "sports" | "truck" | "van";
  seats?: number;
  transmission?: "automatic" | "manual";
  fuelType?: "petrol" | "diesel" | "electric" | "hybrid" | "benzina";
}

export interface TransferPricingDetails {
  baseFare: number;
  distancePrice: number;
  totalPrice: number;
  pricePerKm: number;
}

export interface TransferEmailData {
  transferNumber: number;
  customerInfo: CustomerInfo;
  vehicleInfo: TransferVehicleInfo;
  pickupLocation: TransferLocation;
  dropoffLocation: TransferLocation;
  pickupDate: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  transferType: "one_way" | "round_trip";
  passengers: number;
  luggageCount?: number;
  distanceKm: number;
  estimatedDurationMinutes: number;
  pricingDetails: TransferPricingDetails;
  paymentMethod: "cash_on_delivery" | "card_on_delivery" | "card_online";
  locale?: "en" | "ro";
}
