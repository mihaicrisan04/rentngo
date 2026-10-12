import type { Metadata } from "next";
import { NO_INDEX_METADATA } from "@/lib/metadata";

export const metadata: Metadata = NO_INDEX_METADATA;

export default function TransferVehiclesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
