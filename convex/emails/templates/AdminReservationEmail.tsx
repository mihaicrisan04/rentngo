import * as React from "react";
import { Body, Head, Html, Preview, Hr, Tailwind } from "@react-email/components";
import { ReservationEmailData } from "../types";
import { EmailHeader } from "../components/email_header";
import { EmailFooter } from "../components/email_footer";
import { CustomerInfoSection } from "../components/customer_info_section";
import { RentalDetailsSection } from "../components/rental_details_section";
import { VehicleInfoSection } from "../components/vehicle_info_section";
import { PricingSection } from "../components/pricing_section";

interface AdminReservationEmailProps {
  data: ReservationEmailData;
}

export const AdminReservationEmail: React.FC<AdminReservationEmailProps> = ({
  data,
}) => {
  const {
    customerInfo,
    vehicleInfo,
    rentalDetails,
    pricingDetails,
    reservationNumber,
    locale,
  } = data;

  const isRo = locale === "ro";
  const t = {
    preview: isRo
      ? `Cerere nouă de rezervare de la ${customerInfo.name}`
      : `New car rental reservation request from ${customerInfo.name}`,
    title: isRo
      ? `Cerere nouă de rezervare #${reservationNumber}`
      : `New Reservation Request #${reservationNumber}`,
    customer: {
      heading: isRo ? "Detalii Rezervare" : "Reservation Details",
      name: isRo ? "Nume Client:" : "Customer Name:",
      email: "Email:",
      phone: isRo ? "Telefon:" : "Phone:",
      flight: isRo ? "Număr Zbor:" : "Flight Number:",
      message: isRo ? "Mesaj Client:" : "Customer Message:",
    },
    rental: {
      pickupDateTime: isRo ? "Data și Ora Ridicării:" : "Pickup Date & Time:",
      returnDateTime: isRo ? "Data și Ora Returnării:" : "Return Date & Time:",
      pickupLocation: isRo ? "Locația de Ridicare:" : "Pickup Location:",
      returnLocation: isRo ? "Locația de Returnare:" : "Return Location:",
    },
    vehicle: {
      heading: isRo ? "Informații Vehicul" : "Vehicle Information",
      seats: isRo ? "Locuri:" : "Seats:",
      transmission: isRo ? "Transmisie:" : "Transmission:",
      fuel: isRo ? "Combustibil:" : "Fuel Type:",
      features: isRo ? "Caracteristici:" : "Features:",
    },
    pricing: {
      heading: isRo ? "Detalii Preț" : "Pricing Details",
      rentalLine: (days: number, pricePerDay: number) =>
        isRo
          ? `Închiriere (${days} ${days === 1 ? "zi" : "zile"} × ${pricePerDay} EUR/zi):`
          : `Rental (${days} ${days === 1 ? "day" : "days"} × ${pricePerDay} EUR/day):`,
      promoCode: isRo ? "Cod Promoțional Aplicat:" : "Promo Code Applied:",
      additionalCharges: isRo ? "Taxă Suplimentară" : "Additional Charge",
      totalAmount: isRo ? "Sumă Totală:" : "Total Amount:",
      paymentMethod: isRo ? "Metoda de Plată:" : "Payment Method:",
      scdwText: isRo ? "SCDW (nerestituibilă)" : "SCDW (zero deductible)",
      warrantyText: isRo ? "Garanție (restituibilă)" : "Warranty (deductible)",
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
            reservationId={String(reservationNumber)}
            labels={{
              heading: t.customer.heading,
              name: t.customer.name,
              email: t.customer.email,
              phone: t.customer.phone,
              flightNumber: t.customer.flight,
              message: t.customer.message,
            }}
          />

          <RentalDetailsSection
            rentalDetails={rentalDetails}
            labels={{
              pickupDateTime: t.rental.pickupDateTime,
              returnDateTime: t.rental.returnDateTime,
              pickupLocation: t.rental.pickupLocation,
              returnLocation: t.rental.returnLocation,
            }}
          />

          <Hr className="border-gray-200 my-[4px]" />

          <VehicleInfoSection
            vehicleInfo={vehicleInfo}
            labels={{
              heading: t.vehicle.heading,
              seats: t.vehicle.seats,
              transmission: t.vehicle.transmission,
              fuel: t.vehicle.fuel,
              features: t.vehicle.features,
            }}
          />

          <Hr className="border-gray-200 my-[4px]" />

          <PricingSection
            pricingDetails={pricingDetails}
            rentalDetails={rentalDetails}
            labels={{
              heading: t.pricing.heading,
              rentalLine: t.pricing.rentalLine,
              promoCode: t.pricing.promoCode,
              additionalCharges: t.pricing.additionalCharges,
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

export default AdminReservationEmail;
