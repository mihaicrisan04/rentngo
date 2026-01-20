import * as React from 'react';
import {
  Body,
  Head,
  Html,
  Preview,
  Hr,
  Tailwind,
} from '@react-email/components';
import { ReservationEmailData, EmailPreviewProps } from '@/types/email';
import { EmailHeader } from './email-header';
import { EmailFooter } from './email-footer';
import { CustomerInfoSection } from './customer-info-section';
import { RentalDetailsSection } from './rental-details-section';
import { VehicleInfoSection } from './vehicle-info-section';
import { PricingSection } from './pricing-section';

interface UserReservationEmailProps {
  data: ReservationEmailData;
}

const UserReservationEmail: React.FC<UserReservationEmailProps> = ({ data }) => {
  const { customerInfo, vehicleInfo, rentalDetails, pricingDetails, reservationNumber, locale } = data;

  const isRo = locale === 'ro';
  const t = {
    title: isRo ? `Cerere trimisă #${reservationNumber}` : `Request submitted #${reservationNumber}`,
    customer: {
      heading: isRo ? 'Detalii Rezervare' : 'Reservation Details',
      name: isRo ? 'Nume Client:' : 'Customer Name:',
      email: 'Email:',
      phone: isRo ? 'Telefon:' : 'Phone:',
      flight: isRo ? 'Număr Zbor:' : 'Flight Number:',
      message: isRo ? 'Mesaj Client:' : 'Customer Message:',
    },
    rental: {
      pickupDateTime: isRo ? 'Data și Ora Ridicării:' : 'Pickup Date & Time:',
      returnDateTime: isRo ? 'Data și Ora Returnării:' : 'Return Date & Time:',
      pickupLocation: isRo ? 'Locația de Ridicare:' : 'Pickup Location:',
      returnLocation: isRo ? 'Locația de Returnare:' : 'Return Location:',
    },
    vehicle: {
      heading: isRo ? 'Informații Vehicul' : 'Vehicle Information',
      seats: isRo ? 'Locuri:' : 'Seats:',
      transmission: isRo ? 'Transmisie:' : 'Transmission:',
      fuel: isRo ? 'Combustibil:' : 'Fuel Type:',
      features: isRo ? 'Caracteristici:' : 'Features:',
    },
    pricing: {
      heading: isRo ? 'Detalii Preț' : 'Pricing Details',
      rentalLine: (days: number, pricePerDay: number) =>
        isRo
          ? `Închiriere (${days} ${days === 1 ? 'zi' : 'zile'} × ${pricePerDay} EUR/zi):`
          : `Rental (${days} ${days === 1 ? 'day' : 'days'} × ${pricePerDay} EUR/day):`,
      promoCode: isRo ? 'Cod Promoțional Aplicat:' : 'Promo Code Applied:',
      additionalCharges: isRo ? 'Taxă Suplimentară' : 'Additional Charge',
      totalAmount: isRo ? 'Sumă Totală:' : 'Total Amount:',
      paymentMethod: isRo ? 'Metoda de Plată:' : 'Payment Method:',
      scdwText: isRo ? 'SCDW (nerestituibilă)' : 'SCDW (zero deductible)',
      warrantyText: isRo ? 'Garanție (restituibilă)' : 'Warranty (deductible)',
    },
    footerMessage: isRo
      ? "Am primit cererea ta. Echipa noastră te va contacta în curând pentru confirmare."
      : "We've received your request. Our team will contact you soon to confirm.",
  };

  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>Your reservation request was received</Preview>
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

// Preview props for email development and testing
const previewProps: EmailPreviewProps = {
  reservationId: "RNG-2025-001234",
  customerInfo: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+40 123 456 789",
    message: "Please have the vehicle ready at the airport pickup location.",
    flightNumber: "RO 123",
  },
  vehicleInfo: {
    make: "BMW",
    model: "X3",
    year: 2023,
    type: "suv",
    seats: 5,
    transmission: "automatic",
    fuelType: "diesel",
    features: ["GPS Navigation", "Bluetooth", "Air Conditioning"],
  },
  rentalDetails: {
    startDate: "March 15, 2025",
    endDate: "March 20, 2025",
    numberOfDays: 5,
    pickupTime: "10:00",
    restitutionTime: "18:00",
    pickupLocation: "Cluj-Napoca Airport",
    restitutionLocation: "Cluj-Napoca Airport",
  },
  pricingDetails: {
    pricePerDay: 85,
    totalPrice: 450,
    paymentMethod: "card_on_delivery",
    promoCode: "WELCOME10",
    additionalCharges: [
      { description: "Airport pickup fee", amount: 15 },
    ],
  },
};

(UserReservationEmail as any).PreviewProps = previewProps;

export default UserReservationEmail;


