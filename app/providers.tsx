'use client'

import ConvexClientProvider from "@/components/convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { UserEnsurer } from "@/components/user-ensurer";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from 'next-intl';

// Root providers without locale-specific features
export function Providers({
  children,
}: { 
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <UserEnsurer>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange={false}
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </UserEnsurer>
      </ConvexClientProvider>
    </ClerkProvider>
  )
}

// Locale-specific providers
export function LocaleProviders({
  children,
  locale,
  messages
}: { 
  children: React.ReactNode;
  locale: string;
  messages: any;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
