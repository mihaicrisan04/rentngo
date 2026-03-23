import { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";

interface ReservationLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ReservationLayoutProps): Promise<Metadata> {
  const { locale } = await params;

  return buildMetadata({
    locale,
    path: "/reservation",
    title: {
      ro: "Rezervare",
      en: "Reservation",
    },
    description: {
      ro: "Finalizează rezervarea ta cu Rent'n Go Cluj-Napoca.",
      en: "Complete your reservation with Rent'n Go Cluj-Napoca.",
    },
    noIndex: true,
  });
}

export default function ReservationLayout({ children }: ReservationLayoutProps) {
  return <>{children}</>;
}
