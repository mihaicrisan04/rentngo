'use client'

import ConvexClientProvider from "@/components/convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { UserEnsurer } from "@/components/user-ensurer";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from 'next-intl';

export function Providers({
  children,
  locale = 'ro',
  messages = {}
}: { 
  children: React.ReactNode;
  locale?: string;
  messages?: any;
}) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <UserEnsurer>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={false}
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </NextIntlClientProvider>
        </UserEnsurer>
      </ConvexClientProvider>
    </ClerkProvider>
  )
}