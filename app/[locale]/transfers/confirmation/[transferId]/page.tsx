"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  MapPin,
  Calendar,
  Clock,
  Users,
  Car,
  Phone,
  Mail,
  Plane,
  MessageSquare,
  CreditCard,
  ArrowRight,
  Home,
  FileText,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { TransferRouteMap } from "@/components/transfer/transfer-route-map";

export default function TransferConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("transferPage");
  const tConfirmation = useTranslations("confirmationPage");

  const transferId = params.transferId as Id<"transfers">;

  const transfer = useQuery(api.transfers.getTransferById, {
    transferId,
  });

  const vehicle = useQuery(
    api.vehicles.getById,
    transfer?.vehicleId ? { id: transfer.vehicleId } : "skip"
  );

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        variant: "secondary" as const,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: tConfirmation("status.pending"),
      },
      confirmed: {
        variant: "default" as const,
        className: "bg-green-100 text-green-800 border-green-200",
        label: tConfirmation("status.confirmed"),
      },
      cancelled: {
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800 border-red-200",
        label: tConfirmation("status.cancelled"),
      },
      completed: {
        variant: "secondary" as const,
        className: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Completed",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash_on_delivery: tConfirmation("paymentMethods.cashOnDelivery"),
      card_on_delivery: tConfirmation("paymentMethods.cardOnDelivery"),
      card_online: tConfirmation("paymentMethods.cardOnline"),
    };
    return labels[method] || method;
  };

  if (transfer === undefined) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="text-center">
            <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <h2 className="text-2xl font-bold mb-4">Transfer Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The transfer you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/transfers")}>
            <Home className="h-4 w-4 mr-2" />
            Book a New Transfer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl px-4 lg:px-0">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{t("confirmation.title")}</h1>
        <p className="text-muted-foreground">{t("confirmation.subtitle")}</p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <Badge variant="outline" className="text-lg px-4 py-1">
            {t("confirmation.transferNumber")} {transfer.transferNumber}
          </Badge>
          {getStatusBadge(transfer.status)}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Route Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t("confirmation.route")}
            </CardTitle>
            {transfer.pickupLocation.coordinates && transfer.dropoffLocation.coordinates && (
              <TransferRouteMap
                pickupCoordinates={transfer.pickupLocation.coordinates}
                dropoffCoordinates={transfer.dropoffLocation.coordinates}
                pickupLabel={transfer.pickupLocation.address.split(",")[0]}
                dropoffLabel={transfer.dropoffLocation.address.split(",")[0]}
                className="h-[100px] w-full mt-3 opacity-75"
                compact
              />
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <div className="w-0.5 h-12 bg-border" />
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Pickup
                    </p>
                    <p className="font-medium">{transfer.pickupLocation.address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Dropoff
                    </p>
                    <p className="font-medium">{transfer.dropoffLocation.address}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(new Date(transfer.pickupDate), "EEE, MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="font-medium">{transfer.pickupTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("confirmation.distance")}</p>
                    <p className="font-medium">{transfer.distanceKm} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Passengers</p>
                    <p className="font-medium">{transfer.passengers}</p>
                  </div>
                </div>
              </div>

              {transfer.transferType === "round_trip" &&
                transfer.returnDate &&
                transfer.returnTime && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2">Return Trip</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Return Date</p>
                            <p className="font-medium">
                              {format(new Date(transfer.returnDate), "EEE, MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Return Time</p>
                            <p className="font-medium">{transfer.returnTime}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Details */}
        {vehicle && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                {tConfirmation("vehicleDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">
                    {vehicle.make} {vehicle.model}
                  </p>
                  {vehicle.year && (
                    <p className="text-muted-foreground">{vehicle.year}</p>
                  )}
                </div>
                <Badge variant="outline">
                  {vehicle.seats} seats
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {tConfirmation("customerInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{transfer.customerInfo.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{transfer.customerInfo.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{transfer.customerInfo.phone}</span>
            </div>
            {transfer.customerInfo.flightNumber && (
              <div className="flex items-center gap-3">
                <Plane className="h-4 w-4 text-muted-foreground" />
                <span>Flight: {transfer.customerInfo.flightNumber}</span>
              </div>
            )}
            {transfer.customerInfo.message && (
              <div className="flex items-start gap-3">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">{transfer.customerInfo.message}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {tConfirmation("paymentSummary")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("pricing.basePrice")}</span>
              <span>€{transfer.baseFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Distance ({transfer.distanceKm} km × €{transfer.pricePerKm.toFixed(2)})
              </span>
              <span>€{transfer.distancePrice.toFixed(2)}</span>
            </div>
            {transfer.transferType === "round_trip" && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Round trip discount</span>
                <span>-10%</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{tConfirmation("paymentMethod")}</span>
              <span>{getPaymentMethodLabel(transfer.paymentMethod)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-baseline">
              <span className="font-semibold">{tConfirmation("totalAmount")}</span>
              <span className="text-2xl font-bold text-primary">
                €{transfer.totalPrice.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* What Happens Next */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {tConfirmation("whatHappensNext")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium">{tConfirmation("requestReview")}</p>
                <p className="text-sm text-muted-foreground">
                  {tConfirmation("requestReviewDescription")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium">{tConfirmation("emailConfirmation")}</p>
                <p className="text-sm text-muted-foreground">
                  {tConfirmation("emailConfirmationDescription")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium">Driver Assignment</p>
                <p className="text-sm text-muted-foreground">
                  A professional driver will be assigned to your transfer and will contact you before pickup.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Need Help */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              {tConfirmation("needHelp")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{tConfirmation("customerSupport")}: +40 773 932 961</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{tConfirmation("emailSupport")}: contact@rngo.ro</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              {tConfirmation("goBack")}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/transfers">
              {t("confirmation.bookAnother")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
