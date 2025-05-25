"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ArrowLeft, Calendar, MapPin, Send, User, CreditCard, AlertCircle, Info } from "lucide-react";
import { LocationPicker, getLocationPrice } from "@/components/LocationPicker";
import { DateTimePicker } from "@/components/DateTimePicker";
import { differenceInDays } from "date-fns";
import { searchStorage } from "@/lib/searchStorage";
import { useUser, SignInButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Payment method options
const paymentMethods = [
  { id: "cash_on_delivery", label: "Cash on delivery", description: "Pay when you pick up the vehicle" },
  { id: "card_on_delivery", label: "Card payment on delivery", description: "Pay with card when you pick up the vehicle" },
  { id: "card_online", label: "Card payment online", description: "Pay now with your card" }
];

// Form validation errors interface
interface FormErrors {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
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

export default function ReservationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  
  // Only get vehicleId from URL - all form data comes from localStorage
  const vehicleId = searchParams.get("vehicleId");
  
  // Rental details state
  const [deliveryLocation, setDeliveryLocation] = React.useState<string>("");
  const [pickupDate, setPickupDate] = React.useState<Date | undefined>(undefined);
  const [pickupTime, setPickupTime] = React.useState<string | null>(null);
  const [restitutionLocation, setRestitutionLocation] = React.useState<string>("");
  const [returnDate, setReturnDate] = React.useState<Date | undefined>(undefined);
  const [returnTime, setReturnTime] = React.useState<string | null>(null);
  
  // Personal information state
  const [personalInfo, setPersonalInfo] = React.useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = React.useState<string>("");
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [scdwSelected, setScdwSelected] = React.useState(false);
  
  // Form state
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Queries and mutations
  const currentUser = useQuery(api.users.get);
  const createReservationMutation = useMutation(api.reservations.createReservation);
  const ensureUserMutation = useMutation(api.users.ensureUser);

  // Load data from localStorage after hydration
  React.useEffect(() => {
    const storedData = searchStorage.load();
    
    // Only populate fields that exist in localStorage
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
        phone: prev.phone || currentUser.phone || ""
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
  }, [deliveryLocation, pickupDate, pickupTime, restitutionLocation, returnDate, returnTime, isHydrated]);

  const vehicle = useQuery(api.vehicles.getById, 
    vehicleId ? { id: vehicleId as Id<"vehicles"> } : "skip"
  );

  const imageUrl = useQuery(api.vehicles.getImageUrl, 
    vehicle?.mainImageId ? { imageId: vehicle.mainImageId } : "skip"
  );

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

  // Calculate pricing including location fees
  const calculateTotalPrice = () => {
    if (pickupDate && returnDate && vehicle?.pricePerDay) {
      const days = differenceInDays(returnDate, pickupDate);
      const calculatedDays = days === 0 ? 1 : days;
      const basePrice = calculatedDays * vehicle.pricePerDay;
      
      // Add location fees
      const deliveryFee = getLocationPrice(deliveryLocation);
      const returnFee = getLocationPrice(restitutionLocation);
      const totalLocationFees = deliveryFee + returnFee;
      
      // Add SCDW if selected
      const scdwPrice = scdwSelected ? calculateSCDW(calculatedDays, vehicle.pricePerDay) : 0;
      
      return { 
        basePrice,
        totalPrice: basePrice + totalLocationFees + scdwPrice, 
        days: calculatedDays,
        deliveryFee,
        returnFee,
        totalLocationFees,
        scdwPrice
      };
    }
    return { 
      basePrice: null, 
      totalPrice: null, 
      days: null, 
      deliveryFee: 0, 
      returnFee: 0, 
      totalLocationFees: 0,
      scdwPrice: 0
    };
  };

  const { basePrice, totalPrice, days, deliveryFee, returnFee, totalLocationFees, scdwPrice } = calculateTotalPrice();

  // Form validation
  const validateForm = (): FormErrors => {
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
  };

  // Handle reservation submission
  const handleSendReservation = async () => {
    const formErrors = validateForm();
    setErrors(formErrors);

    // Check if there are any errors
    const hasErrors = Object.keys(formErrors).some(key => 
      Object.keys(formErrors[key as keyof FormErrors] || {}).length > 0
    );

    if (hasErrors) {
      toast.error("Please fix the errors in the form before submitting.");
      return;
    }

    if (!vehicleId || !vehicle || !totalPrice || !pickupDate || !returnDate) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure user exists in the database (for Clerk authenticated users)
      if (user) {
        await ensureUserMutation({});
      }
      // Prepare additional charges for location fees and SCDW (core info is now in dedicated fields)
      const additionalCharges = [];
      
      // Add location fees as charges if they exist
      if (deliveryFee > 0) {
        additionalCharges.push({
          description: `Pick-up location fee (${deliveryLocation})`,
          amount: deliveryFee,
        });
      }
      
      if (returnFee > 0) {
        additionalCharges.push({
          description: `Return location fee (${restitutionLocation})`,
          amount: returnFee,
        });
      }
      
      // Add SCDW insurance if selected
      if (scdwSelected && scdwPrice > 0) {
        additionalCharges.push({
          description: "SCDW Insurance",
          amount: scdwPrice,
        });
      }

      // Get the Convex user ID (not the Clerk user ID)
      const convexUser = await ensureUserMutation({});
      
      const reservationId = await createReservationMutation({
        userId: convexUser._id,
        vehicleId: vehicleId as Id<"vehicles">,
        startDate: pickupDate.getTime(),
        endDate: returnDate.getTime(),
        pickupTime: pickupTime || "00:00",
        restitutionTime: returnTime || "00:00",
        pickupLocation: deliveryLocation.trim(),
        restitutionLocation: restitutionLocation.trim(),
        paymentMethod: paymentMethod as "cash_on_delivery" | "card_on_delivery" | "card_online",
        totalPrice: totalPrice,
        customerInfo: {
          name: personalInfo.name.trim(),
          email: personalInfo.email.trim(),
          phone: personalInfo.phone.trim(),
          message: personalInfo.message && personalInfo.message.trim() ? personalInfo.message.trim() : undefined,
        },
        promoCode: undefined, // TODO: Add promo code functionality
        additionalCharges: additionalCharges.length > 0 ? additionalCharges : undefined,
      });

      // Success notification
              toast("Reservation created successfully!", {
          description: "You will receive a confirmation email shortly.",
          action: {
            label: "View Reservation",
            onClick: () => router.push(`/reservation/confirmation?reservationId=${reservationId}`),
          },
        });
        console.log("Reservation created successfully!");
        
        // Clear localStorage and redirect
        searchStorage.clear();
        router.push(`/reservation/confirmation?reservationId=${reservationId}`);

    } catch (error) {
      console.error("Error creating reservation:", error);
      toast.error("Failed to create reservation. Please try again or contact support.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!vehicleId) {
    return (
      <div className="relative flex flex-col min-h-screen">
        <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid Reservation</h1>
            <p className="text-muted-foreground mb-6">No vehicle selected for reservation.</p>
            <Link href="/cars">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Browse Cars
              </Button>
            </Link>
          </div>
        </main>
        <Footer logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} brandName="" />
      </div>
    );
  }

  if (vehicle === undefined) {
    return (
      <div className="relative flex flex-col min-h-screen">
        <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground">Loading reservation details...</p>
        </main>
        <Footer logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} brandName="" />
      </div>
    );
  }

  if (vehicle === null) {
    return (
      <div className="relative flex flex-col min-h-screen">
        <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Vehicle Not Found</h1>
            <p className="text-muted-foreground mb-6">The selected vehicle is no longer available.</p>
            <Link href="/cars">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Browse Cars
              </Button>
            </Link>
          </div>
        </main>
        <Footer logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} brandName="" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen">
      <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href={`/cars/${vehicleId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Vehicle Details
              </Button>
            </Link>
          </div>

          {/* Interactive Rental Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Rental Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pickup Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Pick-up Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <LocationPicker
                        id="res-pickup-location"
                        label="Pick-up Location"
                        value={deliveryLocation}
                        onValueChange={setDeliveryLocation}
                        placeholder="Select pick-up location"
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
                        label="Pick-up Date & Time"
                        dateState={pickupDate}
                        setDateState={(date) => {
                          setPickupDate(date);
                          // Auto-adjust return date if needed
                          if (date && returnDate && date.getTime() > returnDate.getTime()) {
                            setReturnDate(date);
                          }
                        }}
                        timeState={pickupTime}
                        setTimeState={setPickupTime}
                        minDate={today}
                        isLoading={false}
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
                    Return Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <LocationPicker
                        id="res-return-location"
                        label="Return Location"
                        value={restitutionLocation}
                        onValueChange={setRestitutionLocation}
                        placeholder="Select return location"
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
                        label="Return Date & Time"
                        dateState={returnDate}
                        setDateState={(date) => {
                          if (date) {
                            if (pickupDate && date.getTime() < pickupDate.getTime()) {
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
                        disabledDateRanges={pickupDate ? { before: pickupDate } : { before: today }}
                        isLoading={!pickupDate}
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
                  <CardTitle>Vehicle Details</CardTitle>
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
                          No Image
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-muted-foreground">{vehicle.year}</p>
                      <p className="text-lg font-bold text-yellow-500">
                        {vehicle.pricePerDay} EUR / Day
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Personal Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {!user && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 mb-3">
                          Sign in to auto-fill your information and make booking easier!
                        </p>
                        <SignInButton mode="modal">
                          <Button variant="outline" size="sm" className="w-full">
                            Sign In / Sign Up
                          </Button>
                        </SignInButton>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="customer-name" className="pb-2">Full Name *</Label>
                        <Input
                          id="customer-name"
                          type="text"
                          placeholder="Enter your full name"
                          value={personalInfo.name}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, name: e.target.value }))}
                          className={cn(errors.personalInfo?.name && "border-red-500")}
                        />
                        {errors.personalInfo?.name && (
                          <p className="text-sm text-red-500 mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.personalInfo.name}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="customer-email" className="pb-2">Email Address *</Label>
                        <Input
                          id="customer-email"
                          type="email"
                          placeholder="Enter your email address"
                          value={personalInfo.email}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                          className={cn(errors.personalInfo?.email && "border-red-500")}
                        />
                        {errors.personalInfo?.email && (
                          <p className="text-sm text-red-500 mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.personalInfo.email}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="customer-phone" className="pb-2">Phone Number *</Label>
                        <Input
                          id="customer-phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={personalInfo.phone}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                          className={cn(errors.personalInfo?.phone && "border-red-500")}
                        />
                        {errors.personalInfo?.phone && (
                          <p className="text-sm text-red-500 mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.personalInfo.phone}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="customer-message" className="pb-2">Additional Message (Optional)</Label>
                        <Textarea
                          id="customer-message"
                          placeholder="Any special requests or additional information..."
                          value={personalInfo.message}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, message: e.target.value }))}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Payment Method Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment Method</span>
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
                        <div key={method.id} className="flex items-start space-x-3">
                          <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor={method.id} className="cursor-pointer">
                              <div className="font-medium">{method.label}</div>
                              <div className="text-sm text-muted-foreground">{method.description}</div>
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
                          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                        />
                        <Label htmlFor="terms-conditions" className="text-sm cursor-pointer">
                          I accept the{" "}
                          <Link href="/terms-and-conditions" className="text-blue-600 hover:underline" target="_blank">
                            Terms and Conditions
                          </Link>
                          {" "}and{" "}
                          <Link href="/privacy-policy" className="text-blue-600 hover:underline" target="_blank">
                            Privacy Policy
                          </Link>
                        </Label>
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

              {/* Reservation Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="h-5 w-5" />
                    <span>Reservation Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Summary Details */}
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <span className="font-medium text-muted-foreground">Vehicle:</span>
                        <span>{vehicle.make} {vehicle.model} ({vehicle.year})</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <span className="font-medium text-muted-foreground">Pick-up:</span>
                        <span>{deliveryLocation || "Not selected"}</span>
                      </div>
                      
                      {pickupDate && pickupTime && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-medium text-muted-foreground">Pick-up Date:</span>
                          <span>{pickupDate.toLocaleDateString()} at {pickupTime}</span>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2">
                        <span className="font-medium text-muted-foreground">Return:</span>
                        <span>{restitutionLocation || "Not selected"}</span>
                      </div>
                      
                      {returnDate && returnTime && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-medium text-muted-foreground">Return Date:</span>
                          <span>{returnDate.toLocaleDateString()} at {returnTime}</span>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2">
                        <span className="font-medium text-muted-foreground">Duration:</span>
                        <span>{days ? `${days} day${days === 1 ? "" : "s"}` : "Not calculated"}</span>
                      </div>
                    </div>

                    {/* Pricing Summary */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Base price ({days || 0} day{days === 1 ? "" : "s"}):</span>
                        <span>{basePrice || 0} EUR</span>
                      </div>
                      
                      {deliveryFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Pick-up location fee:</span>
                          <span>{deliveryFee} EUR</span>
                        </div>
                      )}
                      
                      {returnFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Return location fee:</span>
                          <span>{returnFee} EUR</span>
                        </div>
                      )}
                      
                      {totalLocationFees > 0 && (
                        <div className="flex justify-between text-sm text-muted-foreground/60">
                          <span>Total location fees:</span>
                          <span>{totalLocationFees} EUR</span>
                        </div>
                      )}
                      
                      {/* SCDW Insurance Option */}
                      <div className="border-t pt-3 space-y-3">
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="scdw-insurance"
                            checked={scdwSelected}
                            onCheckedChange={(checked) => setScdwSelected(checked === true)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-1">
                              <Label htmlFor="scdw-insurance" className="text-sm font-medium cursor-pointer">
                                SCDW Insurance
                              </Label>
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">SCDW Insurance Details</h4>
                                    <p className="text-xs text-muted-foreground">
                                      Super Collision Damage Waiver (SCDW) provides additional protection for your rental.
                                    </p>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      <p><strong>Calculation:</strong></p>
                                      <p>• Base cost: 2 × daily rate (covers 1-3 days)</p>
                                      <p>• For each 3-day block after first 3 days:</p>
                                      <p>  - First additional block: +6 EUR</p>
                                      <p>  - Each subsequent block: +5 EUR</p>
                                    </div>
                                    {days && vehicle?.pricePerDay && (
                                      <div className="text-xs border-t pt-2 mt-2">
                                        <p><strong>Your calculation:</strong></p>
                                        <p>Days: {days} | Daily rate: {vehicle.pricePerDay} EUR</p>
                                        <p>SCDW cost: {calculateSCDW(days, vehicle.pricePerDay)} EUR</p>
                                      </div>
                                    )}
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-muted-foreground">Additional protection coverage</span>
                              <span className="font-medium">
                                {days && vehicle?.pricePerDay ? `${calculateSCDW(days, vehicle.pricePerDay)} EUR` : '0 EUR'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total Price:</span>
                          <span className="text-green-600">{totalPrice || 0} EUR</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleSendReservation}
                      size="lg" 
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 text-lg"
                      disabled={isSubmitting}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Processing..." : "Complete Reservation"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer
        logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />}
        brandName=""
      />
    </div>
  );
} 