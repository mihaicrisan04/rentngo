import { Clock, CreditCard, LifeBuoy, Plane, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export interface TrustItem {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function useTrustItems(): TrustItem[] {
  const t = useTranslations("homepage.trustBar");

  return [
    { icon: CreditCard, label: t("noCard"), value: t("noCardDesc") },
    { icon: Plane, label: t("airport"), value: t("airportDesc") },
    { icon: Clock, label: t("support"), value: t("supportDesc") },
    { icon: LifeBuoy, label: t("roadside"), value: t("roadsideDesc") },
  ];
}
