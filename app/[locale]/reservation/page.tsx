"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { searchStorage } from "@/lib/search-storage";
import { buildLegacyChargeDescriptions } from "@/lib/reservation-charges";
import { hasFormErrors } from "@/lib/reservation-schema";
import { useReservationForm } from "@/hooks/use-reservation-form";
import { useReservationPricing } from "@/hooks/use-reservation-pricing";
import { useDateBasedSeasonalPricing } from "@/hooks/use-date-based-seasonal-pricing";
import {
  RentalDetailsCard,
  VehicleSummaryCard,
  AdditionalFeaturesCard,
  PersonalInfoCard,
  PaymentMethodCard,
  ReservationSummaryCard,
} from "@/components/features/reservations";
import {
  CouponCodeInput,
  type AppliedCoupon,
} from "@/components/features/checkout/coupon-code-input";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

function ReservationPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("reservationPage");
  const tCoupon = useTranslations("common.coupon");
  const locale = useLocale();

  // Only get vehicleId from URL - all form data comes from localStorage
  const vehicleId = searchParams.get("vehicleId");

  // All form state, localStorage persistence, Clerk autofill and validation
  const {
    user,
    currentUser,
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
    personalInfo,
    setPersonalInfo,
    paymentMethod,
    setPaymentMethod,
    termsAccepted,
    setTermsAccepted,
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
    errors,
    setErrors,
    formProgress,
    validate,
  } = useReservationForm();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [appliedCoupon, setAppliedCoupon] =
    React.useState<AppliedCoupon | null>(null);

  // Add date-based seasonal pricing
  const { multiplier: seasonalMultiplier, seasonId } =
    useDateBasedSeasonalPricing(pickupDate, returnDate);

  const createReservationMutation = useMutation(
    api.reservations.createReservation,
  );

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

  // Single memoized pricing derivation (lib/pricing) — the summary UI and
  // the submit payload both read this one breakdown
  const pricing = useReservationPricing({
    vehicle,
    pickupDate,
    returnDate,
    pickupTime,
    returnTime,
    deliveryLocation,
    restitutionLocation,
    seasonalMultiplier,
    isSCDWSelected,
    snowChainsSelected,
    childSeat1to4Count,
    childSeat5to12Count,
    extraKilometersCount,
    additional50kmPrice,
  });
  const { breakdown } = pricing;

  // Handle reservation submission
  const handleSendReservation = async () => {
    const formErrors = validate();
    setErrors(formErrors);

    if (hasFormErrors(formErrors)) {
      toast.error(t("validation.formErrors"));
      return;
    }

    if (
      !vehicleId ||
      !vehicle ||
      !breakdown ||
      !breakdown.totalPrice ||
      !pickupDate ||
      !returnDate ||
      !paymentMethod
    ) {
      return;
    }

    if (breakdown.rentalDays <= 0) {
      toast.error(t("validation.invalidRentalDuration"));
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      // Localized prose duplicates of the coded charges — the server persists
      // its own recomputed coded charges; this array only feeds the email
      // templates until RNGO-19 lands their coded-charge catalog
      const additionalCharges = buildLegacyChargeDescriptions(
        breakdown.additionalCharges,
        t,
      );

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
        paymentMethod,
        totalPrice: breakdown.totalPrice,
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
        // The server re-validates and redeems the coupon atomically; the
        // client-shown discount is advisory only
        promoCode: appliedCoupon?.code,
        additionalCharges:
          additionalCharges.length > 0 ? additionalCharges : undefined,
        isSCDWSelected: isSCDWSelected,
        deductibleAmount: breakdown.deductibleAmount,
        protectionCost:
          breakdown.protectionCost > 0 ? breakdown.protectionCost : undefined,
        seasonId: seasonId as Id<"seasons"> | undefined,
        seasonalMultiplier: seasonalMultiplier,
        // Structured extras — the server recomputes and persists all coded
        // charges from these
        extras: {
          snowChains: snowChainsSelected,
          childSeat1to4: childSeat1to4Count,
          childSeat5to12: childSeat5to12Count,
          extraKilometers: extraKilometersCount * 50,
        },
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
      if (
        error instanceof ConvexError &&
        (error.data as { code?: string })?.code === "COUPON_INVALID"
      ) {
        toast.error(tCoupon("errors.submitFailed"));
      } else {
        toast.error(t("reservation.error"));
      }
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
    <div className="grow py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link href={`/cars/${vehicle?.slug || vehicleId}`}>
            <Button variant="outline" size="sm" className="rounded-xl">
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

        <RentalDetailsCard
          deliveryLocation={deliveryLocation}
          onDeliveryLocationChange={setDeliveryLocation}
          pickupDate={pickupDate}
          onPickupDateChange={handlePickupDateChange}
          pickupTime={pickupTime}
          onPickupTimeChange={setPickupTime}
          restitutionLocation={restitutionLocation}
          onRestitutionLocationChange={setRestitutionLocation}
          returnDate={returnDate}
          onReturnDateChange={handleReturnDateChange}
          returnTime={returnTime}
          onReturnTimeChange={setReturnTime}
          pickupCalendarOpen={pickupCalendarOpen}
          onPickupCalendarOpenChange={setPickupCalendarOpen}
          returnCalendarOpen={returnCalendarOpen}
          onReturnCalendarOpenChange={setReturnCalendarOpen}
          errors={errors.rentalDetails}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <VehicleSummaryCard
              vehicle={vehicle}
              imageUrl={imageUrl}
              displayPricePerDay={pricing.displayPricePerDay}
              days={breakdown?.rentalDays ?? null}
            />

            <AdditionalFeaturesCard
              days={breakdown?.rentalDays ?? null}
              additional50kmPrice={additional50kmPrice}
              snowChainsSelected={snowChainsSelected}
              onSnowChainsChange={setSnowChainsSelected}
              childSeat1to4Count={childSeat1to4Count}
              onChildSeat1to4CountChange={setChildSeat1to4Count}
              childSeat5to12Count={childSeat5to12Count}
              onChildSeat5to12CountChange={setChildSeat5to12Count}
              extraKilometersCount={extraKilometersCount}
              onExtraKilometersCountChange={setExtraKilometersCount}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <PersonalInfoCard
              personalInfo={personalInfo}
              onPersonalInfoChange={setPersonalInfo}
              errors={errors.personalInfo}
              isSignedIn={!!user}
            />

            <PaymentMethodCard
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              termsAccepted={termsAccepted}
              onTermsAcceptedChange={setTermsAccepted}
              errors={errors.payment}
            />
          </div>
        </div>

        <CouponCodeInput
          className="mt-8"
          bookingType="rentals"
          subtotal={breakdown?.totalPrice ?? null}
          email={personalInfo.email}
          onAppliedChange={setAppliedCoupon}
        />

        <ReservationSummaryCard
          vehicle={vehicle}
          deliveryLocation={deliveryLocation}
          restitutionLocation={restitutionLocation}
          pickupDate={pickupDate}
          pickupTime={pickupTime}
          returnDate={returnDate}
          returnTime={returnTime}
          flightNumber={personalInfo.flightNumber}
          snowChainsSelected={snowChainsSelected}
          childSeat1to4Count={childSeat1to4Count}
          childSeat5to12Count={childSeat5to12Count}
          extraKilometersCount={extraKilometersCount}
          isSCDWSelected={isSCDWSelected}
          onSCDWChange={setIsSCDWSelected}
          pricing={pricing}
          appliedCoupon={appliedCoupon}
          isSubmitting={isSubmitting}
          onSubmit={handleSendReservation}
        />
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
