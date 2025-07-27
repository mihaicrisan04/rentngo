import { differenceInDays } from "date-fns";
import { getLocationPrice } from "@/components/location-picker";
import { AdditionalFeatures } from "./useReservationForm";

export interface PricingDetails {
  basePrice: number | null;
  totalPrice: number | null;
  days: number | null;
  deliveryFee: number;
  returnFee: number;
  totalLocationFees: number;
  scdwPrice: number;
  snowChainsPrice: number;
  childSeat1to4Price: number;
  childSeat5to12Price: number;
  totalAdditionalFeatures: number;
}

export interface UseReservationPricingParams {
  pickupDate: Date | undefined;
  returnDate: Date | undefined;
  deliveryLocation: string;
  restitutionLocation: string;
  additionalFeatures: AdditionalFeatures;
  pricePerDay?: number;
}

// SCDW calculation function
const calculateSCDW = (days: number, dailyRate: number): number => {
  const base = dailyRate * 2; // cost for 1–3 days
  if (days <= 3) {
    return base;
  }
  const blocks = Math.ceil((days - 3) / 3);
  return base + 6 + 5 * (blocks - 1);
};

export function useReservationPricing({
  pickupDate,
  returnDate,
  deliveryLocation,
  restitutionLocation,
  additionalFeatures,
  pricePerDay
}: UseReservationPricingParams): PricingDetails {
  
  if (!pickupDate || !returnDate || !pricePerDay) {
    return {
      basePrice: null,
      totalPrice: null,
      days: null,
      deliveryFee: 0,
      returnFee: 0,
      totalLocationFees: 0,
      scdwPrice: 0,
      snowChainsPrice: 0,
      childSeat1to4Price: 0,
      childSeat5to12Price: 0,
      totalAdditionalFeatures: 0
    };
  }

  const days = Math.max(1, differenceInDays(returnDate, pickupDate));
  const basePrice = days * pricePerDay;
  
  // Add location fees
  const deliveryFee = getLocationPrice(deliveryLocation);
  const returnFee = getLocationPrice(restitutionLocation);
  const totalLocationFees = deliveryFee + returnFee;
  
  // Add SCDW if selected
  const scdwPrice = additionalFeatures.scdwSelected ? calculateSCDW(days, pricePerDay) : 0;
  
  // Add additional features
  const snowChainsPrice = additionalFeatures.snowChainsSelected ? days * 3 : 0;
  const childSeat1to4Price = additionalFeatures.childSeat1to4Count * days * 3;
  const childSeat5to12Price = additionalFeatures.childSeat5to12Count * days * 3;
  const totalAdditionalFeatures = snowChainsPrice + childSeat1to4Price + childSeat5to12Price;
  
  const totalPrice = basePrice + totalLocationFees + scdwPrice + totalAdditionalFeatures;

  return {
    basePrice,
    totalPrice,
    days,
    deliveryFee,
    returnFee,
    totalLocationFees,
    scdwPrice,
    snowChainsPrice,
    childSeat1to4Price,
    childSeat5to12Price,
    totalAdditionalFeatures
  };
} 