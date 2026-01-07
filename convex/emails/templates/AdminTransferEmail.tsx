import * as React from "react";
import { Body, Head, Html, Preview, Hr, Tailwind } from "@react-email/components";
import { TransferEmailData } from "../types";
import { EmailHeader } from "../components/email_header";
import { EmailFooter } from "../components/email_footer";
import { CustomerInfoSection } from "../components/customer_info_section";
import { TransferDetailsSection } from "../components/transfer_details_section";
import { TransferPricingSection } from "../components/transfer_pricing_section";

interface AdminTransferEmailProps {
  data: TransferEmailData;
  locale?: "en" | "ro";
}

export const AdminTransferEmail: React.FC<AdminTransferEmailProps> = ({
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
      ? `Cerere nouă de transfer de la ${customerInfo.name}`
      : `New transfer booking from ${customerInfo.name}`,
    title: isRo
      ? `Cerere nouă de transfer #${transferNumber}`
      : `New Transfer Booking #${transferNumber}`,
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
      heading: isRo ? "Vehicul" : "Vehicle",
    },
    pricing: {
      heading: isRo ? "Detalii Preț" : "Pricing Details",
      baseFare: isRo ? "Tarif de Bază:" : "Base Fare:",
      distanceCharge: isRo ? "Taxa Distanță" : "Distance Charge",
      roundTrip: isRo ? "Dus-Întors" : "Round Trip",
      included: isRo ? "Inclus" : "Included",
      totalAmount: isRo ? "Sumă Totală:" : "Total Amount:",
      paymentMethod: isRo ? "Metoda de Plată:" : "Payment Method:",
    },
    footerMessage: isRo
      ? "Aceasta este o notificare automată din sistemul de rezervări Rent'n Go."
      : "This is an automated notification from Rent'n Go reservation system.",
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

          <Hr className="border-gray-200 my-[4px]" />

          <TransferPricingSection
            pricingDetails={pricingDetails}
            paymentMethod={paymentMethod}
            transferType={transferType}
            distanceKm={distanceKm}
            labels={{
              heading: t.pricing.heading,
              baseFare: t.pricing.baseFare,
              distanceCharge: t.pricing.distanceCharge,
              roundTrip: t.pricing.roundTrip,
              included: t.pricing.included,
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

export default AdminTransferEmail;
