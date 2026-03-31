import { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";

interface ProfileLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ProfileLayoutProps): Promise<Metadata> {
  const { locale } = await params;

  return buildMetadata({
    locale,
    path: "/profile",
    title: {
      ro: "Profilul Meu",
      en: "My Profile",
    },
    description: {
      ro: "Profilul tău Rent'n Go.",
      en: "Your Rent'n Go profile.",
    },
    noIndex: true,
  });
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return <>{children}</>;
}
