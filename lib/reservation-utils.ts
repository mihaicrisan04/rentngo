import { FormErrors, PersonalInfo } from "@/hooks/use-reservation-form";
 

export const paymentMethods = [
  { id: "cash_on_delivery", label: "Cash on delivery", description: "Pay when you pick up the vehicle" },
  { id: "card_on_delivery", label: "Card payment on delivery", description: "Pay with card when you pick up the vehicle" },
  { id: "card_online", label: "Card payment online", description: "Pay now with your card" }
];

export function validateReservationForm({
  personalInfo,
  deliveryLocation,
  pickupDate,
  pickupTime,
  restitutionLocation,
  returnDate,
  returnTime,
  paymentMethod,
  termsAccepted,
}: {
  personalInfo: PersonalInfo;
  deliveryLocation: string;
  pickupDate: Date | undefined;
  pickupTime: string | null;
  restitutionLocation: string;
  returnDate: Date | undefined;
  returnTime: string | null;
  paymentMethod: string;
  termsAccepted: boolean;
}): FormErrors {
  const newErrors: FormErrors = {};

  // Personal info validation
  if (!personalInfo.name.trim()) {
    newErrors.personalInfo = { ...newErrors.personalInfo, name: "Name is required" };
  }
  if (!personalInfo.email.trim()) {
    newErrors.personalInfo = { ...newErrors.personalInfo, email: "Email is required" };
  } else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
    newErrors.personalInfo = { ...newErrors.personalInfo, email: "Email is not valid" };
  }
  if (!personalInfo.phone.trim()) {
    newErrors.personalInfo = { ...newErrors.personalInfo, phone: "Phone number is required" };
  }
  

  // Rental details validation
  if (!deliveryLocation) {
    newErrors.rentalDetails = { ...newErrors.rentalDetails, deliveryLocation: "Pick-up location is required" };
  }
  if (!pickupDate) {
    newErrors.rentalDetails = { ...newErrors.rentalDetails, pickupDate: "Pick-up date is required" };
  }
  if (!pickupTime) {
    newErrors.rentalDetails = { ...newErrors.rentalDetails, pickupTime: "Pick-up time is required" };
  }
  if (!restitutionLocation) {
    newErrors.rentalDetails = { ...newErrors.rentalDetails, restitutionLocation: "Return location is required" };
  }
  if (!returnDate) {
    newErrors.rentalDetails = { ...newErrors.rentalDetails, returnDate: "Return date is required" };
  }
  if (!returnTime) {
    newErrors.rentalDetails = { ...newErrors.rentalDetails, returnTime: "Return time is required" };
  }

  // Payment validation
  if (!paymentMethod) {
    newErrors.payment = { ...newErrors.payment, method: "Payment method is required" };
  }
  if (!termsAccepted) {
    newErrors.payment = { ...newErrors.payment, termsAccepted: "You must accept the terms and conditions" };
  }

  return newErrors;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case "cash_on_delivery":
      return "Cash on Delivery";
    case "card_on_delivery":
      return "Card Payment on Delivery";
    case "card_online":
      return "Card Payment Online";
    default:
      return method;
  }
} 
