"use client";

import { Suspense } from "react";
import Image from "next/image";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Header reads usePathname for active-link styling. Static routes
          still prerender it into their shells; on dynamic routes (unknown
          URL at build time, e.g. transfer confirmation) the shell renders
          without it until the URL is known. */}
      <Suspense fallback={null}>
        <Header
          logo={
            <Image
              src="/logo.png"
              alt="Rent'n Go Logo"
              width={130}
              height={44}
              className="h-9 w-auto"
            />
          }
        />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer
        logo={
          <Image
            src="/logo.png"
            alt="Rent'n Go Logo"
            width={150}
            height={50}
            className="h-10 w-auto"
          />
        }
        brandName=""
      />
    </div>
  );
}
