import * as React from 'react';
import { Section, Text } from '@react-email/components';

interface EmailFooterProps {
  companyName?: string;
  address?: string;
  customMessage?: string;
}

export const EmailFooter: React.FC<EmailFooterProps> = ({ 
  companyName = "Rent'n Go",
  address = "Calea Turzii 23, Cluj-Napoca, Romania",
  customMessage = "This is an automated notification from Rent'n Go reservation system."
}) => {
  return (
    <Section className="bg-gray-50 py-[24px] text-center m-0">
      <Text className="text-[14px] text-gray-600 m-0">
        {customMessage}
      </Text>
      <Text className="text-[12px] text-gray-500 m-0 mt-[16px]">
        {companyName} Car Rental Services<br />
        {address}<br />
        © 2025 {companyName}. All rights reserved.
      </Text>
    </Section>
  );
}; 