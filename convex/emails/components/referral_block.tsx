import * as React from "react";
import { Hr, Link, Section, Text } from "@react-email/components";
import type { ReferralEmailBlockData } from "../types";
import { COMPANY } from "../../../lib/company";
import { buildReferralUrl } from "../../../lib/referral";

interface ReferralBlockProps {
  referral?: ReferralEmailBlockData;
  locale?: "en" | "ro";
}

const COPY = {
  ro: {
    heading: "Recomandă un prieten",
    affiliateBody:
      "Prietenii tăi primesc o reducere la prima lor rezervare, iar tu primești credit în portofel după ce închirierea lor se încheie.",
    codeLabel: "Codul tău:",
    linkLabel: "Linkul tău:",
    guestBody:
      "Creează-ți un cont și primești propriul cod de recomandare: prietenii tăi au reducere la prima rezervare, iar tu aduni credit pentru următoarele tale închirieri.",
    guestCta: "Creează cont pe rngo.ro",
  },
  en: {
    heading: "Recommend a friend",
    affiliateBody:
      "Your friends get a discount on their first booking, and you get wallet credit once their rental is completed.",
    codeLabel: "Your code:",
    linkLabel: "Your link:",
    guestBody:
      "Create an account to get your own referral code: your friends get a discount on their first booking and you collect credit towards your next rentals.",
    guestCta: "Create an account on rngo.ro",
  },
} as const;

/**
 * Customer-facing referral invitation. Rendered only when the referral
 * program is enabled — the booking mutation leaves `referral` undefined
 * otherwise, and then no block appears at all.
 */
export const ReferralBlock: React.FC<ReferralBlockProps> = ({
  referral,
  locale,
}) => {
  if (!referral) return null;
  const t = COPY[locale === "ro" ? "ro" : "en"];
  const referralUrl =
    referral.kind === "affiliate"
      ? buildReferralUrl(COMPANY.baseUrl, referral.code)
      : COMPANY.baseUrl;

  return (
    <>
      <Hr className="border-gray-200 my-[4px]" />
      <Section className="px-[24px] py-[16px] m-0" style={{ width: "100%" }}>
        <Text className="text-[16px] font-bold text-gray-900 m-0 mb-[8px]">
          {t.heading}
        </Text>
        {referral.kind === "affiliate" ? (
          <>
            <Text className="text-[14px] text-gray-700 m-0 mb-[8px]">
              {t.affiliateBody}
            </Text>
            <Text className="text-[14px] text-gray-900 m-0">
              {t.codeLabel} <strong>{referral.code.toUpperCase()}</strong>
            </Text>
            <Text className="text-[14px] text-gray-900 m-0 mt-[4px]">
              {t.linkLabel} <Link href={referralUrl}>{referralUrl}</Link>
            </Text>
          </>
        ) : (
          <>
            <Text className="text-[14px] text-gray-700 m-0 mb-[8px]">
              {t.guestBody}
            </Text>
            <Link className="text-[14px]" href={referralUrl}>
              {t.guestCta}
            </Link>
          </>
        )}
      </Section>
    </>
  );
};
