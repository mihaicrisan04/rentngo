"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Vehicle } from "@/types/vehicle";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Calendar,
  Send,
  User,
  CreditCard,
  AlertCircle,
  Info,
} from "lucide-react";
import { LocationPicker } from "@/components/shared/search-filters/location-picker";
import { DateTimePicker } from "@/components/shared/search-filters/date-time-picker";
import { searchStorage } from "@/lib/searchStorage";
import {
  calculateVehiclePricingWithSeason,
  getPriceForDurationWithSeason,
  calculateIncludedKilometers,
  calculateExtraKilometersPrice,
} from "@/lib/vehicleUtils";
import { getBasePricePerDay } from "@/types/vehicle";
import { useUser, SignInButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { Progress } from "@/components/ui/progress";
import { useDateBasedSeasonalPricing } from "@/hooks/useDateBasedSeasonalPricing";
import { useTranslations, useLocale } from "next-intl";
import { z } from "zod";
import { isValidInternationalPhoneNumber } from "@/lib/phoneValidation";

// Validation schema for reservation form - will be updated with translations
const createReservationSchema = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    // Personal info
    name: z.string().min(1, t("validation.nameRequired")),
    email: z.string().email(t("validation.emailRequired")),
    phone: z
      .string()
      .min(1, t("validation.phoneRequired"))
      .refine(
        (val) => isValidInternationalPhoneNumber(val),
        t("validation.phoneFormatInvalid"),
      ),
    flightNumber: z.string().optional(),
    message: z.string().optional(),

    // Rental details
    deliveryLocation: z.string().min(1, t("validation.pickupLocationRequired")),
    pickupDate: z.date({ required_error: t("validation.pickupDateRequired") }),
    pickupTime: z.string().refine((val) => val.trim().length > 0, {
      message: t("validation.pickupTimeRequired"),
    }),
    restitutionLocation: z
      .string()
      .min(1, t("validation.returnLocationRequired")),
    returnDate: z.date({ required_error: t("validation.returnDateRequired") }),
    returnTime: z.string().refine((val) => val.trim().length > 0, {
      message: t("validation.returnTimeRequired"),
    }),

    // Payment
    paymentMethod: z
      .union([
        z.enum(["cash_on_delivery", "card_on_delivery", "card_online"]),
        z.undefined(),
      ])
      .refine((val) => val !== undefined, {
        message: t("validation.paymentMethodRequired"),
      }),
    termsAccepted: z
      .boolean()
      .refine((val) => val === true, t("validation.termsAcceptanceRequired")),
  });

// Form validation errors interface
interface FormErrors {
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

interface PricingCalculation {
  basePrice: number | null;
  totalPrice: number | null;
  days: number | null;
  deliveryFee: number;
  returnFee: number;
  totalLocationFees: number;
  warrantyAmount: number;
  scdwPrice: number;
  protectionCost: number;
  deductibleAmount: number;
  snowChainsPrice: number;
  childSeat1to4Price: number;
  childSeat5to12Price: number;
  extraKilometersPrice: number;
  totalAdditionalFeatures: number;
  seasonalMultiplier: number;
  seasonalAdjustment?: number;
  basePriceBeforeSeason: number | null;
  seasonalPricePerDay: number | null;
}

function ReservationPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const t = useTranslations("reservationPage");
  const locale = useLocale();

  // Payment method options - now using translations
  const paymentMethods = [
    {
      id: "cash_on_delivery",
      label: t("payment.methods.cashOnDelivery.label"),
      description: t("payment.methods.cashOnDelivery.description"),
      disabled: false,
    },
    {
      id: "card_on_delivery",
      label: t("payment.methods.cardOnDelivery.label"),
      description: t("payment.methods.cardOnDelivery.description"),
      disabled: false,
    },
    {
      id: "card_online",
      label: t("payment.methods.cardOnline.label"),
      description: t("payment.methods.cardOnline.description"),
      disabled: true,
    },
  ];

  // Only get vehicleId from URL - all form data comes from localStorage
  const vehicleId = searchParams.get("vehicleId");

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

  // Add date-based seasonal pricing
  const { multiplier: seasonalMultiplier, seasonId } =
    useDateBasedSeasonalPricing(pickupDate, returnDate);

  // Personal information state
  const [personalInfo, setPersonalInfo] = React.useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    flightNumber: "",
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = React.useState<string>("");
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  // Protection state (SCDW vs Standard warranty)
  const [isSCDWSelected, setIsSCDWSelected] = React.useState(false); // Default to standard warranty

  // Additional features state
  const [snowChainsSelected, setSnowChainsSelected] = React.useState(false);
  const [childSeat1to4Count, setChildSeat1to4Count] = React.useState(0);
  const [childSeat5to12Count, setChildSeat5to12Count] = React.useState(0);
  const [extraKilometersCount, setExtraKilometersCount] = React.useState(0);

  // Form state
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Queries and mutations
  const currentUser = useQuery(api.users.get);
  const createReservationMutation = useMutation(
    api.reservations.createReservation,
  );

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

  const vehicle = useQuery(
    api.vehicles.getById,
    vehicleId ? { id: vehicleId as Id<"vehicles"> } : "skip",
  );

  const vehicleClass = useQuery(
    api.vehicleClasses.getById,
    vehicle?.classId ? { id: vehicle.classId } : "skip",
  );

  const imageUrl = useQuery(
    api.vehicles.getImageUrl,
    vehicle?.mainImageId ? { imageId: vehicle.mainImageId } : "skip",
  );

  const additional50kmPrice = vehicleClass?.additional50kmPrice ?? 5;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // SCDW calculation function
  const calculateSCDW = (days: number, dailyRate: number): number => {
    const base = dailyRate * 2; // costul asigurării pentru 1–3 zile
    if (days <= 3) {
      return base;
    }
    const blocks = Math.ceil((days - 3) / 3);
    return base + 6 + 5 * (blocks - 1);
  };

  // Warranty calculation function - use vehicle warranty or fallback based on type
  const calculateWarranty = (vehicle: Vehicle | null | undefined): number => {
    // If vehicle has warranty field, use it
    if (vehicle?.warranty) {
      return vehicle.warranty;
    }

    // Fallback to type-based calculation for backward compatibility
    const vehicleType = vehicle?.type || "standard";
    switch (vehicleType.toLowerCase()) {
      case "economy":
        return 300;
      case "compact":
        return 400;
      case "midsize":
      case "intermediate":
        return 500;
      case "standard":
      case "fullsize":
        return 600;
      case "suv":
      case "premium":
        return 800;
      case "luxury":
        return 1000;
      default:
        return 500; // Default warranty amount
    }
  };

  // Calculate pricing using enhanced vehicle pricing utility with seasonal adjustments
  const calculateTotalPrice = (): PricingCalculation => {
    if (pickupDate && returnDate && vehicle) {
      // Use the enhanced pricing calculation with seasonal adjustment
      const vehiclePricing = calculateVehiclePricingWithSeason(
        vehicle,
        seasonalMultiplier,
        pickupDate,
        returnDate,
        deliveryLocation || undefined,
        restitutionLocation || undefined,
        pickupTime,
        returnTime,
      );

      const {
        basePrice,
        days,
        deliveryFee,
        returnFee,
        totalLocationFees,
        seasonalAdjustment,
        basePriceBeforeSeason,
      } = vehiclePricing;

      if (basePrice === null || days === null) {
        return {
          basePrice: null,
          totalPrice: null,
          days: null,
          deliveryFee: 0,
          returnFee: 0,
          totalLocationFees: 0,
          warrantyAmount: 0,
          scdwPrice: 0,
          protectionCost: 0,
          deductibleAmount: 0,
          snowChainsPrice: 0,
          childSeat1to4Price: 0,
          childSeat5to12Price: 0,
          extraKilometersPrice: 0,
          totalAdditionalFeatures: 0,
          seasonalMultiplier,
          seasonalAdjustment: 0,
          basePriceBeforeSeason: null,
          seasonalPricePerDay: null,
        };
      }

      // Single source of truth for seasonal-adjusted price per day
      const seasonalPricePerDay = getPriceForDurationWithSeason(
        vehicle,
        days,
        seasonalMultiplier,
      );

      // Calculate protection costs (warranty or SCDW) using base price without seasonal adjustments
      const warrantyAmount = calculateWarranty(vehicle);
      const scdwPrice = calculateSCDW(days, Math.round(getBasePricePerDay(vehicle) * seasonalMultiplier));

      // Calculate protection cost and deductible based on selection
      const protectionCost = isSCDWSelected ? scdwPrice : 0;
      const deductibleAmount = isSCDWSelected ? 0 : warrantyAmount || 0;

      // Add additional features
      const snowChainsPrice = snowChainsSelected ? days * 3 : 0;
      const childSeat1to4Price = childSeat1to4Count * days * 3;
      const childSeat5to12Price = childSeat5to12Count * days * 3;
      const extraKilometersPrice = calculateExtraKilometersPrice(
        extraKilometersCount * 50,
        additional50kmPrice,
      );
      const totalAdditionalFeatures =
        snowChainsPrice +
        childSeat1to4Price +
        childSeat5to12Price +
        extraKilometersPrice;

      return {
        basePrice,
        totalPrice:
          basePrice +
          totalLocationFees +
          protectionCost +
          totalAdditionalFeatures,
        days,
        deliveryFee,
        returnFee,
        totalLocationFees,
        warrantyAmount,
        scdwPrice,
        protectionCost,
        deductibleAmount,
        snowChainsPrice,
        childSeat1to4Price,
        childSeat5to12Price,
        extraKilometersPrice,
        totalAdditionalFeatures,
        seasonalMultiplier,
        seasonalAdjustment: seasonalAdjustment ?? 0,
        basePriceBeforeSeason: basePriceBeforeSeason ?? null,
        seasonalPricePerDay,
      };
    }

    return {
      basePrice: null,
      totalPrice: null,
      days: null,
      deliveryFee: 0,
      returnFee: 0,
      totalLocationFees: 0,
      warrantyAmount: 0,
      scdwPrice: 0,
      protectionCost: 0,
      deductibleAmount: 0,
      snowChainsPrice: 0,
      childSeat1to4Price: 0,
      childSeat5to12Price: 0,
      extraKilometersPrice: 0,
      totalAdditionalFeatures: 0,
      seasonalMultiplier,
      seasonalAdjustment: 0,
      basePriceBeforeSeason: null,
      seasonalPricePerDay: null,
    };
  };

  const {
    basePrice,
    totalPrice,
    days,
    deliveryFee,
    returnFee,
    totalLocationFees,
    warrantyAmount,
    scdwPrice,
    snowChainsPrice,
    childSeat1to4Price,
    childSeat5to12Price,
    extraKilometersPrice,
    totalAdditionalFeatures,
    seasonalPricePerDay,
  } = calculateTotalPrice();

  // Calculate form completion progress
  const formProgress = React.useMemo(() => {
    let filledFields = 0;
    const totalRequiredFields = 9; // Total required fields to track

    // Rental details (6 fields)
    if (deliveryLocation) filledFields++;
    if (pickupDate) filledFields++;
    if (pickupTime) filledFields++;
    if (restitutionLocation) filledFields++;
    if (returnDate) filledFields++;
    if (returnTime) filledFields++;

    // Personal info (3 fields)
    if (personalInfo.name.trim()) filledFields++;
    if (personalInfo.email.trim()) filledFields++;
    if (personalInfo.phone.trim()) filledFields++;

    // Payment (2 fields)
    if (paymentMethod) filledFields++;
    if (termsAccepted) filledFields++;

    return Math.round((filledFields / (totalRequiredFields + 2)) * 100);
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

  // Form validation using Zod</parameter>
  const validateForm = (): FormErrors => {
    const formData = {
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
    };

    const result = createReservationSchema(t).safeParse(formData);
    const newErrors: FormErrors = {};

    if (!result.success) {
      result.error.errors.forEach((error) => {
        const path = error.path[0] as string;

        // Map field names to error structure
        if (["name", "email", "phone", "flightNumber"].includes(path)) {
          newErrors.personalInfo = {
            ...newErrors.personalInfo,
            [path]: error.message,
          };
        } else if (
          [
            "deliveryLocation",
            "pickupDate",
            "pickupTime",
            "restitutionLocation",
            "returnDate",
            "returnTime",
          ].includes(path)
        ) {
          newErrors.rentalDetails = {
            ...newErrors.rentalDetails,
            [path]: error.message,
          };
        } else if (["paymentMethod"].includes(path)) {
          newErrors.payment = { ...newErrors.payment, method: error.message };
        } else if (["termsAccepted"].includes(path)) {
          newErrors.payment = {
            ...newErrors.payment,
            termsAccepted: error.message,
          };
        }
      });
    }

    // Additional validation for same-day time logic
    if (pickupDate && returnDate && pickupTime && returnTime) {
      const isSameDay =
        pickupDate.getFullYear() === returnDate.getFullYear() &&
        pickupDate.getMonth() === returnDate.getMonth() &&
        pickupDate.getDate() === returnDate.getDate();

      if (isSameDay) {
        const [pickupHour, pickupMinute] = pickupTime.split(":").map(Number);
        const [returnHour, returnMinute] = returnTime.split(":").map(Number);

        if (
          returnHour < pickupHour ||
          (returnHour === pickupHour && returnMinute <= pickupMinute)
        ) {
          newErrors.rentalDetails = {
            ...newErrors.rentalDetails,
            returnTime: t("validation.returnTimeSameDay"),
          };
        }
      }
    }

    return newErrors;
  };

  // Handle reservation submission
  const handleSendReservation = async () => {
    const formErrors = validateForm();
    setErrors(formErrors);

    // Check if there are any errors
    const hasErrors = Object.keys(formErrors).some(
      (key) =>
        Object.keys(formErrors[key as keyof FormErrors] || {}).length > 0,
    );

    if (hasErrors) {
      toast.error(t("validation.formErrors"));
      return;
    }

    if (!vehicleId || !vehicle || !totalPrice || !pickupDate || !returnDate) {
      return;
    }

    if (days === null || days < 0) {
      toast.error(t("validation.invalidRentalDuration"));
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare additional charges for location fees and SCDW (core info is now in dedicated fields)
      const additionalCharges = [];

      // Add location fees as charges if they exist
      if (deliveryFee > 0) {
        additionalCharges.push({
          description: t("payment.additionalCharges.pickupLocationFee", {
            location: deliveryLocation,
          }),
          amount: deliveryFee,
        });
      }

      if (returnFee > 0) {
        additionalCharges.push({
          description: t("payment.additionalCharges.returnLocationFee", {
            location: restitutionLocation,
          }),
          amount: returnFee,
        });
      }

      // Protection cost is now handled via dedicated fields, no need to add as additional charge
      // Note: Warranty is now handled via deductibleAmount field, not as additional charge

      // Add additional features
      if (snowChainsSelected && snowChainsPrice > 0 && days) {
        additionalCharges.push({
          description: t("payment.additionalCharges.snowChains", {
            days: days,
            price: snowChainsPrice,
          }),
          amount: snowChainsPrice,
        });
      }

      if (childSeat1to4Count > 0 && childSeat1to4Price > 0 && days) {
        additionalCharges.push({
          description: t("payment.additionalCharges.childSeat1to4", {
            count: childSeat1to4Count,
            days: days,
            price: childSeat1to4Price,
          }),
          amount: childSeat1to4Price,
        });
      }

      if (childSeat5to12Count > 0 && childSeat5to12Price > 0 && days) {
        additionalCharges.push({
          description: t("payment.additionalCharges.childSeat5to12", {
            count: childSeat5to12Count,
            days: days,
            price: childSeat5to12Price,
          }),
          amount: childSeat5to12Price,
        });
      }

      if (extraKilometersCount > 0 && extraKilometersPrice > 0) {
        additionalCharges.push({
          description: t("payment.additionalCharges.extraKilometers", {
            count: extraKilometersCount,
            kilometers: extraKilometersCount * 50,
            price: extraKilometersPrice,
          }),
          amount: extraKilometersPrice,
        });
      }

      // Calculate protection values for the mutation using already-calculated seasonal price
      const currentWarrantyAmount = calculateWarranty(vehicle);
      const currentPricePerDay =
        seasonalPricePerDay ||
        Math.round(getBasePricePerDay(vehicle) * seasonalMultiplier);
      const currentScdwPrice =
        days > 0 ? calculateSCDW(days, currentPricePerDay) : 0;
      const currentProtectionCost = isSCDWSelected ? currentScdwPrice : 0;
      const currentDeductibleAmount = isSCDWSelected
        ? 0
        : currentWarrantyAmount;

      // Get the Convex user ID (not the Clerk user ID)
      const created = await createReservationMutation({
        userId: currentUser ? currentUser._id : undefined,
        vehicleId: vehicleId as Id<"vehicles">,
        startDate: pickupDate.getTime(),
        endDate: returnDate.getTime(),
        pickupTime: pickupTime || "00:00",
        restitutionTime: returnTime || "00:00",
        pickupLocation: deliveryLocation.trim(),
        restitutionLocation: restitutionLocation.trim(),
        paymentMethod: paymentMethod as
          | "cash_on_delivery"
          | "card_on_delivery"
          | "card_online",
        totalPrice: totalPrice,
        customerInfo: {
          name: personalInfo.name.trim(),
          email: personalInfo.email.trim(),
          phone: personalInfo.phone.trim(),
          message:
            personalInfo.message && personalInfo.message.trim()
              ? personalInfo.message.trim()
              : undefined,
          flightNumber:
            personalInfo.flightNumber && personalInfo.flightNumber.trim()
              ? personalInfo.flightNumber.trim()
              : undefined,
        },
        promoCode: undefined, // TODO: Add promo code functionality
        additionalCharges:
          additionalCharges.length > 0 ? additionalCharges : undefined,
        isSCDWSelected: isSCDWSelected,
        deductibleAmount: currentDeductibleAmount,
        protectionCost:
          currentProtectionCost > 0 ? currentProtectionCost : undefined,
        seasonId: seasonId as Id<"seasons"> | undefined,
        seasonalMultiplier: seasonalMultiplier,
        // Email data - triggers email sending from Convex backend
        vehicleInfo: {
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          type: vehicle.type,
          seats: vehicle.seats,
          transmission: vehicle.transmission,
          fuelType: vehicle.fuelType,
          features: vehicle.features || [],
        },
        pricePerDayUsed: currentPricePerDay,
        locale,
      });
      const reservationId = created?.reservationId ?? created;

      // Success notification
      toast(t("reservation.success"), {
        description: t("reservation.successDescription")
      });

      // Clear localStorage and redirect
      searchStorage.clear();
      router.push(`/reservation/confirmation?reservationId=${reservationId}`);
    } catch (error) {
      console.error("Error creating reservation:", error);
      toast.error(t("reservation.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!vehicleId) {
    return (
      <div className="grow flex items-center justify-center p-4 md:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {t("reservation.invalid.title")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t("reservation.invalid.description")}
          </p>
          <Link href="/cars">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("reservation.invalid.browseCars")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (vehicle === undefined) {
    return (
      <div className="grow flex items-center justify-center p-4 md:p-8">
        <p className="text-muted-foreground">
          {t("reservation.loadingDetails")}
        </p>
      </div>
    );
  }

  if (vehicle === null) {
    return (
      <div className="grow flex items-center justify-center p-4 md:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {t("reservation.vehicleNotFound.title")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t("reservation.vehicleNotFound.description")}
          </p>
          <Link href="/cars">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("reservation.vehicleNotFound.browseCars")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grow p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link href={`/cars/${vehicle?.slug || vehicleId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToVehicleDetails")}
            </Button>
          </Link>

          <div className="flex items-center space-x-3">
            <div className="text-sm text-muted-foreground font-medium">
              {t("formProgress")}: {formProgress}%
            </div>
            <Progress value={formProgress} className="w-32 sm:w-40" />
          </div>
        </div>

        {/* Interactive Rental Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>{t("rentalDetails.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pickup Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {t("rentalDetails.pickupDetails")}
                </h4>
                <div className="space-y-4">
                  <div>
                    <LocationPicker
                      id="res-pickup-location"
                      label={t("rentalDetails.pickupLocation")}
                      value={deliveryLocation}
                      onValueChange={setDeliveryLocation}
                      placeholder={t("rentalDetails.selectPickupLocation")}
                      disabled={false}
                    />
                    {errors.rentalDetails?.deliveryLocation && (
                      <p className="text-sm text-red-500 mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.rentalDetails.deliveryLocation}
                      </p>
                    )}
                  </div>
                  <div>
                    <DateTimePicker
                      id="res-pickup-datetime"
                      label={t("rentalDetails.pickupDateTime")}
                      dateState={pickupDate}
                      setDateState={(date) => {
                        setPickupDate(date);
                        // Auto-adjust return date if needed
                        if (
                          date &&
                          returnDate &&
                          date.getTime() > returnDate.getTime()
                        ) {
                          setReturnDate(date);
                        }
                      }}
                      timeState={pickupTime}
                      setTimeState={setPickupTime}
                      minDate={today}
                      isLoading={false}
                      calendarOpen={pickupCalendarOpen}
                      onCalendarOpenChange={setPickupCalendarOpen}
                      onDateSelected={() => {
                        setTimeout(() => setReturnCalendarOpen(true), 100);
                      }}
                    />
                    {errors.rentalDetails?.pickupDate && (
                      <p className="text-sm text-red-500 mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.rentalDetails.pickupDate}
                      </p>
                    )}
                    {errors.rentalDetails?.pickupTime && (
                      <p className="text-sm text-red-500 mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.rentalDetails.pickupTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Return Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {t("rentalDetails.returnDetails")}
                </h4>
                <div className="space-y-4">
                  <div>
                    <LocationPicker
                      id="res-return-location"
                      label={t("rentalDetails.returnLocation")}
                      value={restitutionLocation}
                      onValueChange={setRestitutionLocation}
                      placeholder={t("rentalDetails.selectReturnLocation")}
                      disabled={false}
                    />
                    {errors.rentalDetails?.restitutionLocation && (
                      <p className="text-sm text-red-500 mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.rentalDetails.restitutionLocation}
                      </p>
                    )}
                  </div>
                  <div>
                    <DateTimePicker
                      id="res-return-datetime"
                      label={t("rentalDetails.returnDateTime")}
                      dateState={returnDate}
                      setDateState={(date) => {
                        if (date) {
                          if (
                            pickupDate &&
                            date.getTime() < pickupDate.getTime()
                          ) {
                            setReturnDate(pickupDate);
                          } else {
                            setReturnDate(date);
                          }
                        } else {
                          setReturnDate(undefined);
                        }
                      }}
                      timeState={returnTime}
                      setTimeState={setReturnTime}
                      minDate={pickupDate || today}
                      isLoading={!pickupDate}
                      pickupDate={pickupDate}
                      pickupTime={pickupTime}
                      calendarOpen={returnCalendarOpen}
                      onCalendarOpenChange={setReturnCalendarOpen}
                    />
                    {errors.rentalDetails?.returnDate && (
                      <p className="text-sm text-red-500 mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.rentalDetails.returnDate}
                      </p>
                    )}
                    {errors.rentalDetails?.returnTime && (
                      <p className="text-sm text-red-500 mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.rentalDetails.returnTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Vehicle Summary */}
            <Card>
              <CardHeader>
                <CardTitle>{t("vehicleDetails.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 relative bg-muted rounded-lg overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                        {t("vehicleDetails.noImage")}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-muted-foreground">{vehicle.year}</p>
                    <div>
                      <p className="text-lg font-bold text-yellow-500">
                        {seasonalPricePerDay ||
                          Math.round(
                            getBasePricePerDay(vehicle) * seasonalMultiplier,
                          )}{" "}
                        EUR / Day
                      </p>
                      {days &&
                        vehicle.pricingTiers &&
                        vehicle.pricingTiers.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {t("vehicleDetails.rateFor")} {days}{" "}
                            {locale === "ro"
                              ? days === 1
                                ? "zi"
                                : "zile"
                              : days === 1
                                ? "day"
                                : "days"}{" "}
                            {t("vehicleDetails.rental")}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Features Card */}
            <Card>
              <CardHeader>
                <CardTitle>{t("additionalFeatures.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Snow Chains */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="snow-chains"
                        checked={snowChainsSelected}
                        onCheckedChange={(checked) =>
                          setSnowChainsSelected(checked === true)
                        }
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="snow-chains"
                          className="text-sm font-medium cursor-pointer"
                        >
                          {t("additionalFeatures.snowChains")}
                        </Label>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-muted-foreground">
                            {t("additionalFeatures.pricePerDay")}
                          </span>
                          <span className="font-medium">
                            {snowChainsSelected && days
                              ? `${days * 3} EUR`
                              : "0 EUR"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Child Seat 1-4 years */}
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-start space-x-2">
                      <div className="flex-1">
                        <Label className="text-sm font-medium">
                          {t("additionalFeatures.childSeat1to4")}
                        </Label>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setChildSeat1to4Count(
                                  Math.max(0, childSeat1to4Count - 1),
                                )
                              }
                              disabled={childSeat1to4Count === 0}
                            >
                              -
                            </Button>
                            <span className="min-w-[2rem] text-center">
                              {childSeat1to4Count}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setChildSeat1to4Count(
                                  Math.min(2, childSeat1to4Count + 1),
                                )
                              }
                              disabled={childSeat1to4Count === 2}
                            >
                              +
                            </Button>
                          </div>
                          <span className="font-medium">
                            {childSeat1to4Count > 0 && days
                              ? `${childSeat1to4Count * days * 3} EUR`
                              : "0 EUR"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {t("additionalFeatures.pricePerSeat")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Child Seat 5-12 years */}
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-start space-x-2">
                      <div className="flex-1">
                        <Label className="text-sm font-medium">
                          {t("additionalFeatures.childSeat5to12")}
                        </Label>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setChildSeat5to12Count(
                                  Math.max(0, childSeat5to12Count - 1),
                                )
                              }
                              disabled={childSeat5to12Count === 0}
                            >
                              -
                            </Button>
                            <span className="min-w-[2rem] text-center">
                              {childSeat5to12Count}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setChildSeat5to12Count(
                                  Math.min(2, childSeat5to12Count + 1),
                                )
                              }
                              disabled={childSeat5to12Count === 2}
                            >
                              +
                            </Button>
                          </div>
                          <span className="font-medium">
                            {childSeat5to12Count > 0 && days
                              ? `${childSeat5to12Count * days * 3} EUR`
                              : "0 EUR"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {t("additionalFeatures.pricePerSeat")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Extra Kilometers */}
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-start space-x-2">
                      <div className="flex-1">
                        <Label className="text-sm font-medium">
                          {t("additionalFeatures.extraKilometersPackages")}
                        </Label>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setExtraKilometersCount(
                                  Math.max(0, extraKilometersCount - 1),
                                )
                              }
                              disabled={extraKilometersCount === 0}
                            >
                              -
                            </Button>
                            <span className="min-w-[2rem] text-center">
                              {extraKilometersCount}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setExtraKilometersCount(
                                  Math.min(100, extraKilometersCount + 1),
                                )
                              }
                              disabled={extraKilometersCount === 100}
                            >
                              +
                            </Button>
                          </div>
                          <span className="font-medium">
                            {extraKilometersCount > 0
                              ? `${extraKilometersCount * additional50kmPrice} EUR`
                              : "0 EUR"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {t("additionalFeatures.extraKmDescription", {
                            price: additional50kmPrice,
                          })}
                          {days && (
                            <div className="mt-1">
                              {t("additionalFeatures.baseKilometersIncluded", {
                                km: calculateIncludedKilometers(days),
                                days: days,
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Personal Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>{t("personalInfo.title")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!user && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 mb-3">
                        {t("personalInfo.signInPrompt")}
                      </p>
                      <SignInButton mode="modal">
                        <Button variant="outline" size="sm" className="w-full">
                          {t("personalInfo.signInButton")}
                        </Button>
                      </SignInButton>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="customer-name" className="pb-2">
                        {t("personalInfo.fullName")}
                      </Label>
                      <Input
                        id="customer-name"
                        type="text"
                        placeholder={t("personalInfo.fullNamePlaceholder")}
                        value={personalInfo.name}
                        onChange={(e) =>
                          setPersonalInfo((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className={cn(
                          errors.personalInfo?.name && "border-red-500",
                        )}
                      />
                      {errors.personalInfo?.name && (
                        <p className="text-sm text-red-500 mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.personalInfo.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="customer-email" className="pb-2">
                        {t("personalInfo.emailAddress")}
                      </Label>
                      <Input
                        id="customer-email"
                        type="email"
                        placeholder={t("personalInfo.emailPlaceholder")}
                        value={personalInfo.email}
                        onChange={(e) =>
                          setPersonalInfo((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className={cn(
                          errors.personalInfo?.email && "border-red-500",
                        )}
                      />
                      {errors.personalInfo?.email && (
                        <p className="text-sm text-red-500 mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.personalInfo.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="customer-phone" className="pb-2">
                        {t("personalInfo.phoneNumber")}
                      </Label>
                      <Input
                        id="customer-phone"
                        type="tel"
                        placeholder="+40 123 456 789 or +44 20 7946 0958"
                        value={personalInfo.phone}
                        onChange={(e) =>
                          setPersonalInfo((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className={cn(
                          errors.personalInfo?.phone && "border-red-500",
                        )}
                      />
                      {errors.personalInfo?.phone && (
                        <p className="text-sm text-red-500 mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.personalInfo.phone}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("personalInfo.phoneFormat")}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="customer-flight" className="pb-2">
                        {t("personalInfo.flightNumber")}
                      </Label>
                      <Input
                        id="customer-flight"
                        type="text"
                        placeholder={t("personalInfo.flightPlaceholder")}
                        value={personalInfo.flightNumber}
                        onChange={(e) => {
                          setPersonalInfo((prev) => ({
                            ...prev,
                            flightNumber: e.target.value,
                          }));
                        }}
                        className={cn(
                          errors.personalInfo?.flightNumber && "border-red-500",
                        )}
                      />
                      {errors.personalInfo?.flightNumber && (
                        <p className="text-sm text-red-500 mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.personalInfo.flightNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="customer-message" className="pb-2">
                        {t("personalInfo.additionalMessage")}
                      </Label>
                      <Textarea
                        id="customer-message"
                        placeholder={t("personalInfo.messagePlaceholder")}
                        value={personalInfo.message}
                        onChange={(e) =>
                          setPersonalInfo((prev) => ({
                            ...prev,
                            message: e.target.value,
                          }))
                        }
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>{t("paymentMethod.title")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
                  >
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`flex items-start space-x-3 ${method.disabled ? "opacity-50" : ""}`}
                      >
                        <RadioGroupItem
                          value={method.id}
                          id={method.id}
                          className="mt-1"
                          disabled={method.disabled}
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={method.id}
                            className={`${method.disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            <div className="font-medium">{method.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {method.description}
                            </div>
                          </Label>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>

                  {errors.payment?.method && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.payment.method}
                    </p>
                  )}

                  <div className="pt-4 border-t">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms-conditions"
                        checked={termsAccepted}
                        onCheckedChange={(checked) =>
                          setTermsAccepted(checked === true)
                        }
                      />
                      <div className="text-sm cursor-pointer leading-relaxed">
                        {locale === "ro" ? (
                          <>
                            Accept{" "}
                            <Link
                              href="/terms"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 underline"
                            >
                              Termenii și Condițiile
                            </Link>{" "}
                            și{" "}
                            <Link
                              href="/privacy"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 underline"
                            >
                              Politica de Confidențialitate
                            </Link>
                          </>
                        ) : (
                          <>
                            I accept the{" "}
                            <Link
                              href="/terms"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 underline"
                            >
                              Terms and Conditions
                            </Link>{" "}
                            and{" "}
                            <Link
                              href="/privacy"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 underline"
                            >
                              Privacy Policy
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                    {errors.payment?.termsAccepted && (
                      <p className="text-sm text-red-500 mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.payment.termsAccepted}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reservation Summary Card - Full Width */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>{t("reservationSummary.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary Details */}
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-muted-foreground">
                    {t("reservationSummary.vehicle")}:
                  </span>
                  <span>
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-muted-foreground">
                    {t("reservationSummary.pickup")}:
                  </span>
                  <span>
                    {deliveryLocation || t("reservationSummary.notSelected")}
                  </span>
                </div>

                {pickupDate && pickupTime && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium text-muted-foreground">
                      {t("reservationSummary.pickupDate")}:
                    </span>
                    <span>
                      {pickupDate.toLocaleDateString(locale)} at {pickupTime}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-muted-foreground">
                    {t("reservationSummary.return")}:
                  </span>
                  <span>
                    {restitutionLocation || t("reservationSummary.notSelected")}
                  </span>
                </div>

                {returnDate && returnTime && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium text-muted-foreground">
                      {t("reservationSummary.returnDate")}:
                    </span>
                    <span>
                      {returnDate.toLocaleDateString(locale)} at {returnTime}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-muted-foreground">
                    {t("reservationSummary.duration")}:
                  </span>
                  <span>
                    {days
                      ? t("reservationSummary.daysCount", {
                          days,
                          plural:
                            locale === "ro"
                              ? days === 1
                                ? ""
                                : "le"
                              : days === 1
                                ? ""
                                : "s",
                        })
                      : t("reservationSummary.notCalculated")}
                  </span>
                </div>

                {days && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium text-muted-foreground">
                      {t("reservationSummary.totalKilometers")}:
                    </span>
                    <span>
                      {calculateIncludedKilometers(days) +
                        extraKilometersCount * 50}{" "}
                      km
                    </span>
                  </div>
                )}

                {personalInfo.flightNumber && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium text-muted-foreground">
                      {t("reservationSummary.flight")}:
                    </span>
                    <span>{personalInfo.flightNumber}</span>
                  </div>
                )}
              </div>

              {/* Protection Toggle */}
              <div className="border-t pt-4 space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    {t("protectionOptions.title")}
                  </h4>
                  <div className="p-3 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Label className="font-medium">
                          {isSCDWSelected
                            ? t("protectionOptions.scdwInsurance")
                            : t("protectionOptions.standardWarranty")}
                        </Label>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">
                                {t("protectionOptions.title")}
                              </h4>
                              <div className="text-xs text-muted-foreground space-y-2">
                                <div>
                                  <p className="font-medium">
                                    {t("protectionOptions.warrantyDefault")}:
                                  </p>
                                  <p>
                                    • {t("protectionOptions.refundableDeposit")}
                                  </p>
                                  <p>
                                    • {t("protectionOptions.returnedEndRental")}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {t("protectionOptions.scdwInsurance")}:
                                  </p>
                                  <p>
                                    {t(
                                      "protectionOptions.superCollisionDamageWaiver",
                                    )}
                                  </p>
                                  <p>
                                    {t(
                                      "protectionOptions.nonRefundableButProvidesAdditionalProtection",
                                    )}
                                  </p>
                                  <p>
                                    {t("protectionOptions.noDepositRequired")}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      <p className="text-sm font-medium">
                        {isSCDWSelected
                          ? `${scdwPrice || 0} EUR `
                          : `${warrantyAmount || 0} EUR `}
                      </p>
                    </div>

                    <div className="flex items-center justify-center space-x-4">
                      <Label
                        className={`text-sm font-medium ${!isSCDWSelected ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {t("protectionOptions.standardWarranty")}
                      </Label>
                      <Switch
                        id="protection-toggle"
                        checked={isSCDWSelected}
                        onCheckedChange={(checked) =>
                          setIsSCDWSelected(checked)
                        }
                      />
                      <Label
                        className={`text-sm font-medium ${isSCDWSelected ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {t("protectionOptions.scdw")}
                      </Label>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                      {isSCDWSelected
                        ? t("protectionOptions.nonRefundableInsurance")
                        : t("protectionOptions.refundableIfNoDamages")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {t("reservationSummary.basePrice", {
                      days: days || 0,
                      plural:
                        locale === "ro"
                          ? days === 1
                            ? ""
                            : "le"
                          : days === 1
                            ? ""
                            : "s",
                    })}
                    :
                  </span>
                  <span>{basePrice || 0} EUR</span>
                </div>

                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{t("reservationSummary.pickupLocationFee")}:</span>
                    <span>{deliveryFee} EUR</span>
                  </div>
                )}

                {returnFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{t("reservationSummary.returnLocationFee")}:</span>
                    <span>{returnFee} EUR</span>
                  </div>
                )}

                {totalLocationFees > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground/60">
                    <span>{t("reservationSummary.totalLocationFees")}:</span>
                    <span>{totalLocationFees} EUR</span>
                  </div>
                )}

                {isSCDWSelected && scdwPrice > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{t("protectionOptions.scdwInsurance")}:</span>
                    <span>{scdwPrice} EUR</span>
                  </div>
                )}

                {snowChainsSelected && snowChainsPrice > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{t("additionalFeatures.snowChains")}:</span>
                    <span>{snowChainsPrice} EUR</span>
                  </div>
                )}

                {childSeat1to4Count > 0 && childSeat1to4Price > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{t("additionalFeatures.childSeat1to4")}:</span>
                    <span>{childSeat1to4Price} EUR</span>
                  </div>
                )}

                {childSeat5to12Count > 0 && childSeat5to12Price > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{t("additionalFeatures.childSeat5to12")}:</span>
                    <span>{childSeat5to12Price} EUR</span>
                  </div>
                )}

                {extraKilometersCount > 0 &&
                  (extraKilometersPrice || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>{t("additionalFeatures.extraKilometers")}:</span>
                      <span>{extraKilometersPrice || 0} EUR</span>
                    </div>
                  )}

                {totalAdditionalFeatures > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground/60">
                    <span>
                      {t("reservationSummary.totalAdditionalFeatures")}:
                    </span>
                    <span>{totalAdditionalFeatures} EUR</span>
                  </div>
                )}

                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>{t("reservationSummary.totalPrice")}:</span>
                    <span className="text-green-600">
                      {totalPrice || 0} EUR
                      {!isSCDWSelected &&
                        warrantyAmount &&
                        warrantyAmount > 0 && (
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            + {warrantyAmount} EUR{" "}
                            {t("reservationSummary.warranty")}
                          </span>
                        )}
                    </span>
                  </div>
                  {!isSCDWSelected && warrantyAmount && warrantyAmount > 0 && (
                    <div className="text-right text-xs text-muted-foreground mt-1">
                      {t("reservationSummary.warrantyRefundable")}
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleSendReservation}
                size="lg"
                className="w-full bg-[#055E3B] hover:bg-[#055E3B]/80 text-white font-bold py-4 text-lg"
                disabled={isSubmitting}
              >
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting
                  ? t("reservationSummary.processing")
                  : t("reservationSummary.sendReservationRequest")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ReservationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReservationPageContent />
    </Suspense>
  );
}
