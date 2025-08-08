import * as React from 'react';
import { Section, Heading, Text, Row, Column } from '@react-email/components';
import { VehicleInfo } from '@/types/email';

interface VehicleInfoSectionProps {
  vehicleInfo: VehicleInfo;
}

export const VehicleInfoSection: React.FC<VehicleInfoSectionProps> = ({ 
  vehicleInfo 
}) => {
  return (
    <Section className="px-[16px] py-[12px]">
      <Heading className="text-[20px] font-bold text-gray-800 mb-[12px]">
        Vehicle Information
      </Heading>

      <Row className="mb-[12px]">
        <Column>
          <Text className="text-[18px] font-semibold text-gray-800 m-0">
            {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
          </Text>
          {vehicleInfo.type && (
            <Text className="text-[14px] text-gray-600 m-0 mt-[4px] capitalize">
              {vehicleInfo.type}
            </Text>
          )}
        </Column>
      </Row>

      <Row className="mb-[12px]">
        {vehicleInfo.seats && (
          <Column className="w-1/3 pr-[8px]">
            <Text className="text-[14px] font-semibold text-gray-600 m-0">Seats:</Text>
            <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">{vehicleInfo.seats}</Text>
          </Column>
        )}
        {vehicleInfo.transmission && (
          <Column className="w-1/3 px-[8px]">
            <Text className="text-[14px] font-semibold text-gray-600 m-0">Transmission:</Text>
            <Text className="text-[16px] text-gray-800 m-0 mt-[4px] capitalize">
              {vehicleInfo.transmission}
            </Text>
          </Column>
        )}
        {vehicleInfo.fuelType && (
          <Column className="w-1/3 pl-[8px]">
            <Text className="text-[14px] font-semibold text-gray-600 m-0">Fuel Type:</Text>
            <Text className="text-[16px] text-gray-800 m-0 mt-[4px] capitalize">
              {vehicleInfo.fuelType}
            </Text>
          </Column>
        )}
      </Row>

      {vehicleInfo.features && vehicleInfo.features.length > 0 && (
        <Row className="mb-[12px]">
          <Column>
            <Text className="text-[14px] font-semibold text-gray-600 m-0">Features:</Text>
            <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">
              {vehicleInfo.features.join(', ')}
            </Text>
          </Column>
        </Row>
      )}
    </Section>
  );
}; 
