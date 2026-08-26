import * as React from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { api } from "@/convex/_generated/api";
import { searchStorage } from "@/lib/search-storage";
import type { PaymentMethod } from "@/lib/checkout-payment-methods";
import { FormErrors, validateReservationForm } from "@/lib/reservation-schema";

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  message: string;
  flightNumber: string;
}

export interface AdditionalFeaturesState {
  isSCDWSelected: boolean;
  snowChainsSelected: boolean;
  childSeat1to4Count: number;
  childSeat5to12Count: number;
  extraKilometersCount: number;
}

/**
 * Owns all mutable reservation-form state and its side effects: localStorage
 * hydration/persistence (isolated here), Clerk autofill, cross-field date
 * adjustment, progress, and validation. Pricing is deliberately not here —
 * see useReservationPricing.
 */
export function useReservationForm() {
  const t = useTranslations("reservationPage");
  const { user } = useUser();
  const currentUser = useQuery(api.users.get);

  // Rental details state - initialize with default locations
  const [deliveryLocation, setDeliveryLocation] = React.useState<string>(
    searchStorage.getDefaultLocation(),
  );
  const [pickupDate, setPickupDate] = React.useState<Date | undefined>(
    undefined,
  );
  const [pickupTime, setPickupTime] = React.useState<string | null>(null);
  const [restitutionLocation, setRestitutionLocation] = React.useState<string>(
    searchStorage.getDefaultLocation(),
  );
  const [returnDate, setReturnDate] = React.useState<Date | undefined>(
    undefined,
  );
  const [returnTime, setReturnTime] = React.useState<string | null>(null);

  // Calendar open states for sequential flow
  const [pickupCalendarOpen, setPickupCalendarOpen] = React.useState(false);
  const [returnCalendarOpen, setReturnCalendarOpen] = React.useState(false);

  // Personal information state
  const [personalInfo, setPersonalInfo] = React.useState<PersonalInfo>({
    name: "",
    email: "",
    phone: "",
    message: "",
    flightNumber: "",
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod | "">(
    "",
  );
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  // Protection state (SCDW vs Standard warranty) - default to standard
  const [isSCDWSelected, setIsSCDWSelected] = React.useState(false);

  // Additional features state
  const [snowChainsSelected, setSnowChainsSelected] = React.useState(false);
  const [childSeat1to4Count, setChildSeat1to4Count] = React.useState(0);
  const [childSeat5to12Count, setChildSeat5to12Count] = React.useState(0);
  const [extraKilometersCount, setExtraKilometersCount] = React.useState(0);

  // Form state
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});

  // Load data from localStorage after hydration
  React.useEffect(() => {
    const storedData = searchStorage.load();

    // Apply stored data with defaults (searchStorage.load() already handles defaults and validation)
    setDeliveryLocation(
      storedData.deliveryLocation || searchStorage.getDefaultLocation(),
    );
    setRestitutionLocation(
      storedData.restitutionLocation || searchStorage.getDefaultLocation(),
    );

    if (storedData.pickupDate) {
      setPickupDate(storedData.pickupDate);
    }
    // Always set times (defaults to 10:00 from searchStorage)
    setPickupTime(storedData.pickupTime ?? null);
    if (storedData.returnDate) {
      setReturnDate(storedData.returnDate);
    }
    // Always set times (defaults to 10:00 from searchStorage)
    setReturnTime(storedData.returnTime ?? null);

    setIsHydrated(true);
  }, []);

  // Auto-fill personal info when user data is available
  React.useEffect(() => {
    if (user && currentUser && isHydrated) {
      setPersonalInfo((prev) => ({
        ...prev,
        name: prev.name || currentUser.name || user.fullName || "",
        email:
          prev.email ||
          currentUser.email ||
          user.primaryEmailAddress?.emailAddress ||
          "",
        phone: prev.phone || currentUser.phone || "",
        flightNumber: prev.flightNumber || "", // Keep existing flight number if any
      }));
    }
  }, [user, currentUser, isHydrated]);

  // Save changes to localStorage when form data changes (only after hydration)
  React.useEffect(() => {
    if (!isHydrated) return;

    searchStorage.save({
      deliveryLocation: deliveryLocation || undefined,
      pickupDate: pickupDate,
      pickupTime: pickupTime,
      restitutionLocation: restitutionLocation || undefined,
      returnDate: returnDate,
      returnTime: returnTime,
    });
  }, [
    deliveryLocation,
    pickupDate,
    pickupTime,
    restitutionLocation,
    returnDate,
    returnTime,
    isHydrated,
  ]);

  // Cross-field date adjustment: keep return date >= pickup date
  const handlePickupDateChange = React.useCallback(
    (date: Date | undefined) => {
      setPickupDate(date);
      if (date && returnDate && date.getTime() > returnDate.getTime()) {
        setReturnDate(date);
      }
    },
    [returnDate],
  );

  const handleReturnDateChange = React.useCallback(
    (date: Date | undefined) => {
      if (date) {
        if (pickupDate && date.getTime() < pickupDate.getTime()) {
          setReturnDate(pickupDate);
        } else {
          setReturnDate(date);
        }
      } else {
        setReturnDate(undefined);
      }
    },
    [pickupDate],
  );

  // Calculate form completion progress
  const formProgress = React.useMemo(() => {
    const requiredFields: Array<string | boolean | Date | null | undefined> = [
      // Rental details
      deliveryLocation,
      pickupDate,
      pickupTime,
      restitutionLocation,
      returnDate,
      returnTime,
      // Personal info
      personalInfo.name.trim(),
      personalInfo.email.trim(),
      personalInfo.phone.trim(),
      // Payment
      paymentMethod,
      termsAccepted,
    ];
    const filledFields = requiredFields.filter(Boolean).length;
    return Math.round((filledFields / requiredFields.length) * 100);
  }, [
    deliveryLocation,
    pickupDate,
    pickupTime,
    restitutionLocation,
    returnDate,
    returnTime,
    personalInfo.name,
    personalInfo.email,
    personalInfo.phone,
    paymentMethod,
    termsAccepted,
  ]);

  const validate = React.useCallback(
    (): FormErrors =>
      validateReservationForm(
        {
          name: personalInfo.name.trim(),
          email: personalInfo.email.trim(),
          phone: personalInfo.phone.trim(),
          flightNumber: personalInfo.flightNumber?.trim() || undefined,
          message: personalInfo.message?.trim() || undefined,
          deliveryLocation,
          pickupDate,
          pickupTime: pickupTime || "",
          restitutionLocation,
          returnDate,
          returnTime: returnTime || "",
          paymentMethod: paymentMethod || undefined,
          termsAccepted,
        },
        t,
      ),
    [
      personalInfo,
      deliveryLocation,
      pickupDate,
      pickupTime,
      restitutionLocation,
      returnDate,
      returnTime,
      paymentMethod,
      termsAccepted,
      t,
    ],
  );

  return {
    // Auth (used by autofill here, sign-in prompt + submit in the page)
    user,
    currentUser,
    // Rental details
    deliveryLocation,
    setDeliveryLocation,
    pickupDate,
    handlePickupDateChange,
    pickupTime,
    setPickupTime,
    restitutionLocation,
    setRestitutionLocation,
    returnDate,
    handleReturnDateChange,
    returnTime,
    setReturnTime,
    pickupCalendarOpen,
    setPickupCalendarOpen,
    returnCalendarOpen,
    setReturnCalendarOpen,
    // Personal info
    personalInfo,
    setPersonalInfo,
    // Payment
    paymentMethod,
    setPaymentMethod,
    termsAccepted,
    setTermsAccepted,
    // Protection + additional features
    isSCDWSelected,
    setIsSCDWSelected,
    snowChainsSelected,
    setSnowChainsSelected,
    childSeat1to4Count,
    setChildSeat1to4Count,
    childSeat5to12Count,
    setChildSeat5to12Count,
    extraKilometersCount,
    setExtraKilometersCount,
    // Form status
    isHydrated,
    errors,
    setErrors,
    formProgress,
    validate,
  };
}
