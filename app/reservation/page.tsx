"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { ArrowLeft, Calendar, MapPin, Send } from "lucide-react";
import { LocationPicker } from "@/components/LocationPicker";
import { DateTimePicker } from "@/components/DateTimePicker";
import { differenceInDays } from "date-fns";

export default function ReservationPage() {
  const searchParams = useSearchParams();
  
  // Get all the parameters from the URL
  const vehicleId = searchParams.get("vehicleId");
  const [deliveryLocation, setDeliveryLocation] = React.useState(searchParams.get("deliveryLocation") || "");
  const [pickupDateParam, setPickupDateParam] = React.useState(searchParams.get("pickupDate"));
  const [pickupTime, setPickupTime] = React.useState(searchParams.get("pickupTime") || "");
  const [restitutionLocation, setRestitutionLocation] = React.useState(searchParams.get("restitutionLocation") || "");
  const [returnDateParam, setReturnDateParam] = React.useState(searchParams.get("returnDate"));
  const [returnTime, setReturnTime] = React.useState(searchParams.get("returnTime") || "");

  const pickupDate = pickupDateParam ? new Date(parseInt(pickupDateParam) * 1000) : null;
  const returnDate = returnDateParam ? new Date(parseInt(returnDateParam) * 1000) : null;

  const vehicle = useQuery(api.vehicles.getById, 
    vehicleId ? { id: vehicleId as Id<"vehicles"> } : "skip"
  );

  const imageUrl = useQuery(api.vehicles.getImageUrl, 
    vehicle?.mainImageId ? { imageId: vehicle.mainImageId } : "skip"
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate pricing
  const calculateTotalPrice = () => {
    if (pickupDate && returnDate && vehicle?.pricePerDay) {
      const days = differenceInDays(returnDate, pickupDate);
      const calculatedDays = days === 0 ? 1 : days;
      return { totalPrice: calculatedDays * vehicle.pricePerDay, days: calculatedDays };
    }
    return { totalPrice: null, days: null };
  };

  const { totalPrice, days } = calculateTotalPrice();

  // Handle reservation submission
  const handleSendReservation = () => {
    const reservationDetails = {
      vehicleId,
      vehicle: vehicle ? {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        pricePerDay: vehicle.pricePerDay
      } : null,
      deliveryLocation,
      pickupDate: pickupDate?.toISOString(),
      pickupTime,
      restitutionLocation,
      returnDate: returnDate?.toISOString(),
      returnTime,
      totalPrice,
      days,
      currency: "EUR"
    };
    
    console.log("Reservation Details:", reservationDetails);
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
                    <LocationPicker
                      id="res-pickup-location"
                      label="Pick-up Location"
                      value={deliveryLocation}
                      onValueChange={setDeliveryLocation}
                      placeholder="Select pick-up location"
                      disabled={false}
                    />
                    <DateTimePicker
                      id="res-pickup-datetime"
                      label="Pick-up Date & Time"
                      dateState={pickupDate || undefined}
                      setDateState={(date) => {
                        if (date) {
                          setPickupDateParam(Math.floor(date.getTime() / 1000).toString());
                          // Auto-adjust return date if needed
                          if (returnDate && date.getTime() > returnDate.getTime()) {
                            setReturnDateParam(Math.floor(date.getTime() / 1000).toString());
                          }
                        } else {
                          setPickupDateParam(null);
                        }
                      }}
                      timeState={pickupTime}
                      setTimeState={setPickupTime}
                      minDate={today}
                      isLoading={false}
                    />
                  </div>
                </div>

                {/* Return Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Return Details
                  </h4>
                  <div className="space-y-4">
                    <LocationPicker
                      id="res-return-location"
                      label="Return Location"
                      value={restitutionLocation}
                      onValueChange={setRestitutionLocation}
                      placeholder="Select return location"
                      disabled={false}
                    />
                    <DateTimePicker
                      id="res-return-datetime"
                      label="Return Date & Time"
                      dateState={returnDate || undefined}
                      setDateState={(date) => {
                        if (date) {
                          if (pickupDate && date.getTime() < pickupDate.getTime()) {
                            setReturnDateParam(Math.floor(pickupDate.getTime() / 1000).toString());
                          } else {
                            setReturnDateParam(Math.floor(date.getTime() / 1000).toString());
                          }
                        } else {
                          setReturnDateParam(null);
                        }
                      }}
                      timeState={returnTime}
                      setTimeState={setReturnTime}
                      minDate={pickupDate || today}
                      disabledDateRanges={pickupDate ? { before: pickupDate } : { before: today }}
                      isLoading={!pickupDate}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vehicle Summary */}
            <div className="space-y-6">
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
            </div>

            {/* Booking Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Reservation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-muted rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Reservation System</h3>
                      <p className="text-muted-foreground mb-4">
                        This is a demo reservation page. In a real application, this would include:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 text-left max-w-md mx-auto">
                        <li>• Customer information form</li>
                        <li>• Payment processing</li>
                        <li>• Terms and conditions</li>
                        <li>• Confirmation email</li>
                        <li>• Booking management</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <div className="flex space-x-2">
                        <Link href={`/cars/${vehicleId}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            Back to Vehicle
                          </Button>
                        </Link>
                        <Link href="/cars" className="flex-1">
                          <Button variant="outline" className="w-full">
                            Browse More Cars
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reservation Summary Card */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5" />
                <span>Reservation Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Summary Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Vehicle</p>
                      <p>{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Pick-up</p>
                      <p>{deliveryLocation || "Not selected"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Return</p>
                      <p>{restitutionLocation || "Not selected"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Duration</p>
                      <p>{days ? `${days} day${days === 1 ? "" : "s"}` : "Not calculated"}</p>
                    </div>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Price per day:</span>
                      <span>{vehicle.pricePerDay} EUR</span>
                    </div>
                    {days && (
                      <div className="flex justify-between text-sm">
                        <span>Duration:</span>
                        <span>{days} day{days === 1 ? "" : "s"}</span>
                      </div>
                    )}
                    {totalPrice && (
                      <>
                        <div className="border-t pt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total Price:</span>
                            <span className="text-green-600">{totalPrice} EUR</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <Button 
                    onClick={handleSendReservation}
                    size="lg" 
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 text-lg"
                    disabled={!deliveryLocation || !restitutionLocation || !pickupDate || !returnDate || !pickupTime || !returnTime}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Reservation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer
        logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />}
        brandName=""
      />
    </div>
  );
} 