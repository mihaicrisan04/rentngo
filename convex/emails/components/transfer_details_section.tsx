import * as React from "react";
import { Section, Heading, Text, Row, Column } from "@react-email/components";
import { TransferLocation } from "../types";

interface TransferDetailsSectionProps {
  pickupLocation: TransferLocation;
  dropoffLocation: TransferLocation;
  pickupDate: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  transferType: "one_way" | "round_trip";
  passengers: number;
  luggageCount?: number;
  distanceKm: number;
  estimatedDurationMinutes: number;
  labels?: {
    heading?: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    pickupDateTime?: string;
    returnDateTime?: string;
    transferType?: string;
    oneWay?: string;
    roundTrip?: string;
    passengers?: string;
    luggage?: string;
    distance?: string;
    duration?: string;
  };
}

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

export const TransferDetailsSection: React.FC<TransferDetailsSectionProps> = ({
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
  labels,
}) => {
  return (
    <Section className="px-[16px] py-[12px]">
      <Heading className="text-[20px] font-bold text-gray-800 mb-[12px]">
        {labels?.heading ?? "Transfer Details"}
      </Heading>

      {/* Locations */}
      <Row className="mb-[12px]">
        <Column className="w-1/2 pr-[8px]">
          <Text className="text-[14px] font-semibold text-gray-600 m-0">
            {labels?.pickupLocation ?? "Pickup Location:"}
          </Text>
          <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">
            {pickupLocation.address}
          </Text>
        </Column>
        <Column className="w-1/2 pl-[8px]">
          <Text className="text-[14px] font-semibold text-gray-600 m-0">
            {labels?.dropoffLocation ?? "Dropoff Location:"}
          </Text>
          <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">
            {dropoffLocation.address}
          </Text>
        </Column>
      </Row>

      {/* Date & Time */}
      <Row className="mb-[12px]">
        <Column className="w-1/2 pr-[8px]">
          <Text className="text-[14px] font-semibold text-gray-600 m-0">
            {labels?.pickupDateTime ?? "Pickup Date & Time:"}
          </Text>
          <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">
            {pickupDate} at {pickupTime}
          </Text>
        </Column>
        {transferType === "round_trip" && returnDate && returnTime && (
          <Column className="w-1/2 pl-[8px]">
            <Text className="text-[14px] font-semibold text-gray-600 m-0">
              {labels?.returnDateTime ?? "Return Date & Time:"}
            </Text>
            <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">
              {returnDate} at {returnTime}
            </Text>
          </Column>
        )}
      </Row>

      {/* Transfer Type & Passengers */}
      <Row className="mb-[12px]">
        <Column className="w-1/3 pr-[8px]">
          <Text className="text-[14px] font-semibold text-gray-600 m-0">
            {labels?.transferType ?? "Transfer Type:"}
          </Text>
          <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">
            {transferType === "one_way"
              ? labels?.oneWay ?? "One Way"
              : labels?.roundTrip ?? "Round Trip"}
          </Text>
        </Column>
        <Column className="w-1/3 px-[8px]">
          <Text className="text-[14px] font-semibold text-gray-600 m-0">
            {labels?.passengers ?? "Passengers:"}
          </Text>
          <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">
            {passengers}
          </Text>
        </Column>
        {luggageCount !== undefined && luggageCount > 0 && (
          <Column className="w-1/3 pl-[8px]">
            <Text className="text-[14px] font-semibold text-gray-600 m-0">
              {labels?.luggage ?? "Luggage:"}
            </Text>
            <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">
              {luggageCount}
            </Text>
          </Column>
        )}
      </Row>

      {/* Distance & Duration */}
      <Row className="mb-[12px]">
        <Column className="w-1/2 pr-[8px]">
          <Text className="text-[14px] font-semibold text-gray-600 m-0">
            {labels?.distance ?? "Distance:"}
          </Text>
          <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">
            {distanceKm} km
          </Text>
        </Column>
        <Column className="w-1/2 pl-[8px]">
          <Text className="text-[14px] font-semibold text-gray-600 m-0">
            {labels?.duration ?? "Est. Duration:"}
          </Text>
          <Text className="text-[16px] text-gray-800 m-0 mt-[4px]">
            {formatDuration(estimatedDurationMinutes)}
          </Text>
        </Column>
      </Row>
    </Section>
  );
};

