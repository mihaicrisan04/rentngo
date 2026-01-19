import * as React from "react";
import { Section, Heading, Text, Row, Column } from "@react-email/components";
import { CustomerInfo } from "../types";

interface CustomerInfoSectionProps {
  customerInfo: CustomerInfo;
  reservationId: string;
  labels?: {
    heading?: string;
    name?: string;
    email?: string;
    phone?: string;
    flightNumber?: string;
    message?: string;
  };
}

export const CustomerInfoSection: React.FC<CustomerInfoSectionProps> = ({
  customerInfo,
  labels,
}) => {
  return (
    <Section className="px-[16px] py-[12px]">
      <Heading className="text-[20px] font-bold text-gray-800 mb-[12px]">
        {labels?.heading ?? "Reservation Details"}
      </Heading>

      <Row className="mb-[12px]">
        <Column>
          <Text className="text-[14px] font-semibold text-gray-600 m-0">
            {labels?.name ?? "Customer Name:"}
          </Text>
          <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">
            {customerInfo.name}
          </Text>
        </Column>
      </Row>

      <Row className="mb-[12px]">
        <Column>
          <Text className="text-[14px] font-semibold text-gray-600 m-0">
            {labels?.email ?? "Email:"}
          </Text>
          <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">
            {customerInfo.email}
          </Text>
        </Column>
      </Row>

      <Row className="mb-[12px]">
        <Column className="w-1/2 pr-[8px]">
          <Text className="text-[14px] font-semibold text-gray-600 m-0">
            {labels?.phone ?? "Phone:"}
          </Text>
          <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">
            {customerInfo.phone}
          </Text>
        </Column>
        {customerInfo.flightNumber && (
          <Column className="w-1/2 pl-[8px]">
            <Text className="text-[14px] font-semibold text-gray-600 m-0">
              {labels?.flightNumber ?? "Flight Number:"}
            </Text>
            <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">
              {customerInfo.flightNumber}
            </Text>
          </Column>
        )}
      </Row>

      {customerInfo.message && (
        <Row className="mb-[12px]">
          <Column>
            <Text className="text-[14px] font-semibold text-gray-600 m-0">
              {labels?.message ?? "Customer Message:"}
            </Text>
            <Text className="text-[16px] text-gray-800 m-0 mt-[4px] bg-gray-50 p-[12px] rounded-[4px]">
              {customerInfo.message}
            </Text>
          </Column>
        </Row>
      )}
    </Section>
  );
};
