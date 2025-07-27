import * as React from 'react';
import { Section, Text, Row, Column } from '@react-email/components';
import { RentalDetails } from '@/types/email';

interface RentalDetailsSectionProps {
  rentalDetails: RentalDetails;
}

export const RentalDetailsSection: React.FC<RentalDetailsSectionProps> = ({ 
  rentalDetails 
}) => {
  return (
    <Section className="px-[32px] py-[24px]">
      <Row className="mb-[16px]">
        <Column className="w-1/2 pr-[8px]">
          <Text className="text-[14px] font-semibold text-gray-600 m-0">Pickup Date & Time:</Text>
          <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">
            {rentalDetails.startDate} at {rentalDetails.pickupTime}
          </Text>
        </Column>
        <Column className="w-1/2 pl-[8px]">
          <Text className="text-[14px] font-semibold text-gray-600 m-0">Return Date & Time:</Text>
          <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">
            {rentalDetails.endDate} at {rentalDetails.restitutionTime}
          </Text>
        </Column>
      </Row>

      <Row className="mb-[16px]">
        <Column className="w-1/2 pr-[8px]">
          <Text className="text-[14px] font-semibold text-gray-600 m-0">Pickup Location:</Text>
          <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">{rentalDetails.pickupLocation}</Text>
        </Column>
        <Column className="w-1/2 pl-[8px]">
          <Text className="text-[14px] font-semibold text-gray-600 m-0">Return Location:</Text>
          <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">{rentalDetails.restitutionLocation}</Text>
        </Column>
      </Row>
    </Section>
  );
}; 
