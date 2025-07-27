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
import { EmailHeader } from './email/email-header';
import { EmailFooter } from './email/email-footer';
import { CustomerInfoSection } from './email/customer-info-section';
import { RentalDetailsSection } from './email/rental-details-section';
import { VehicleInfoSection } from './email/vehicle-info-section';
import { PricingSection } from './email/pricing-section';

interface CarRentalReservationEmailProps {
  data: ReservationEmailData;
}

const CarRentalReservationEmail: React.FC<CarRentalReservationEmailProps> = ({ data }) => {
  const { customerInfo, vehicleInfo, rentalDetails, pricingDetails, reservationId } = data;

  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>New car rental reservation request from {customerInfo.name}</Preview>
        <Body className="bg-white font-sans">
          
          <EmailHeader title="New Reservation Request" />

          <CustomerInfoSection 
            customerInfo={customerInfo} 
            reservationId={reservationId} 
          />

          <RentalDetailsSection rentalDetails={rentalDetails} />

          <Hr className="border-gray-200 my-[4px]" />

          <VehicleInfoSection vehicleInfo={vehicleInfo} />

          <Hr className="border-gray-200 my-[4px]" />

          <PricingSection 
            pricingDetails={pricingDetails} 
            rentalDetails={rentalDetails} 
          />

          <EmailFooter />

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
    message: "Please have the vehicle ready at the airport pickup location. I'll be arriving on an international flight.",
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
    features: ["GPS Navigation", "Bluetooth", "Air Conditioning", "Cruise Control"],
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
      { description: "GPS Navigation", amount: 5 },
    ],
  },
};

(CarRentalReservationEmail as any).PreviewProps = previewProps;

export default CarRentalReservationEmail;
