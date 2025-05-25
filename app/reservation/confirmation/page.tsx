"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Clock, 
  CreditCard, 
  Phone, 
  Mail, 
  Download, 
  Share, 
  Home,
  Car,
  User,
  FileText,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

function ReservationConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reservationId = searchParams.get("reservationId");

  // Get reservation details
  const reservation = useQuery(
    api.reservations.getReservationById,
    reservationId ? { reservationId: reservationId as Id<"reservations"> } : "skip"
  );

  // Get vehicle details
  const vehicle = useQuery(
    api.vehicles.getById,
    reservation?.vehicleId ? { id: reservation.vehicleId } : "skip"
  );

  // Get vehicle image
  const imageUrl = useQuery(
    api.vehicles.getImageUrl,
    vehicle?.mainImageId ? { imageId: vehicle.mainImageId } : "skip"
  );

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    toast.info("PDF download will be available soon.");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rent&apos;n Go Reservation Confirmation',
          text: 'My car rental reservation is confirmed!',
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (!reservationId) {
    return (
      <div className="relative flex flex-col min-h-screen">
        <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">No Reservation Found</h1>
            <p className="text-muted-foreground mb-6">
              We couldn&apos;t find a reservation ID in the URL. Please check your confirmation email or contact support.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/cars">
                <Button>
                  <Car className="mr-2 h-4 w-4" />
                  Browse Cars
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} brandName="" />
      </div>
    );
  }

  if (reservation === undefined || vehicle === undefined) {
    return (
      <div className="relative flex flex-col min-h-screen">
        <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your reservation details...</p>
          </div>
        </main>
        <Footer logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} brandName="" />
      </div>
    );
  }

  if (reservation === null || vehicle === null) {
    return (
      <div className="relative flex flex-col min-h-screen">
        <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Reservation Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The reservation could not be found or may have been cancelled. Please contact support if you believe this is an error.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/cars">
                <Button>
                  <Car className="mr-2 h-4 w-4" />
                  Browse Cars
                </Button>
              </Link>
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </div>
        </main>
        <Footer logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} brandName="" />
      </div>
    );
  }

  const startDate = new Date(reservation.startDate);
  const endDate = new Date(reservation.endDate);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash_on_delivery":
        return "Cash on Delivery";
      case "card_on_delivery":
        return "Card Payment on Delivery";
      case "card_online":
        return "Card Payment Online";
      default:
        return method;
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              Reservation Confirmed!
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your car rental has been successfully booked. We've sent a confirmation email with all the details.
            </p>
          </div>

          {/* Reservation ID & Status */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Reservation ID</p>
                  <p className="text-xl font-mono font-bold">{reservationId}</p>
                </div>
                <Badge className={`w-fit ${getStatusColor(reservation.status)}`}>
                  {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Vehicle Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Car className="h-5 w-5" />
                  <span>Vehicle Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-24 relative bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="96px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-muted-foreground mb-2">{vehicle.year}</p>
                    <div className="flex flex-col gap-2 md:grid md:grid-cols-2 lg:gap-x-24 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-1 capitalize">{vehicle.type}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Seats:</span>
                        <span className="ml-1">{vehicle.seats}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Transmission:</span>
                        <span className="ml-1 capitalize">{vehicle.transmission}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fuel:</span>
                        <span className="ml-1 capitalize">{vehicle.fuelType}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Customer Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{reservation.customerInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{reservation.customerInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{reservation.customerInfo.phone}</p>
                  </div>
                  {reservation.customerInfo.message && (
                    <div>
                      <p className="text-sm text-muted-foreground">Message</p>
                      <p className="font-medium text-sm">{reservation.customerInfo.message}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rental Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Rental Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pickup */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-700 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Pickup
                  </h4>
                  <div className="pl-5 space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{startDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{reservation.pickupTime}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{reservation.pickupLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Return */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-red-700 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Return
                  </h4>
                  <div className="pl-5 space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{endDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{reservation.restitutionTime}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{reservation.restitutionLocation}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Total */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">{getPaymentMethodLabel(reservation.paymentMethod)}</span>
                </div>
                {reservation.additionalCharges && reservation.additionalCharges.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Additional Charges:</p>
                    <div className="space-y-1">
                      {reservation.additionalCharges.map((charge, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{charge.description}</span>
                          <span>{charge.amount} EUR</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">{reservation.totalPrice} EUR</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button onClick={handleDownloadPDF} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleShare} className="flex-1">
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Link href="/cars" className="flex-1">
              <Button variant="outline" className="w-full">
                <Car className="mr-2 h-4 w-4" />
                Book Another Car
              </Button>
            </Link>
          </div>

          {/* Next Steps & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Next Steps</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Bring Required Documents</p>
                      <p className="text-sm text-muted-foreground">Valid driver's license and credit card</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Arrive on Time</p>
                      <p className="text-sm text-muted-foreground">Please arrive 15 minutes before pickup time</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Vehicle Inspection</p>
                      <p className="text-sm text-muted-foreground">Complete pre-rental inspection with our staff</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Need Help?</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Customer Support</p>
                      <p className="text-sm text-muted-foreground">+40 123 456 789</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-sm text-muted-foreground">support@rentngo.ro</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Support Hours</p>
                      <p className="text-sm text-muted-foreground">24/7 Available</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Questions about your reservation?
                    </p>
                    <Link href="/terms-and-conditions" className="text-primary hover:underline text-sm">
                      View Terms & Conditions
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
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

export default function ReservationConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReservationConfirmationContent />
    </Suspense>
  );
} 