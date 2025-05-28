import { format } from "date-fns";
import { ReservationEmailData } from "@/types/email";

// Payment method display names
export const getPaymentMethodLabel = (method: string): string => {
  const labels: Record<string, string> = {
    cash_on_delivery: "Cash on delivery",
    card_on_delivery: "Card payment on delivery", 
    card_online: "Card payment online"
  };
  return labels[method] || method;
};

// Format currency values
export const formatCurrency = (amount: number, currency: string = "EUR"): string => {
  return `${amount} ${currency}`;
};

// Transform reservation data from database format to email format
export const transformReservationForEmail = (
  reservation: any,
  vehicle: any,
  numberOfDays: number
): ReservationEmailData => {
  return {
    reservationId: reservation._id || "N/A",
    customerInfo: {
      name: reservation.customerInfo.name,
      email: reservation.customerInfo.email,
      phone: reservation.customerInfo.phone,
      message: reservation.customerInfo.message,
      flightNumber: reservation.customerInfo.flightNumber,
    },
    vehicleInfo: {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      type: vehicle.type,
      seats: vehicle.seats,
      transmission: vehicle.transmission,
      fuelType: vehicle.fuelType,
      features: vehicle.features,
    },
    rentalDetails: {
      startDate: format(new Date(reservation.startDate), "MMMM dd, yyyy"),
      endDate: format(new Date(reservation.endDate), "MMMM dd, yyyy"),
      pickupTime: reservation.pickupTime,
      restitutionTime: reservation.restitutionTime,
      pickupLocation: reservation.pickupLocation,
      restitutionLocation: reservation.restitutionLocation,
      numberOfDays,
    },
    pricingDetails: {
      pricePerDay: vehicle.pricePerDay,
      totalPrice: reservation.totalPrice,
      paymentMethod: reservation.paymentMethod,
      promoCode: reservation.promoCode,
      additionalCharges: reservation.additionalCharges,
    },
  };
};

// Calculate pricing breakdown
export const calculatePricingBreakdown = (
  pricePerDay: number,
  numberOfDays: number,
  additionalCharges?: Array<{ description: string; amount: number }>
) => {
  const rentalSubtotal = pricePerDay * numberOfDays;
  const additionalTotal = additionalCharges?.reduce((sum, charge) => sum + charge.amount, 0) || 0;
  const total = rentalSubtotal + additionalTotal;
  
  return {
    rentalSubtotal,
    additionalTotal,
    total,
  };
}; 