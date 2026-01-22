"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Home,
  Car,
  User,
  FileText,
  AlertCircle,
  Plane,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { getPriceForDurationWithSeason } from "@/lib/vehicle-utils";

function ReservationConfirmationContent() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("reservationId");
  const t = useTranslations("confirmationPage");
  const locale = useLocale();

  // Get reservation details
  const reservation = useQuery(
    api.reservations.getReservationById,
    reservationId
      ? { reservationId: reservationId as Id<"reservations"> }
      : "skip",
  );

  // Get vehicle details
  const vehicle = useQuery(
    api.vehicles.getById,
    reservation?.vehicleId ? { id: reservation.vehicleId } : "skip",
  );

  // Get vehicle image
  const imageUrl = useQuery(
    api.vehicles.getImageUrl,
    vehicle?.mainImageId ? { imageId: vehicle.mainImageId } : "skip",
  );

  if (!reservationId) {
    return (
      <div className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">
            {t("noReservationFound")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t("noReservationDescription")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/cars">
              <Button>
                <Car className="mr-2 h-4 w-4" />
                {t("bookAnotherCar")}
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
      </div>
    );
  }

  if (reservation === undefined || vehicle === undefined) {
    return (
      <div className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("loadingReservation")}</p>
        </div>
      </div>
    );
  }

  if (reservation === null || vehicle === null) {
    return (
      <div className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">
            {t("reservationNotFound")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t("reservationNotFoundDescription")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/cars">
              <Button>
                <Car className="mr-2 h-4 w-4" />
                {t("bookAnotherCar")}
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
      </div>
    );
  }

  const startDate = new Date(reservation.startDate);
  const endDate = new Date(reservation.endDate);

  // Compute rental days similar to pricing logic
  const computeRentalDays = (
    start: Date,
    end: Date,
    pickupTimeStr: string,
    restitutionTimeStr: string,
  ) => {
    const startMid = new Date(start);
    startMid.setHours(0, 0, 0, 0);
    const endMid = new Date(end);
    endMid.setHours(0, 0, 0, 0);
    const baseDays = Math.max(
      0,
      Math.round((endMid.getTime() - startMid.getTime()) / 86400000),
    );
    const [ph, pm] = (pickupTimeStr || "00:00").split(":").map(Number);
    const [rh, rm] = (restitutionTimeStr || "00:00").split(":").map(Number);
    let calculated = baseDays;
    if (baseDays === 0) {
      calculated = 1;
    } else {
      if (rh <= ph + 2) {
        calculated = baseDays;
      } else if (rh > ph + 2) {
        calculated = baseDays + 1;
      } else if (rh < ph) {
        calculated = baseDays;
      }
    }
    return Math.max(1, calculated);
  };

  const rentalDays = computeRentalDays(
    startDate,
    endDate,
    reservation.pickupTime,
    reservation.restitutionTime,
  );
  const seasonalMultiplier = reservation.seasonalMultiplier ?? 1.0;
  const pricePerDayUsed = vehicle
    ? getPriceForDurationWithSeason(vehicle, rentalDays, seasonalMultiplier)
    : 0;
  const rentalSubtotal = rentalDays * pricePerDayUsed;

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

  const getStatusLabel = (status: string) => {
    return (
      t(`status.${status}` as any) ||
      status.charAt(0).toUpperCase() + status.slice(1)
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash_on_delivery":
        return t("paymentMethods.cashOnDelivery");
      case "card_on_delivery":
        return t("paymentMethods.cardOnDelivery");
      case "card_online":
        return t("paymentMethods.cardOnline");
      default:
        return method;
    }
  };

  return (
    <div className="flex-grow p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Reservation ID & Status */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("reservationNumber")}
                </p>
                <p className="text-xl font-mono font-bold">
                  #{reservation.reservationNumber}
                </p>
              </div>
              <Badge className={`w-fit ${getStatusColor(reservation.status)}`}>
                {getStatusLabel(reservation.status)}
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
                <span>{t("vehicleDetails")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="w-full relative bg-muted rounded-lg overflow-hidden">
                  <div className="w-full aspect-[16/9] relative">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                        {t("noImage")}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1 break-words">
                    {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-muted-foreground mb-2">{vehicle.year}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="break-words">
                      <span className="text-muted-foreground">{t("type")}</span>
                      <span className="ml-1 capitalize">{vehicle.type}</span>
                    </div>
                    <div className="break-words">
                      <span className="text-muted-foreground">
                        {t("seats")}
                      </span>
                      <span className="ml-1">{vehicle.seats}</span>
                    </div>
                    <div className="break-words">
                      <span className="text-muted-foreground">
                        {t("transmission")}
                      </span>
                      <span className="ml-1 capitalize">
                        {vehicle.transmission}
                      </span>
                    </div>
                    <div className="break-words">
                      <span className="text-muted-foreground">{t("fuel")}</span>
                      <span className="ml-1 capitalize">
                        {vehicle.fuelType}
                      </span>
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
                <span>{t("customerInformation")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">{t("name")}</p>
                  <p className="font-medium">{reservation.customerInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("email")}</p>
                  <p className="font-medium">
                    {reservation.customerInfo.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("phone")}</p>
                  <p className="font-medium">
                    {reservation.customerInfo.phone}
                  </p>
                </div>
                {reservation.customerInfo.flightNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Plane className="h-4 w-4 mr-1" />
                      {t("flightNumber")}
                    </p>
                    <p className="font-medium">
                      {reservation.customerInfo.flightNumber}
                    </p>
                  </div>
                )}
                {reservation.customerInfo.message && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("message")}
                    </p>
                    <p className="font-medium text-sm">
                      {reservation.customerInfo.message}
                    </p>
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
              <span>{t("rentalDetails")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pickup */}
              <div className="space-y-3">
                <h4 className="font-semibold text-green-700 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {t("pickup")}
                </h4>
                <div className="pl-5 space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {startDate.toLocaleDateString(locale, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
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
                  {t("return")}
                </h4>
                <div className="pl-5 space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {endDate.toLocaleDateString(locale, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
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
              <span>{t("paymentSummary")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {t("paymentMethod")}
                </span>
                <span className="font-medium">
                  {getPaymentMethodLabel(reservation.paymentMethod)}
                </span>
              </div>
              {/* Base rental breakdown */}
              <div className="flex justify-between items-center text-sm">
                <span>
                  {t("baseRentalLine", {
                    days: rentalDays,
                    price: pricePerDayUsed,
                  })}
                </span>
                <span>{rentalSubtotal} EUR</span>
              </div>
              {reservation.additionalCharges &&
                reservation.additionalCharges.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t("additionalCharges")}
                    </p>
                    <div className="space-y-1">
                      {reservation.additionalCharges.map((charge, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span>{charge.description}</span>
                          <span>{charge.amount} EUR</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              {/* SCDW line above total */}
              {reservation.isSCDWSelected &&
                (reservation.protectionCost ?? 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {t("scdwLine")}
                    </span>
                    <span className="font-medium">
                      {reservation.protectionCost} EUR
                    </span>
                  </div>
                )}
              <Separator />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>{t("totalAmount")}</span>
                <span className="text-green-600">
                  {reservation.totalPrice} EUR
                </span>
              </div>
              {/* Warranty note below total when SCDW not selected */}
              {!reservation.isSCDWSelected &&
                reservation.deductibleAmount !== undefined && (
                  <div className="text-right text-sm text-muted-foreground">
                    {t("warrantyLine")}: {reservation.deductibleAmount} EUR
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center mb-8">
          <Link href="/cars">
            <Button className="px-8">
              <Car className="mr-2 h-4 w-4" />
              {t("bookAnotherCar")}
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
                <span>{t("whatHappensNext")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">{t("requestReview")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("requestReviewDescription")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">{t("emailConfirmation")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("emailConfirmationDescription")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">{t("prepareDocuments")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("prepareDocumentsDescription")}
                    </p>
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
                <span>{t("needHelp")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{t("customerSupport")}</p>
                    <p className="text-sm text-muted-foreground">
                      +40 773 932 961
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{t("emailSupport")}</p>
                    <p className="text-sm text-muted-foreground">
                      office@rngo.ro
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{t("supportHours")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("supportAvailable")}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("questionsAboutReservation")}
                  </p>
                  <Link
                    href="/terms"
                    className="text-primary hover:underline text-sm"
                  >
                    {t("viewTermsConditions")}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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
