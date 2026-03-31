"use client";

import Image from "next/image";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Header
        logo={
          <Image src="/logo.png" alt="Rent'n Go Logo" width={130} height={44} className="h-9 w-auto" />
        }
      />
      <main className="flex-1">{children}</main>
      <Footer
        logo={
          <Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} style={{ width: 'auto', height: 'auto' }} />
        }
        brandName=""
      />
    </div>
  );
}
