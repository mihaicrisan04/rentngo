import * as React from "react";
import { Body, Head, Html, Preview, Hr, Tailwind } from "@react-email/components";
import { TransferEmailData } from "../types";
import { EmailHeader } from "../components/email_header";
import { EmailFooter } from "../components/email_footer";
import { CustomerInfoSection } from "../components/customer_info_section";
import { VehicleInfoSection } from "../components/vehicle_info_section";
import { TransferDetailsSection } from "../components/transfer_details_section";
import { TransferPricingSection } from "../components/transfer_pricing_section";

interface UserTransferEmailProps {
  data: TransferEmailData;
  locale?: "en" | "ro";
}

export const UserTransferEmail: React.FC<UserTransferEmailProps> = ({
  data,
  locale,
}) => {
  const {
    transferNumber,
    customerInfo,
    vehicleInfo,
    pickupLocation,
    dropoffLocation,
    pickupDate,
    pickupTime,
    returnDate,
    returnTime,
    transferType,
    passengers,
    luggageCount,
    distanceKm,
    estimatedDurationMinutes,
    pricingDetails,
    paymentMethod,
  } = data;

  const isRo = (locale ?? data.locale) === "ro";
  const t = {
    preview: isRo
      ? `Cererea ta de transfer #${transferNumber} a fost primită`
      : `Your transfer request #${transferNumber} has been received`,
    title: isRo
      ? `Cerere trimisă #${transferNumber}`
      : `Request submitted #${transferNumber}`,
    customer: {
      heading: isRo ? "Detalii Client" : "Customer Details",
      name: isRo ? "Nume Client:" : "Customer Name:",
      email: "Email:",
      phone: isRo ? "Telefon:" : "Phone:",
      flight: isRo ? "Număr Zbor:" : "Flight Number:",
      message: isRo ? "Mesaj Client:" : "Customer Message:",
    },
    transfer: {
      heading: isRo ? "Detalii Transfer" : "Transfer Details",
      pickupLocation: isRo ? "Locație Ridicare:" : "Pickup Location:",
      dropoffLocation: isRo ? "Locație Destinație:" : "Dropoff Location:",
      pickupDateTime: isRo ? "Data și Ora Ridicării:" : "Pickup Date & Time:",
      returnDateTime: isRo ? "Data și Ora Retur:" : "Return Date & Time:",
      transferType: isRo ? "Tip Transfer:" : "Transfer Type:",
      oneWay: isRo ? "Doar Dus" : "One Way",
      roundTrip: isRo ? "Dus-Întors" : "Round Trip",
      passengers: isRo ? "Pasageri:" : "Passengers:",
      luggage: isRo ? "Bagaje:" : "Luggage:",
      distance: isRo ? "Distanță:" : "Distance:",
      duration: isRo ? "Durată Est.:" : "Est. Duration:",
    },
    vehicle: {
      heading: isRo ? "Detalii Vehicul" : "Vehicle Details",
      seats: isRo ? "Locuri:" : "Seats:",
      transmission: isRo ? "Transmisie:" : "Transmission:",
      fuel: isRo ? "Combustibil:" : "Fuel Type:",
    },
    pricing: {
      heading: isRo ? "Detalii Preț" : "Pricing Details",
      distance: isRo ? "Distanță:" : "Distance:",
      roundTrip: isRo ? "Dus-Întors" : "Round Trip",
      totalAmount: isRo ? "Sumă Totală:" : "Total Amount:",
      paymentMethod: isRo ? "Metoda de Plată:" : "Payment Method:",
    },
    footerMessage: isRo
      ? "Am primit cererea ta de transfer. Echipa noastră te va contacta în curând pentru confirmare."
      : "We've received your transfer request. Our team will contact you soon to confirm.",
  };

  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>{t.preview}</Preview>
        <Body className="bg-white font-sans p-0 m-0">
          <EmailHeader title={t.title} />

          <CustomerInfoSection
            customerInfo={customerInfo}
            reservationId={String(transferNumber)}
            labels={{
              heading: t.customer.heading,
              name: t.customer.name,
              email: t.customer.email,
              phone: t.customer.phone,
              flightNumber: t.customer.flight,
              message: t.customer.message,
            }}
          />

          <TransferDetailsSection
            pickupLocation={pickupLocation}
            dropoffLocation={dropoffLocation}
            pickupDate={pickupDate}
            pickupTime={pickupTime}
            returnDate={returnDate}
            returnTime={returnTime}
            transferType={transferType}
            passengers={passengers}
            luggageCount={luggageCount}
            distanceKm={distanceKm}
            estimatedDurationMinutes={estimatedDurationMinutes}
            labels={{
              heading: t.transfer.heading,
              pickupLocation: t.transfer.pickupLocation,
              dropoffLocation: t.transfer.dropoffLocation,
              pickupDateTime: t.transfer.pickupDateTime,
              returnDateTime: t.transfer.returnDateTime,
              transferType: t.transfer.transferType,
              oneWay: t.transfer.oneWay,
              roundTrip: t.transfer.roundTrip,
              passengers: t.transfer.passengers,
              luggage: t.transfer.luggage,
              distance: t.transfer.distance,
              duration: t.transfer.duration,
            }}
          />

          <VehicleInfoSection
            vehicleInfo={{
              make: vehicleInfo.make,
              model: vehicleInfo.model,
              year: vehicleInfo.year,
              type: vehicleInfo.type,
              seats: vehicleInfo.seats,
              transmission: vehicleInfo.transmission,
              fuelType: vehicleInfo.fuelType,
            }}
            labels={{
              heading: t.vehicle.heading,
              seats: t.vehicle.seats,
              transmission: t.vehicle.transmission,
              fuel: t.vehicle.fuel,
            }}
          />

          <Hr className="border-gray-200 my-[4px]" />

          <TransferPricingSection
            pricingDetails={pricingDetails}
            paymentMethod={paymentMethod}
            transferType={transferType}
            distanceKm={distanceKm}
            labels={{
              heading: t.pricing.heading,
              distance: t.pricing.distance,
              roundTrip: t.pricing.roundTrip,
              totalAmount: t.pricing.totalAmount,
              paymentMethod: t.pricing.paymentMethod,
            }}
          />

          <EmailFooter customMessage={t.footerMessage} />
        </Body>
      </Tailwind>
    </Html>
  );
};

export default UserTransferEmail;
