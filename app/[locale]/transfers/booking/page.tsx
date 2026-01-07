"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft, Loader2, AlertCircle, User, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { transferStorage, TransferSearchData } from "@/lib/transferStorage";
import { TransferSummaryCard } from "@/components/transfer/transfer-summary-card";
import { calculateTransferPrice } from "@/components/transfer/transfer-vehicle-card";

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

const paymentMethods = [
  {
    id: "cash_on_delivery",
    label: "Cash on delivery",
    description: "Pay cash when the driver arrives",
  },
  {
    id: "card_on_delivery",
    label: "Card payment on delivery",
    description: "Pay with card when the driver arrives",
  },
  {
    id: "card_online",
    label: "Card payment online",
    description: "Pay now with your card",
    disabled: true,
  },
];

const DEFAULT_BASE_FARE = 25;
const DEFAULT_PRICE_PER_KM = 1.2;

export default function TransferBookingPage() {
  const router = useRouter();
  const { user } = useUser();
  const t = useTranslations("transferPage");
  const tReservation = useTranslations("reservationPage");

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
  const [paymentMethod, setPaymentMethod] = React.useState<string>("");
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});

  const currentUser = useQuery(api.users.get);
  const createTransfer = useMutation(api.transfers.createTransfer);

  const vehicleId = searchData?.selectedVehicleId as Id<"vehicles"> | undefined;
  const vehicle = useQuery(
    api.vehicles.getById,
    vehicleId ? { id: vehicleId } : "skip"
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
      !vehicleId
    ) {
      toast.error("Missing required transfer information");
      return;
    }

    setIsSubmitting(true);

    try {
      const pricePerKm = vehicle?.transferPricePerKm || DEFAULT_PRICE_PER_KM;
      const distanceKm = searchData.distanceKm || 0;
      const transferType = searchData.transferType || "one_way";
      const pricing = calculateTransferPrice(
        pricePerKm,
        distanceKm,
        transferType,
        DEFAULT_BASE_FARE
      );

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
        distancePrice: pricing.distancePrice,
        totalPrice: pricing.totalPrice,
        pricePerKm: pricePerKm,
        customerInfo: {
          name: personalInfo.name,
          email: personalInfo.email,
          phone: personalInfo.phone,
          message: personalInfo.message || undefined,
          flightNumber: personalInfo.flightNumber || undefined,
        },
        paymentMethod: paymentMethod as
          | "cash_on_delivery"
          | "card_on_delivery"
          | "card_online",
      });

      transferStorage.clear();

      toast.success("Transfer booked successfully!", {
        description: `Your transfer #${result.transferNumber} has been confirmed.`,
      });

      router.push(`/transfers/confirmation/${result.transferId}`);
    } catch (error) {
      console.error("Failed to create transfer:", error);
      toast.error("Failed to book transfer", {
        description: "Please try again or contact support.",
      });
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

  const pricePerKm = vehicle?.transferPricePerKm || DEFAULT_PRICE_PER_KM;
  const distanceKm = searchData.distanceKm || 0;
  const transferType = searchData.transferType || "one_way";
  const pricing = calculateTransferPrice(
    pricePerKm,
    distanceKm,
    transferType,
    DEFAULT_BASE_FARE
  );

  return (
    <div className="container mx-auto px-4 lg:px-0 py-8 max-w-4xl">
      <Button variant="ghost" onClick={handleBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Vehicle Selection
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="text-center lg:text-left mb-6">
            <h1 className="text-3xl font-bold">{t("booking.title")}</h1>
            <p className="text-muted-foreground mt-1">
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
                <div>
                  <Label htmlFor="name" className="mb-2">
                    {tReservation("personalInfo.fullName")} *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={tReservation("personalInfo.fullNamePlaceholder")}
                    value={personalInfo.name}
                    onChange={(e) =>
                      setPersonalInfo((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className={cn(errors.name && "border-red-500")}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="mb-2">
                    {tReservation("personalInfo.emailAddress")} *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={tReservation("personalInfo.emailPlaceholder")}
                    value={personalInfo.email}
                    onChange={(e) =>
                      setPersonalInfo((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className={cn(errors.email && "border-red-500")}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="mb-2">
                    {tReservation("personalInfo.phoneNumber")} *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={tReservation("personalInfo.phonePlaceholder")}
                    value={personalInfo.phone}
                    onChange={(e) =>
                      setPersonalInfo((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className={cn(errors.phone && "border-red-500")}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="flightNumber" className="mb-2">
                    {tReservation("personalInfo.flightNumber")}
                  </Label>
                  <Input
                    id="flightNumber"
                    type="text"
                    placeholder={tReservation("personalInfo.flightPlaceholder")}
                    value={personalInfo.flightNumber}
                    onChange={(e) =>
                      setPersonalInfo((prev) => ({
                        ...prev,
                        flightNumber: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="mb-2">
                    {tReservation("personalInfo.additionalMessage")}
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

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t("booking.paymentMethod")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      htmlFor={method.id}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors",
                        paymentMethod === method.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50",
                        method.disabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <RadioGroupItem
                        value={method.id}
                        id={method.id}
                        disabled={method.disabled}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={method.id}
                          className="font-medium cursor-pointer"
                        >
                          {method.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {method.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
                {errors.paymentMethod && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.paymentMethod}
                  </p>
                )}

                <div className="flex items-start space-x-3 pt-4">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) =>
                      setTermsAccepted(checked as boolean)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="terms"
                      className="text-sm font-normal cursor-pointer"
                    >
                      {tReservation("paymentMethod.termsAcceptance")}
                    </Label>
                    {errors.termsAccepted && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.termsAccepted}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              size="lg"
              className="w-full"
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
              pricing={{
                ...pricing,
                pricePerKm,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
