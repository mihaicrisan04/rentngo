import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import { Providers } from '../providers';

const locales = ['ro', 'en'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await the params as required by Next.js 15
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  // Get messages for the locale
  const messages = await getMessages({ locale });

  return (
    <Providers locale={locale} messages={messages}>
      {children}
    </Providers>
  );
} 