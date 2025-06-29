import * as React from 'react';
import { Section, Img, Text } from '@react-email/components';

interface EmailHeaderProps {
  title: string;
  logoUrl?: string;
  logoAlt?: string;
}

export const EmailHeader: React.FC<EmailHeaderProps> = ({ 
  title, 
  logoUrl = "https://rngo.ro/_next/image?url=%2Flogo.png&w=256&q=75",
  logoAlt = "Rent'n Go Logo"
}) => {
  return (
    <Section className="bg-white text-center py-[32px] rounded-t-[8px] border-b border-solid border-gray-200">
      <Img
        src={logoUrl}
        alt={logoAlt}
        className="w-[120px] h-auto object-cover mx-auto mb-[16px]"
      />
      <Text className="text-[18px] text-gray-700 m-0">{title}</Text>
    </Section>
  );
}; 