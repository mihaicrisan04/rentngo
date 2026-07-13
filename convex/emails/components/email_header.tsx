import * as React from "react";
import { Section, Img, Text } from "@react-email/components";

// SITE_URL is set per Convex deployment (https://dev.rngo.ro on develop) so
// demo emails don't point back at the production site.
const SITE_URL = process.env.SITE_URL || "https://rngo.ro";

interface EmailHeaderProps {
  title: string;
  logoUrl?: string;
  logoAlt?: string;
}

export const EmailHeader: React.FC<EmailHeaderProps> = ({
  title,
  logoUrl = `${SITE_URL}/_next/image?url=%2Flogo.png&w=256&q=75`,
  logoAlt = "Rent'n Go Logo",
}) => {
  return (
    <Section
      className="bg-white text-center py-[16px] rounded-t-[8px] border-b border-solid border-gray-200 px-0"
      style={{ width: "100%" }}
    >
      <Img
        src={logoUrl}
        alt={logoAlt}
        className="w-[120px] h-auto object-cover mx-auto mb-[8px]"
      />
      <Text className="text-[16px] text-gray-700 m-0">{title}</Text>
    </Section>
  );
};
