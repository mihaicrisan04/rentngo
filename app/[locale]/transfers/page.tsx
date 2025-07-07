'use client';

import { Footer } from "@/components/ui/footer";
import { Header } from "@/components/ui/header";
import Image from "next/image";
import { useTranslations } from 'next-intl';

export default function TransfersPage() {
  const t = useTranslations('transfersPage');

  return (
    <div className="flex flex-col min-h-screen">
      <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} brandName="RentNGo" />

      <main className="flex-grow flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold text-center">{t('title')}</h1>
        <p className="text-xl text-muted-foreground text-center mt-4">
          {t('subtitle')}
        </p>
      </main>

      <Footer
        logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />}
        brandName="" // Assuming empty brandName like in app/page.tsx
      />

    </div>
  )
} 