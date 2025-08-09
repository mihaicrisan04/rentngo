import * as React from 'react';
import { Section, Heading, Text, Row, Column, Hr } from '@react-email/components';
import { PricingDetails, RentalDetails } from '@/types/email';
import { calculatePricingBreakdown, getPaymentMethodLabel, formatCurrency } from '@/lib/emailUtils';

interface PricingSectionProps {
  pricingDetails: PricingDetails;
  rentalDetails: RentalDetails;
  labels?: {
    heading?: string;
    rentalLine?: (days: number, pricePerDay: number) => string; // preformatted line
    promoCode?: string;
    additionalCharges?: string;
    totalAmount?: string;
    paymentMethod?: string;
    scdwText?: string; // e.g., "SCDW (zero deductible)"
    warrantyText?: string; // e.g., "Warranty (deductible)"
  };
}

export const PricingSection: React.FC<PricingSectionProps> = ({ 
  pricingDetails, 
  rentalDetails,
  labels,
}) => {
  const { rentalSubtotal } = calculatePricingBreakdown(
    pricingDetails.pricePerDay,
    rentalDetails.numberOfDays,
    pricingDetails.additionalCharges
  );

  return (
    <Section className="px-[16px] py-[12px]">
      <Heading className="text-[20px] font-bold text-gray-800 mb-[12px]">
        {labels?.heading ?? 'Pricing Details'}
      </Heading>

      <Row className="mb-[8px]">
        <Column className="w-2/3">
          <Text className="text-[16px] text-gray-800 m-0">
            {labels?.rentalLine
              ? labels.rentalLine(rentalDetails.numberOfDays, pricingDetails.pricePerDay)
              : `Rental (${rentalDetails.numberOfDays} ${rentalDetails.numberOfDays === 1 ? 'day' : 'days'} × ${formatCurrency(pricingDetails.pricePerDay)}/day):`}
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
            <Text className="text-[16px] text-green-600 m-0">{labels?.promoCode ?? 'Promo Code Applied:'}</Text>
          </Column>
          <Column className="w-1/3 text-right">
            <Text className="text-[16px] text-green-600 m-0">{pricingDetails.promoCode}</Text>
          </Column>
        </Row>
      )}

      {pricingDetails.additionalCharges && pricingDetails.additionalCharges.map((charge, index) => (
        <Row key={index} className="mb-[8px]">
          <Column className="w-2/3">
            <Text className="text-[16px] text-gray-800 m-0">{labels?.additionalCharges ?? 'Additional Charge'}{labels?.additionalCharges ? '' : ''}{labels?.additionalCharges ? '' : ''}{charge.description ? `: ${charge.description}` : ''}</Text>
          </Column>
          <Column className="w-1/3 text-right">
            <Text className="text-[16px] text-gray-800 m-0">
              {formatCurrency(charge.amount)}
            </Text>
          </Column>
        </Row>
      ))}

      {/* Show SCDW as a line item at the end of pricing details (before total) */}
      {pricingDetails.isSCDWSelected && (pricingDetails.protectionCost || 0) > 0 && (
        <Row className="mb-[8px]">
          <Column className="w-2/3">
            <Text className="text-[16px] text-gray-800 m-0">{labels?.scdwText ?? 'SCDW (zero deductible)'}:</Text>
          </Column>
          <Column className="w-1/3 text-right">
            <Text className="text-[16px] text-gray-800 m-0">
              {formatCurrency(pricingDetails.protectionCost || 0)}
            </Text>
          </Column>
        </Row>
      )}

      <Hr className="border-gray-300 my-[12px]" />

      <Row className="mb-[12px]">
        <Column className="w-2/3">
          <Text className="text-[18px] font-bold text-gray-800 m-0">{labels?.totalAmount ?? 'Total Amount:'}</Text>
        </Column>
        <Column className="w-1/3 text-right">
          <Text className="text-[18px] font-bold text-gray-800 m-0">
            {formatCurrency(pricingDetails.totalPrice)}
          </Text>
        </Column>
      </Row>

      {/* Protection note for Warranty (deposit) shown under total only when SCDW is not selected */}
      {!pricingDetails.isSCDWSelected && pricingDetails.deductibleAmount !== undefined && (
        <Row className="mb-[12px]">
          <Column>
            <Text className="text-[14px] text-gray-800 m-0">
              {(labels?.warrantyText ?? 'Warranty (deductible)') + ': '} {formatCurrency(pricingDetails.deductibleAmount || 0)}
            </Text>
          </Column>
        </Row>
      )}

      <Row>
        <Column>
          <Text className="text-[14px] font-semibold text-gray-600 m-0">{labels?.paymentMethod ?? 'Payment Method:'}</Text>
          <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">
            {getPaymentMethodLabel(pricingDetails.paymentMethod)}
          </Text>
        </Column>
      </Row>
    </Section>
  );
}; 
