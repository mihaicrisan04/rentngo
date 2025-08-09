import * as React from 'react';
import { Section, Text, Row, Column } from '@react-email/components';
import { RentalDetails } from '@/types/email';

interface RentalDetailsSectionProps {
  rentalDetails: RentalDetails;
  labels?: {
    pickupDateTime?: string;
    returnDateTime?: string;
    pickupLocation?: string;
    returnLocation?: string;
  };
}

export const RentalDetailsSection: React.FC<RentalDetailsSectionProps> = ({ 
  rentalDetails,
  labels,
}) => {
  return (
    <Section className="px-[16px] py-[12px]">
      <Row className="mb-[12px]">
        <Column className="w-1/2 pr-[8px]">
          <Text className="text-[14px] font-semibold text-gray-600 m-0">{labels?.pickupDateTime ?? 'Pickup Date & Time:'}</Text>
          <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">
            {rentalDetails.startDate} at {rentalDetails.pickupTime}
          </Text>
        </Column>
        <Column className="w-1/2 pl-[8px]">
          <Text className="text-[14px] font-semibold text-gray-600 m-0">{labels?.returnDateTime ?? 'Return Date & Time:'}</Text>
          <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">
            {rentalDetails.endDate} at {rentalDetails.restitutionTime}
          </Text>
        </Column>
      </Row>

      <Row className="mb-[12px]">
        <Column className="w-1/2 pr-[8px]">
          <Text className="text-[14px] font-semibold text-gray-600 m-0">{labels?.pickupLocation ?? 'Pickup Location:'}</Text>
          <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">{rentalDetails.pickupLocation}</Text>
        </Column>
        <Column className="w-1/2 pl-[8px]">
          <Text className="text-[14px] font-semibold text-gray-600 m-0">{labels?.returnLocation ?? 'Return Location:'}</Text>
          <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">{rentalDetails.restitutionLocation}</Text>
        </Column>
      </Row>
    </Section>
  );
}; 
