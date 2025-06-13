"use client";

import Image from "next/image";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />
      
      <main className={`flex-grow ${className}`}>
        {children}
      </main>
      
      <Footer 
        logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} 
        brandName=""
      />
    </div>
  );
} 