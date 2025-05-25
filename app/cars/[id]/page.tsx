"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { 
  MapPin, 
  Fuel, 
  Cog, 
  CarFront, 
  Users,
  Gauge,
  ArrowLeft,
  Calendar,
  Clock
} from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { LocationPicker, getLocationPrice } from "@/components/LocationPicker";
import { DateTimePicker } from "@/components/DateTimePicker";
import { searchStorage } from "@/lib/searchStorage";

function buildReservationUrl(vehicleId: string): string {
  const params = new URLSearchParams();
  params.append("vehicleId", vehicleId);
  return `/reservation?${params.toString()}`;
}

function calculatePriceDetails(
  pricePerDay: number,
  pickup?: Date | null,
  restitution?: Date | null,
  deliveryLocation?: string,
  restitutionLocation?: string
): { 
  basePrice: number | null; 
  totalPrice: number | null; 
  days: number | null;
  deliveryFee: number;
  returnFee: number;
  totalLocationFees: number;
} {
  if (pickup && restitution && restitution > pickup) {
    const days = differenceInDays(restitution, pickup);
    const calculatedDays = days === 0 ? 1 : days;
    const basePrice = calculatedDays * pricePerDay;
    
    // Add location fees
    const deliveryFee = deliveryLocation ? getLocationPrice(deliveryLocation) : 0;
    const returnFee = restitutionLocation ? getLocationPrice(restitutionLocation) : 0;
    const totalLocationFees = deliveryFee + returnFee;
    
    return { 
      basePrice,
      totalPrice: basePrice + totalLocationFees, 
      days: calculatedDays,
      deliveryFee,
      returnFee,
      totalLocationFees
    };
  }
  return { 
    basePrice: null, 
    totalPrice: null, 
    days: null, 
    deliveryFee: 0, 
    returnFee: 0, 
    totalLocationFees: 0 
  };
}

// Rental Details Component
function RentalDetails({
  deliveryLocation,
  pickupDate,
  pickupTime,
  restitutionLocation,
  returnDate,
  returnTime,
  onUpdateDetails,
}: {
  deliveryLocation?: string;
  pickupDate?: Date;
  pickupTime?: string | null;
  restitutionLocation?: string;
  returnDate?: Date;
  returnTime?: string | null;
  onUpdateDetails?: (updates: {
    deliveryLocation?: string;
    pickupDate?: Date;
    pickupTime?: string;
    restitutionLocation?: string;
    returnDate?: Date;
    returnTime?: string;
  }) => void;
}) {
  // Always show the rental details form, even if no data exists
  // Local state for the components
  const [localDeliveryLocation, setLocalDeliveryLocation] = React.useState(deliveryLocation || "");
  const [localPickupDate, setLocalPickupDate] = React.useState<Date | undefined>(pickupDate);
  const [localPickupTime, setLocalPickupTime] = React.useState(pickupTime || "");
  const [localRestitutionLocation, setLocalRestitutionLocation] = React.useState(restitutionLocation || "");
  const [localReturnDate, setLocalReturnDate] = React.useState<Date | undefined>(returnDate);
  const [localReturnTime, setLocalReturnTime] = React.useState(returnTime || "");

  // Sync local state with props when they change (after localStorage load)
  React.useEffect(() => {
    setLocalDeliveryLocation(deliveryLocation || "");
  }, [deliveryLocation]);

  React.useEffect(() => {
    setLocalPickupDate(pickupDate);
  }, [pickupDate]);

  React.useEffect(() => {
    setLocalPickupTime(pickupTime || "");
  }, [pickupTime]);

  React.useEffect(() => {
    setLocalRestitutionLocation(restitutionLocation || "");
  }, [restitutionLocation]);

  React.useEffect(() => {
    setLocalReturnDate(returnDate);
  }, [returnDate]);

  React.useEffect(() => {
    setLocalReturnTime(returnTime || "");
  }, [returnTime]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Update parent when local state changes
  const handleUpdate = React.useCallback((field: string, value: string | Date | undefined) => {
    if (onUpdateDetails) {
      const updates: Record<string, string | Date | undefined> = {};
      updates[field] = value;
      onUpdateDetails(updates);
    }
  }, [onUpdateDetails]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Your Rental Details</span>
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
                id="pickup-location"
                label="Pick-up Location"
                value={localDeliveryLocation}
                onValueChange={(value) => {
                  setLocalDeliveryLocation(value);
                  handleUpdate('deliveryLocation', value);
                }}
                placeholder="Select pick-up location"
                disabled={false}
              />
              <DateTimePicker
                id="pickup-datetime"
                label="Pick-up Date & Time"
                dateState={localPickupDate}
                disabledDateRanges={{ before: today }}
                setDateState={(date) => {
                  setLocalPickupDate(date);
                  handleUpdate('pickupDate', date);
                  // Auto-adjust return date if needed
                  if (date && localReturnDate && date.getTime() > localReturnDate.getTime()) {
                    setLocalReturnDate(date);
                    handleUpdate('returnDate', date);
                  }
                }}
                timeState={localPickupTime}
                setTimeState={(time) => {
                  setLocalPickupTime(time);
                  handleUpdate('pickupTime', time);
                }}
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
                id="return-location"
                label="Return Location"
                value={localRestitutionLocation}
                onValueChange={(value) => {
                  setLocalRestitutionLocation(value);
                  handleUpdate('restitutionLocation', value);
                }}
                placeholder="Select return location"
                disabled={false}
              />
              <DateTimePicker
                id="return-datetime"
                label="Return Date & Time"
                dateState={localReturnDate}
                setDateState={(date) => {
                  if (date) {
                    if (localPickupDate && date.getTime() < localPickupDate.getTime()) {
                      setLocalReturnDate(localPickupDate);
                      handleUpdate('returnDate', localPickupDate);
                    } else {
                      setLocalReturnDate(date);
                      handleUpdate('returnDate', date);
                    }
                  } else {
                    setLocalReturnDate(undefined);
                    handleUpdate('returnDate', undefined);
                  }
                }}
                timeState={localReturnTime}
                setTimeState={(time) => {
                  setLocalReturnTime(time);
                  handleUpdate('returnTime', time);
                }}
                minDate={localPickupDate || today}
                disabledDateRanges={localPickupDate ? { before: localPickupDate } : { before: today }}
                isLoading={!localPickupDate}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CarDetailPage() {
  const params = useParams();
  const vehicleId = params.id as string;

  // Start with empty state to avoid hydration issues
  const [deliveryLocation, setDeliveryLocation] = React.useState<string>("");
  const [pickupDate, setPickupDate] = React.useState<Date | undefined>(undefined);
  const [pickupTime, setPickupTime] = React.useState<string | null>(null);
  const [restitutionLocation, setRestitutionLocation] = React.useState<string>("");
  const [returnDate, setReturnDate] = React.useState<Date | undefined>(undefined);
  const [returnTime, setReturnTime] = React.useState<string | null>(null);
  const [isHydrated, setIsHydrated] = React.useState(false);

  const vehicle = useQuery(api.vehicles.getById, { id: vehicleId as Id<"vehicles"> });

  // Carousel state and refs
  const [mainApi, setMainApi] = React.useState<CarouselApi>();
  const [thumbApi, setThumbApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  const currency = "EUR"; // Changed to EUR

  // Load data from localStorage on component mount
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

  // Calculate pricing details
  const { basePrice, totalPrice, days, deliveryFee, returnFee, totalLocationFees } = calculatePriceDetails(
    vehicle?.pricePerDay || 0,
    pickupDate,
    returnDate,
    deliveryLocation,
    restitutionLocation
  );

  // Handle rental details updates
  const handleRentalDetailsUpdate = React.useCallback((updates: {
    deliveryLocation?: string;
    pickupDate?: Date;
    pickupTime?: string;
    restitutionLocation?: string;
    returnDate?: Date;
    returnTime?: string;
  }) => {
    // Update local state
    if (updates.deliveryLocation !== undefined) setDeliveryLocation(updates.deliveryLocation);
    if (updates.pickupDate !== undefined) setPickupDate(updates.pickupDate);
    if (updates.pickupTime !== undefined) setPickupTime(updates.pickupTime);
    if (updates.restitutionLocation !== undefined) setRestitutionLocation(updates.restitutionLocation);
    if (updates.returnDate !== undefined) setReturnDate(updates.returnDate);
    if (updates.returnTime !== undefined) setReturnTime(updates.returnTime);

    // Save to localStorage (only after hydration)
    if (isHydrated) {
      const currentData = searchStorage.load();
      searchStorage.save({
        ...currentData,
        ...updates,
      });
    }
  }, [isHydrated]);

  const reservationUrl = buildReservationUrl(vehicleId);

  // Synchronize the carousels
  React.useEffect(() => {
    if (!mainApi || !thumbApi) return;

    const handleMainSelect = () => {
      const selected = mainApi.selectedScrollSnap();
      setCurrent(selected);
      thumbApi.scrollTo(selected);
    };

    const handleThumbSelect = () => {
      const selected = thumbApi.selectedScrollSnap();
      setCurrent(selected);
      mainApi.scrollTo(selected);
    };

    mainApi.on("select", handleMainSelect);
    thumbApi.on("select", handleThumbSelect);

    return () => {
      mainApi.off("select", handleMainSelect);
      thumbApi.off("select", handleThumbSelect);
    };
  }, [mainApi, thumbApi]);

  // Set initial slide based on main image
  React.useEffect(() => {
    if (vehicle?.images && vehicle?.mainImageId && mainApi && thumbApi) {
      const mainImageIndex = vehicle.images.findIndex(id => id === vehicle.mainImageId);
      if (mainImageIndex !== -1) {
        mainApi.scrollTo(mainImageIndex);
        thumbApi.scrollTo(mainImageIndex);
        setCurrent(mainImageIndex);
      }
    }
  }, [vehicle?.images, vehicle?.mainImageId, mainApi, thumbApi]);

  if (vehicle === undefined) {
    return (
      <div className="relative flex flex-col min-h-screen">
        <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground">Loading vehicle details...</p>
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
            <p className="text-muted-foreground mb-6">The vehicle you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Link href="/cars">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cars
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
        <div className="max-w-7xl mx-auto">
          {/* Back button */}
          <div className="mb-6">
            <Link href="/cars">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cars
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vehicle Images */}
            <div className="space-y-4">
              {/* Main Image Carousel */}
              <div className="relative">
                <Carousel setApi={setMainApi} className="w-full">
                  <CarouselContent>
                    {vehicle.images && vehicle.images.length > 0 ? (
                      vehicle.images.map((imageId, index) => (
                        <CarouselItem key={imageId}>
                          <div className="aspect-[4/3] relative w-full bg-muted overflow-hidden rounded-lg">
                            <VehicleMainImage 
                              imageId={imageId}
                              alt={`${vehicle.make} ${vehicle.model} - Image ${index + 1}`}
                            />
                          </div>
                        </CarouselItem>
                      ))
                    ) : (
                      <CarouselItem>
                        <div className="aspect-[4/3] relative w-full bg-muted overflow-hidden rounded-lg flex items-center justify-center">
                          <span className="text-muted-foreground">No Image Available</span>
                        </div>
                      </CarouselItem>
                    )}
                  </CarouselContent>
                  {vehicle.images && vehicle.images.length > 1 && (
                    <>
                      <CarouselPrevious className="left-4" />
                      <CarouselNext className="right-4" />
                    </>
                  )}
                </Carousel>
              </div>

              {/* Thumbnail Carousel */}
              {vehicle.images && vehicle.images.length > 1 && (
                <div className="w-full">
                  <Carousel
                    setApi={setThumbApi}
                    opts={{
                      containScroll: "keepSnaps",
                      dragFree: true,
                    }}
                    className="w-full"
                  >
                    <CarouselContent className="-ml-2 p-2">
                      {vehicle.images.map((imageId, index) => (
                        <CarouselItem key={imageId} className="basis-auto pl-2">
                          <div
                            className={`w-20 h-20 relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                              current === index
                                ? "border-yellow-500 ring-2 ring-yellow-500 ring-offset-2"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => {
                              mainApi?.scrollTo(index);
                              thumbApi?.scrollTo(index);
                            }}
                          >
                            <VehicleThumbnailImage 
                              imageId={imageId}
                              alt={`${vehicle.make} ${vehicle.model} thumbnail ${index + 1}`}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </div>
              )}
            </div>

            {/* Vehicle Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">
                  {vehicle.make} {vehicle.model}
                </h1>
                {vehicle.year && <p className="text-xl text-muted-foreground">{vehicle.year}</p>}
                {vehicle.type && (
                  <Badge variant="outline" className="mt-2">
                    {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                  </Badge>
                )}
              </div>

              {/* Rental Details Component */}
              <RentalDetails
                deliveryLocation={deliveryLocation}
                pickupDate={pickupDate}
                pickupTime={pickupTime}
                restitutionLocation={restitutionLocation}
                returnDate={returnDate}
                returnTime={returnTime}
                onUpdateDetails={handleRentalDetailsUpdate}
              />

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Price per day */}
                    <div className="text-center">
                      <span className="text-3xl font-bold text-yellow-500">
                        {vehicle.pricePerDay}
                      </span>
                      <span className="text-lg text-muted-foreground ml-2">
                        {currency} / Day
                      </span>
                    </div>

                    {/* Total price if dates are available */}
                    {totalPrice !== null && days !== null && (
                      <>
                        <div className="border-t pt-4 space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">
                              Base price ({days} day{days === 1 ? "" : "s"}):
                            </span>
                            <span className="text-muted-foreground">
                              {basePrice} {currency}
                            </span>
                          </div>

                          {deliveryFee > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">
                                Pick-up location fee ({deliveryLocation}):
                              </span>
                              <span className="text-muted-foreground">
                                {deliveryFee} {currency}
                              </span>
                            </div>
                          )}

                          {returnFee > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">
                                Return location fee ({restitutionLocation}):
                              </span>
                              <span className="text-muted-foreground">
                                {returnFee} {currency}
                              </span>
                            </div>
                          )}

                          {totalLocationFees > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground/60">
                                Total location fees:
                              </span>
                              <span className="text-muted-foreground/60">
                                {totalLocationFees} {currency}
                              </span>
                            </div>
                          )}

                          <div className="border-t pt-2">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-semibold">Total Price:</span>
                              <span className="text-2xl font-bold text-green-600">
                                {totalPrice} {currency}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {vehicle.year && (
                      <div className="flex items-center space-x-2">
                        <CarFront className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Year: {vehicle.year}</span>
                      </div>
                    )}
                    {vehicle.seats && (
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Seats: {vehicle.seats}</span>
                      </div>
                    )}
                    {vehicle.engineCapacity && (
                      <div className="flex items-center space-x-2">
                        <Cog className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Engine: {vehicle.engineCapacity.toFixed(1)}L {vehicle.engineType || ''}
                        </span>
                      </div>
                    )}
                    {vehicle.fuelType && (
                      <div className="flex items-center space-x-2">
                        <Fuel className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Fuel: {vehicle.fuelType}</span>
                      </div>
                    )}
                    {vehicle.transmission && (
                      <div className="flex items-center space-x-2">
                        <Gauge className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Transmission: {vehicle.transmission}
                        </span>
                      </div>
                    )}
                    {vehicle.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Location: {vehicle.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              {vehicle.features && vehicle.features.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {vehicle.features.map((feature, index) => (
                        <Badge key={index} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reserve Button */}
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 text-lg"
                  asChild
                >
                  <Link href={reservationUrl}>
                    Reserve This Car
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Click to proceed with your reservation
                </p>
              </div>
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

// Component for main carousel images
function VehicleMainImage({ 
  imageId, 
  alt 
}: { 
  imageId: Id<"_storage">; 
  alt: string; 
}) {
  const imageUrl = useQuery(api.vehicles.getImageUrl, { imageId });

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <span>Loading image...</span>
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      style={{ objectFit: "cover" }}
      sizes="(max-width: 1024px) 100vw, 50vw"
      priority
    />
  );
}

// Component for thumbnail carousel images
function VehicleThumbnailImage({ 
  imageId, 
  alt 
}: { 
  imageId: Id<"_storage">; 
  alt: string; 
}) {
  const imageUrl = useQuery(api.vehicles.getImageUrl, { imageId });

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-muted text-muted-foreground text-xs">
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      style={{ objectFit: "cover" }}
      sizes="80px"
    />
  );
} 