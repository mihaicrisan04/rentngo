import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Row,
  Column,
  Hr,
  Tailwind,
} from '@react-email/components';
import { EmailHeader } from './email-header';
import { EmailFooter } from './email-footer';
import { CustomerInfo } from '@/types/email';

interface TransferLocation {
  address: string;
}

interface TransferVehicleInfo {
  make: string;
  model: string;
  year?: number;
}

interface TransferPricingDetails {
  baseFare: number;
  distancePrice: number;
  totalPrice: number;
  pricePerKm: number;
}

interface TransferEmailData {
  transferNumber: number;
  customerInfo: CustomerInfo;
  vehicleInfo: TransferVehicleInfo;
  pickupLocation: TransferLocation;
  dropoffLocation: TransferLocation;
  pickupDate: string; // Formatted date string
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  transferType: 'one_way' | 'round_trip';
  passengers: number;
  luggageCount?: number;
  distanceKm: number;
  estimatedDurationMinutes: number;
  pricingDetails: TransferPricingDetails;
  paymentMethod: 'cash_on_delivery' | 'card_on_delivery' | 'card_online';
}

interface TransferConfirmationEmailProps {
  data: TransferEmailData;
}

const formatPaymentMethod = (method: string): string => {
  const methods: Record<string, string> = {
    cash_on_delivery: 'Cash on Delivery',
    card_on_delivery: 'Card on Delivery',
    card_online: 'Card Online',
  };
  return methods[method] || method;
};

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

export const TransferConfirmationEmail: React.FC<TransferConfirmationEmailProps> = ({ data }) => {
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

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white mx-auto my-[40px] max-w-[600px] rounded-[8px] shadow-lg">
            <EmailHeader title="Transfer Booking Confirmation" />

            {/* Transfer Number */}
            <Section className="px-[24px] py-[16px] bg-emerald-50 text-center">
              <Text className="text-[14px] text-emerald-700 m-0">Your Transfer Number</Text>
              <Heading className="text-[28px] font-bold text-emerald-800 m-0 mt-[4px]">
                #{transferNumber}
              </Heading>
            </Section>

            {/* Route Details */}
            <Section className="px-[24px] py-[16px]">
              <Heading className="text-[18px] font-bold text-gray-800 mb-[12px]">
                Route Details
              </Heading>
              
              <Row className="mb-[12px]">
                <Column className="w-[24px] text-center">
                  <Text className="text-[16px] m-0">📍</Text>
                </Column>
                <Column>
                  <Text className="text-[12px] text-gray-500 m-0 uppercase tracking-wide">Pickup</Text>
                  <Text className="text-[14px] text-gray-800 m-0 mt-[2px]">{pickupLocation.address}</Text>
                </Column>
              </Row>

              <Row className="mb-[12px]">
                <Column className="w-[24px] text-center">
                  <Text className="text-[16px] m-0">🏁</Text>
                </Column>
                <Column>
                  <Text className="text-[12px] text-gray-500 m-0 uppercase tracking-wide">Dropoff</Text>
                  <Text className="text-[14px] text-gray-800 m-0 mt-[2px]">{dropoffLocation.address}</Text>
                </Column>
              </Row>

              <Hr className="border-gray-200 my-[12px]" />

              <Row>
                <Column className="w-1/2">
                  <Text className="text-[12px] text-gray-500 m-0">Distance</Text>
                  <Text className="text-[14px] font-medium text-gray-800 m-0">{distanceKm} km</Text>
                </Column>
                <Column className="w-1/2">
                  <Text className="text-[12px] text-gray-500 m-0">Est. Duration</Text>
                  <Text className="text-[14px] font-medium text-gray-800 m-0">{formatDuration(estimatedDurationMinutes)}</Text>
                </Column>
              </Row>
            </Section>

            {/* Date & Time */}
            <Section className="px-[24px] py-[16px] bg-gray-50">
              <Heading className="text-[18px] font-bold text-gray-800 mb-[12px]">
                Pickup Date & Time
              </Heading>
              
              <Row>
                <Column className="w-1/2">
                  <Text className="text-[12px] text-gray-500 m-0">Date</Text>
                  <Text className="text-[14px] font-medium text-gray-800 m-0">{pickupDate}</Text>
                </Column>
                <Column className="w-1/2">
                  <Text className="text-[12px] text-gray-500 m-0">Time</Text>
                  <Text className="text-[14px] font-medium text-gray-800 m-0">{pickupTime}</Text>
                </Column>
              </Row>

              {transferType === 'round_trip' && returnDate && returnTime && (
                <>
                  <Hr className="border-gray-200 my-[12px]" />
                  <Text className="text-[12px] text-gray-500 m-0 uppercase tracking-wide mb-[8px]">Return Trip</Text>
                  <Row>
                    <Column className="w-1/2">
                      <Text className="text-[12px] text-gray-500 m-0">Date</Text>
                      <Text className="text-[14px] font-medium text-gray-800 m-0">{returnDate}</Text>
                    </Column>
                    <Column className="w-1/2">
                      <Text className="text-[12px] text-gray-500 m-0">Time</Text>
                      <Text className="text-[14px] font-medium text-gray-800 m-0">{returnTime}</Text>
                    </Column>
                  </Row>
                </>
              )}
            </Section>

            {/* Trip Details */}
            <Section className="px-[24px] py-[16px]">
              <Heading className="text-[18px] font-bold text-gray-800 mb-[12px]">
                Trip Details
              </Heading>
              
              <Row className="mb-[8px]">
                <Column className="w-1/2">
                  <Text className="text-[12px] text-gray-500 m-0">Transfer Type</Text>
                  <Text className="text-[14px] font-medium text-gray-800 m-0 capitalize">
                    {transferType === 'one_way' ? 'One Way' : 'Round Trip'}
                  </Text>
                </Column>
                <Column className="w-1/2">
                  <Text className="text-[12px] text-gray-500 m-0">Passengers</Text>
                  <Text className="text-[14px] font-medium text-gray-800 m-0">{passengers}</Text>
                </Column>
              </Row>

              {luggageCount !== undefined && luggageCount > 0 && (
                <Row className="mb-[8px]">
                  <Column>
                    <Text className="text-[12px] text-gray-500 m-0">Luggage</Text>
                    <Text className="text-[14px] font-medium text-gray-800 m-0">{luggageCount} bags</Text>
                  </Column>
                </Row>
              )}
            </Section>

            {/* Vehicle Info */}
            <Section className="px-[24px] py-[16px] bg-gray-50">
              <Heading className="text-[18px] font-bold text-gray-800 mb-[12px]">
                Vehicle
              </Heading>
              <Text className="text-[16px] font-medium text-gray-800 m-0">
                {vehicleInfo.make} {vehicleInfo.model}
                {vehicleInfo.year && ` (${vehicleInfo.year})`}
              </Text>
            </Section>

            {/* Customer Info */}
            <Section className="px-[24px] py-[16px]">
              <Heading className="text-[18px] font-bold text-gray-800 mb-[12px]">
                Customer Information
              </Heading>
              
              <Row className="mb-[8px]">
                <Column>
                  <Text className="text-[12px] text-gray-500 m-0">Name</Text>
                  <Text className="text-[14px] text-gray-800 m-0">{customerInfo.name}</Text>
                </Column>
              </Row>
              
              <Row className="mb-[8px]">
                <Column className="w-1/2">
                  <Text className="text-[12px] text-gray-500 m-0">Email</Text>
                  <Text className="text-[14px] text-gray-800 m-0">{customerInfo.email}</Text>
                </Column>
                <Column className="w-1/2">
                  <Text className="text-[12px] text-gray-500 m-0">Phone</Text>
                  <Text className="text-[14px] text-gray-800 m-0">{customerInfo.phone}</Text>
                </Column>
              </Row>

              {customerInfo.flightNumber && (
                <Row className="mb-[8px]">
                  <Column>
                    <Text className="text-[12px] text-gray-500 m-0">Flight Number</Text>
                    <Text className="text-[14px] text-gray-800 m-0">{customerInfo.flightNumber}</Text>
                  </Column>
                </Row>
              )}

              {customerInfo.message && (
                <Row className="mb-[8px]">
                  <Column>
                    <Text className="text-[12px] text-gray-500 m-0">Special Requests</Text>
                    <Text className="text-[14px] text-gray-800 m-0 bg-gray-100 p-[12px] rounded-[4px] mt-[4px]">
                      {customerInfo.message}
                    </Text>
                  </Column>
                </Row>
              )}
            </Section>

            {/* Pricing */}
            <Section className="px-[24px] py-[16px] bg-gray-50">
              <Heading className="text-[18px] font-bold text-gray-800 mb-[12px]">
                Pricing Summary
              </Heading>
              
              <Row className="mb-[4px]">
                <Column className="w-2/3">
                  <Text className="text-[14px] text-gray-600 m-0">Base Fare</Text>
                </Column>
                <Column className="w-1/3 text-right">
                  <Text className="text-[14px] text-gray-800 m-0">€{pricingDetails.baseFare.toFixed(2)}</Text>
                </Column>
              </Row>

              <Row className="mb-[4px]">
                <Column className="w-2/3">
                  <Text className="text-[14px] text-gray-600 m-0">
                    Distance Charge {distanceKm >= 20 ? `(${distanceKm - 20} km)` : ''}
                  </Text>
                </Column>
                <Column className="w-1/3 text-right">
                  <Text className="text-[14px] text-gray-800 m-0">€{pricingDetails.distancePrice.toFixed(2)}</Text>
                </Column>
              </Row>

              {transferType === 'round_trip' && (
                <Row className="mb-[4px]">
                  <Column className="w-2/3">
                    <Text className="text-[14px] text-gray-600 m-0">Round Trip (×2)</Text>
                  </Column>
                  <Column className="w-1/3 text-right">
                    <Text className="text-[14px] text-gray-600 m-0">Included</Text>
                  </Column>
                </Row>
              )}

              <Hr className="border-gray-200 my-[8px]" />

              <Row>
                <Column className="w-2/3">
                  <Text className="text-[16px] font-bold text-gray-800 m-0">Total Price</Text>
                </Column>
                <Column className="w-1/3 text-right">
                  <Text className="text-[20px] font-bold text-emerald-600 m-0">
                    €{pricingDetails.totalPrice.toFixed(2)}
                  </Text>
                </Column>
              </Row>

              <Row className="mt-[8px]">
                <Column>
                  <Text className="text-[12px] text-gray-500 m-0">
                    Payment Method: {formatPaymentMethod(paymentMethod)}
                  </Text>
                </Column>
              </Row>
            </Section>

            <EmailFooter customMessage="Thank you for booking with Rent'n Go! Your driver will meet you at the specified pickup location." />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default TransferConfirmationEmail;
