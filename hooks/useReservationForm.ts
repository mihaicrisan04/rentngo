import * as React from "react";
import { searchStorage } from "@/lib/searchStorage";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  message: string;
  flightNumber: string;
}

export interface AdditionalFeatures {
  scdwSelected: boolean;
  snowChainsSelected: boolean;
  childSeat1to4Count: number;
  childSeat5to12Count: number;
  extraKilometersCount: number;
}

export interface FormErrors {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    flightNumber?: string;
  };
  rentalDetails?: {
    deliveryLocation?: string;
    pickupDate?: string;
    pickupTime?: string;
    restitutionLocation?: string;
    returnDate?: string;
    returnTime?: string;
  };
  payment?: {
    method?: string;
    termsAccepted?: string;
  };
}

export interface UseReservationFormReturn {
  // Rental details state
  deliveryLocation: string;
  setDeliveryLocation: (value: string) => void;
  pickupDate: Date | undefined;
  setPickupDate: (date: Date | undefined) => void;
  pickupTime: string | null;
  setPickupTime: (time: string | null) => void;
  restitutionLocation: string;
  setRestitutionLocation: (value: string) => void;
  returnDate: Date | undefined;
  setReturnDate: (date: Date | undefined) => void;
  returnTime: string | null;
  setReturnTime: (time: string | null) => void;
  
  // Personal information
  personalInfo: PersonalInfo;
  setPersonalInfo: React.Dispatch<React.SetStateAction<PersonalInfo>>;
  
  // Payment state
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  termsAccepted: boolean;
  setTermsAccepted: (accepted: boolean) => void;
  
  // Additional features
  additionalFeatures: AdditionalFeatures;
  setAdditionalFeatures: React.Dispatch<React.SetStateAction<AdditionalFeatures>>;
  
  // Form state
  isHydrated: boolean;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  formProgress: number;
}

export function useReservationForm(): UseReservationFormReturn {
  const { user } = useUser();
  const currentUser = useQuery(api.users.get);
  
  // Rental details state
  const [deliveryLocation, setDeliveryLocation] = React.useState<string>("");
  const [pickupDate, setPickupDate] = React.useState<Date | undefined>(undefined);
  const [pickupTime, setPickupTime] = React.useState<string | null>(null);
  const [restitutionLocation, setRestitutionLocation] = React.useState<string>("");
  const [returnDate, setReturnDate] = React.useState<Date | undefined>(undefined);
  const [returnTime, setReturnTime] = React.useState<string | null>(null);
  
  // Personal information state
  const [personalInfo, setPersonalInfo] = React.useState<PersonalInfo>({
    name: "",
    email: "",
    phone: "",
    message: "",
    flightNumber: ""
  });
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = React.useState<string>("");
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  
  // Additional features state
  const [additionalFeatures, setAdditionalFeatures] = React.useState<AdditionalFeatures>({
    scdwSelected: false,
    snowChainsSelected: false,
    childSeat1to4Count: 0,
    childSeat5to12Count: 0,
    extraKilometersCount: 0,
  });
  
  // Form state
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});

  // Load data from localStorage after hydration
  React.useEffect(() => {
    const storedData = searchStorage.load();
    
    if (storedData.deliveryLocation) {
      setDeliveryLocation(storedData.deliveryLocation);
    }
    if (storedData.pickupDate) {
      setPickupDate(storedData.pickupDate);
    }
    if (storedData.pickupTime) {
      setPickupTime(storedData.pickupTime);
    }
    if (storedData.restitutionLocation) {
      setRestitutionLocation(storedData.restitutionLocation);
    }
    if (storedData.returnDate) {
      setReturnDate(storedData.returnDate);
    }
    if (storedData.returnTime) {
      setReturnTime(storedData.returnTime);
    }
    
    setIsHydrated(true);
  }, []);

  // Auto-fill personal info when user data is available
  React.useEffect(() => {
    if (user && currentUser && isHydrated) {
      setPersonalInfo(prev => ({
        ...prev,
        name: prev.name || currentUser.name || user.fullName || "",
        email: prev.email || currentUser.email || user.primaryEmailAddress?.emailAddress || "",
        phone: prev.phone || currentUser.phone || "",
        flightNumber: prev.flightNumber || ""
      }));
    }
  }, [user, currentUser, isHydrated]);

  // Save changes to localStorage when form data changes
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
  }, [deliveryLocation, pickupDate, pickupTime, restitutionLocation, returnDate, returnTime, isHydrated]);

  // Calculate form completion progress
  const formProgress = React.useMemo((): number => {
    const requiredFields = [
      // Personal info (4 required fields)
      personalInfo.name.trim(),
      personalInfo.email.trim(),
      personalInfo.phone.trim(),
      personalInfo.email.trim() && /\S+@\S+\.\S+/.test(personalInfo.email), // Valid email
      
      // Rental details (6 required fields)
      deliveryLocation,
      pickupDate,
      pickupTime,
      restitutionLocation,
      returnDate,
      returnTime,
      
      // Payment (2 required fields)
      paymentMethod,
      termsAccepted
    ];
    
    const completedFields = requiredFields.filter(field => Boolean(field)).length;
    const totalRequiredFields = requiredFields.length;
    
    return Math.round((completedFields / totalRequiredFields) * 100);
  }, [personalInfo, deliveryLocation, pickupDate, pickupTime, restitutionLocation, returnDate, returnTime, paymentMethod, termsAccepted]);

  return {
    // Rental details
    deliveryLocation,
    setDeliveryLocation,
    pickupDate,
    setPickupDate,
    pickupTime,
    setPickupTime,
    restitutionLocation,
    setRestitutionLocation,
    returnDate,
    setReturnDate,
    returnTime,
    setReturnTime,
    
    // Personal information
    personalInfo,
    setPersonalInfo,
    
    // Payment
    paymentMethod,
    setPaymentMethod,
    termsAccepted,
    setTermsAccepted,
    
    // Additional features
    additionalFeatures,
    setAdditionalFeatures,
    
    // Form state
    isHydrated,
    errors,
    setErrors,
    formProgress,
  };
} 