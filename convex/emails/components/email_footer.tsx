import * as React from "react";
import { Section, Text } from "@react-email/components";

interface EmailFooterProps {
  companyName?: string;
  address?: string;
  customMessage?: string;
}

export const EmailFooter: React.FC<EmailFooterProps> = ({
  companyName = "Rent'n Go",
  address = 'Cluj "Avram Iancu" International Airport, Strada Traian Vuia 149-151, Cluj-Napoca, Romania',
  customMessage = "This is an automated notification from Rent'n Go reservation system.",
}) => {
  return (
    <Section
      className="bg-gray-50 py-[16px] text-center m-0"
      style={{ width: "100%" }}
    >
      <Text className="text-[14px] text-gray-600 m-0">{customMessage}</Text>
      <Text className="text-[12px] text-gray-500 m-0 mt-[12px]">
        {companyName} Car Rental Services
        <br />
        {address}
        <br />© 2026 {companyName}. All rights reserved.
      </Text>
    </Section>
  );
};
