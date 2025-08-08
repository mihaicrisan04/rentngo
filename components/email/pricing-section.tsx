import * as React from 'react';
import { Section, Heading, Text, Row, Column, Hr } from '@react-email/components';
import { PricingDetails, RentalDetails } from '@/types/email';
import { calculatePricingBreakdown, getPaymentMethodLabel, formatCurrency } from '@/lib/emailUtils';

interface PricingSectionProps {
  pricingDetails: PricingDetails;
  rentalDetails: RentalDetails;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ 
  pricingDetails, 
  rentalDetails 
}) => {
  const { rentalSubtotal } = calculatePricingBreakdown(
    pricingDetails.pricePerDay,
    rentalDetails.numberOfDays,
    pricingDetails.additionalCharges
  );

  return (
    <Section className="px-[16px] py-[12px]">
      <Heading className="text-[20px] font-bold text-gray-800 mb-[12px]">
        Pricing Details
      </Heading>

      <Row className="mb-[8px]">
        <Column className="w-2/3">
          <Text className="text-[16px] text-gray-800 m-0">
            Rental ({rentalDetails.numberOfDays} {rentalDetails.numberOfDays === 1 ? 'day' : 'days'} × {formatCurrency(pricingDetails.pricePerDay)}/day):
          </Text>
        </Column>
        <Column className="w-1/3 text-right">
          <Text className="text-[16px] text-gray-800 m-0">
            {formatCurrency(rentalSubtotal)}
          </Text>
        </Column>
      </Row>

      {pricingDetails.promoCode && (
        <Row className="mb-[8px]">
          <Column className="w-2/3">
            <Text className="text-[16px] text-green-600 m-0">Promo Code Applied:</Text>
          </Column>
          <Column className="w-1/3 text-right">
            <Text className="text-[16px] text-green-600 m-0">{pricingDetails.promoCode}</Text>
          </Column>
        </Row>
      )}

      {pricingDetails.additionalCharges && pricingDetails.additionalCharges.map((charge, index) => (
        <Row key={index} className="mb-[8px]">
          <Column className="w-2/3">
            <Text className="text-[16px] text-gray-800 m-0">{charge.description}:</Text>
          </Column>
          <Column className="w-1/3 text-right">
            <Text className="text-[16px] text-gray-800 m-0">
              {formatCurrency(charge.amount)}
            </Text>
          </Column>
        </Row>
      ))}

      <Hr className="border-gray-300 my-[12px]" />

      <Row className="mb-[12px]">
        <Column className="w-2/3">
          <Text className="text-[18px] font-bold text-gray-800 m-0">Total Amount:</Text>
        </Column>
        <Column className="w-1/3 text-right">
          <Text className="text-[18px] font-bold text-gray-800 m-0">
            {formatCurrency(pricingDetails.totalPrice)}
          </Text>
        </Column>
      </Row>

      <Row>
        <Column>
          <Text className="text-[14px] font-semibold text-gray-600 m-0">Payment Method:</Text>
          <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">
            {getPaymentMethodLabel(pricingDetails.paymentMethod)}
          </Text>
        </Column>
      </Row>
    </Section>
  );
}; 
