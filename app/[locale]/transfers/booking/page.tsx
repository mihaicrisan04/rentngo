"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft, Loader2, AlertCircle, User, CreditCard, Info, Luggage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { transferStorage, TransferSearchData } from "@/lib/transfer-storage";
import { TransferSummaryCard } from "@/components/features/transfers/transfer-summary-card";
import { CheckoutPaymentMethods } from "@/components/features/checkout/checkout-payment-methods";
import { TermsAcceptance } from "@/components/features/checkout/terms-acceptance";
import {
  ContactFields,
  type ContactFieldValues,
} from "@/components/features/checkout/contact-fields";
import {
  CouponCodeInput,
  type AppliedCoupon,
} from "@/components/features/checkout/coupon-code-input";
import type { PaymentMethod } from "@/lib/checkout-payment-methods";
import { ConvexError } from "convex/values";

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  message: string;
  flightNumber: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  paymentMethod?: string;
  termsAccepted?: string;
}

export default function TransferBookingPage() {
  const router = useRouter();
  const { user } = useUser();
  const t = useTranslations("transferPage");
  const tReservation = useTranslations("reservationPage");
  const tCoupon = useTranslations("common.coupon");
  const locale = useLocale();

  const [searchData, setSearchData] = React.useState<TransferSearchData | null>(null);
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [personalInfo, setPersonalInfo] = React.useState<PersonalInfo>({
    name: "",
    email: "",
    phone: "",
    message: "",
    flightNumber: "",
  });
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod | "">(
    "",
  );
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [luggageCount, setLuggageCount] = React.useState<number>(0);
  const [appliedCoupon, setAppliedCoupon] =
    React.useState<AppliedCoupon | null>(null);

  const currentUser = useQuery(api.users.get);
  const createTransfer = useMutation(api.transfers.createTransfer);

  const vehicleId = searchData?.selectedVehicleId as Id<"vehicles"> | undefined;
  const vehicle = useQuery(
    api.vehicles.getById,
    vehicleId ? { id: vehicleId } : "skip"
  );

  const distanceKm = searchData?.distanceKm ?? 0;
  const transferType = searchData?.transferType ?? "one_way";

  // Use server-side pricing calculation by vehicleId
  const pricing = useQuery(
    api.transferPricing.calculateTransferPriceByVehicle,
    vehicleId && isHydrated && searchData
      ? {
          distanceKm,
          vehicleId,
          transferType,
        }
      : "skip"
  );

  React.useEffect(() => {
    const stored = transferStorage.load();
    setSearchData(stored);
    setIsHydrated(true);
  }, []);

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
      }));
    }
  }, [user, currentUser, isHydrated]);

  const handleBack = () => {
    router.push("/transfers/vehicles");
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!personalInfo.name.trim()) {
      newErrors.name = tReservation("validation.nameRequired");
    }

    if (!personalInfo.email.trim()) {
      newErrors.email = tReservation("validation.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!personalInfo.phone.trim()) {
      newErrors.phone = tReservation("validation.phoneRequired");
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = tReservation("validation.paymentMethodRequired");
    }

    if (!termsAccepted) {
      newErrors.termsAccepted = tReservation("validation.termsAcceptanceRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(tReservation("validation.formErrors"));
      return;
    }

    if (
      !searchData?.pickupLocation ||
      !searchData?.dropoffLocation ||
      !searchData?.pickupDate ||
      !searchData?.pickupTime ||
      !vehicleId ||
      !pricing ||
      !paymentMethod
    ) {
      toast.error("Missing required transfer information");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createTransfer({
        userId: currentUser?._id,
        vehicleId: vehicleId,
        transferType: transferType,
        pickupLocation: searchData.pickupLocation,
        pickupDate: searchData.pickupDate.getTime(),
        pickupTime: searchData.pickupTime,
        dropoffLocation: searchData.dropoffLocation,
        returnDate:
          transferType === "round_trip" && searchData.returnDate
            ? searchData.returnDate.getTime()
            : undefined,
        returnTime:
          transferType === "round_trip" ? searchData.returnTime || undefined : undefined,
        passengers: searchData.passengers || 1,
        distanceKm: distanceKm,
        estimatedDurationMinutes: searchData.estimatedDurationMinutes || 0,
        baseFare: pricing.baseFare,
        distancePrice: pricing.distanceCharge,
        totalPrice: pricing.totalPrice,
        pricePerKm: pricing.tierPricePerKm,
        customerInfo: {
          name: personalInfo.name,
          email: personalInfo.email,
          phone: personalInfo.phone,
          message: personalInfo.message || undefined,
          flightNumber: personalInfo.flightNumber || undefined,
        },
        paymentMethod,
        luggageCount: luggageCount > 0 ? luggageCount : undefined,
        // Re-validated and redeemed server-side; the shown discount is advisory
        promoCode: appliedCoupon?.code,
        locale,
      });

      transferStorage.clear();

      toast.success("Transfer booked successfully!", {
        description: `Your transfer #${result.transferNumber} has been confirmed.`,
      });

      router.push(`/transfers/confirmation/${result.transferId}`);
    } catch (error) {
      console.error("Failed to create transfer:", error);
      if (
        error instanceof ConvexError &&
        (error.data as { code?: string })?.code === "COUPON_INVALID"
      ) {
        toast.error(tCoupon("errors.submitFailed"));
      } else {
        toast.error("Failed to book transfer", {
          description: "Please try again or contact support.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (
    !searchData?.pickupLocation ||
    !searchData?.dropoffLocation ||
    !searchData?.pickupDate ||
    !searchData?.pickupTime ||
    !searchData?.selectedVehicleId
  ) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-4">Missing Transfer Details</h2>
          <p className="text-muted-foreground mb-6">
            Please complete the transfer search and vehicle selection first.
          </p>
          <Button onClick={() => router.push("/transfers")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state while pricing is being calculated
  const totalPrice = pricing?.totalPrice ?? 0;

  return (
    <div className="container mx-auto px-4 lg:px-0 py-10 max-w-4xl">
      <Button variant="ghost" onClick={handleBack} className="mb-6 rounded-xl">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Vehicle Selection
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="text-center lg:text-left mb-6">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t("booking.title")}</h1>
            <p className="text-muted-foreground mt-2">
              Complete your booking details below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t("booking.personalInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ContactFields
                  values={personalInfo}
                  onChange={(field: keyof ContactFieldValues, value) =>
                    setPersonalInfo((prev) => ({ ...prev, [field]: value }))
                  }
                  errors={{
                    name: errors.name,
                    email: errors.email,
                    phone: errors.phone,
                  }}
                  showRequiredMarkers
                />

                <div>
                  <Label htmlFor="luggage" className="mb-2 flex items-center gap-1">
                    <Luggage className="h-4 w-4" />
                    Luggage Count
                  </Label>
                  <Input
                    id="luggage"
                    type="number"
                    min={0}
                    max={20}
                    placeholder="Number of medium-size bags"
                    value={luggageCount === 0 ? "" : luggageCount.toString()}
                    onChange={(e) => setLuggageCount(parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Approximate number of medium-size airport luggage
                  </p>
                </div>

                <div>
                  <Label htmlFor="message" className="mb-2 flex items-center gap-2">
                    {tReservation("personalInfo.additionalMessage")}
                    <span className="relative group">
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                        Add any special requests: stops along the way, waiting for someone, specific pickup instructions, etc.
                      </span>
                    </span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder={tReservation("personalInfo.messagePlaceholder")}
                    value={personalInfo.message}
                    onChange={(e) =>
                      setPersonalInfo((prev) => ({ ...prev, message: e.target.value }))
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <CouponCodeInput
              bookingType="transfers"
              subtotal={pricing?.totalPrice ?? null}
              email={personalInfo.email}
              onAppliedChange={setAppliedCoupon}
            />

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t("booking.paymentMethod")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CheckoutPaymentMethods
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  error={errors.paymentMethod}
                  variant="bordered"
                />

                <TermsAcceptance
                  checked={termsAccepted}
                  onCheckedChange={setTermsAccepted}
                  error={errors.termsAccepted}
                />
              </CardContent>
            </Card>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-xl h-13 text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("booking.processing")}
                </>
              ) : (
                t("booking.confirmBooking")
              )}
            </Button>
          </form>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <TransferSummaryCard
              pickupCoordinates={searchData.pickupLocation.coordinates}
              dropoffCoordinates={searchData.dropoffLocation.coordinates}
              pickupLocation={searchData.pickupLocation}
              dropoffLocation={searchData.dropoffLocation}
              pickupDate={searchData.pickupDate}
              pickupTime={searchData.pickupTime}
              returnDate={searchData.returnDate}
              returnTime={searchData.returnTime || undefined}
              transferType={transferType}
              passengers={searchData.passengers || 1}
              distanceKm={distanceKm}
              estimatedDurationMinutes={searchData.estimatedDurationMinutes || 0}
              vehicle={
                vehicle
                  ? {
                      make: vehicle.make,
                      model: vehicle.model,
                      year: vehicle.year,
                    }
                  : null
              }
              totalPrice={totalPrice}
              appliedCoupon={appliedCoupon}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
