import * as React from "react";
import {
  Section,
  Heading,
  Text,
  Row,
  Column,
  Hr,
} from "@react-email/components";
import { TransferPricingDetails } from "../types";
import { getPaymentMethodLabel, formatCurrency } from "../utils";

interface TransferPricingSectionProps {
  pricingDetails: TransferPricingDetails;
  paymentMethod: "cash_on_delivery" | "card_on_delivery" | "card_online";
  transferType: "one_way" | "round_trip";
  distanceKm: number;
  labels?: {
    heading?: string;
    distance?: string;
    roundTrip?: string;
    totalAmount?: string;
    paymentMethod?: string;
  };
}

export const TransferPricingSection: React.FC<TransferPricingSectionProps> = ({
  pricingDetails,
  paymentMethod,
  transferType,
  distanceKm,
  labels,
}) => {
  return (
    <Section className="px-[16px] py-[12px]">
      <Heading className="text-[20px] font-bold text-gray-800 mb-[12px]">
        {labels?.heading ?? "Pricing Details"}
      </Heading>

      <Row className="mb-[8px]">
        <Column className="w-2/3">
          <Text className="text-[16px] text-gray-800 m-0">
            {labels?.distance ?? "Distance:"}
          </Text>
        </Column>
        <Column className="w-1/3 text-right">
          <Text className="text-[16px] text-gray-800 m-0">
            {distanceKm} km
            {transferType === "round_trip" && (
              <span className="text-gray-600 text-[14px]"> ({labels?.roundTrip ?? "Round Trip"})</span>
            )}
          </Text>
        </Column>
      </Row>

      <Hr className="border-gray-300 my-[12px]" />

      <Row className="mb-[12px]">
        <Column className="w-2/3">
          <Text className="text-[18px] font-bold text-gray-800 m-0">
            {labels?.totalAmount ?? "Total Amount:"}
          </Text>
        </Column>
        <Column className="w-1/3 text-right">
          <Text className="text-[18px] font-bold text-gray-800 m-0">
            {formatCurrency(pricingDetails.totalPrice)}
          </Text>
        </Column>
      </Row>

      <Row>
        <Column>
          <Text className="text-[14px] font-semibold text-gray-600 m-0">
            {labels?.paymentMethod ?? "Payment Method:"}
          </Text>
          <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">
            {getPaymentMethodLabel(paymentMethod)}
          </Text>
        </Column>
      </Row>
    </Section>
  );
};

