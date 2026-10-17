"use client";

import ConvexClientProvider from "@/components/shared/providers/convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from "next-intl";

// next-themes' anti-flash script only needs to run from the server HTML.
// React 19 warns when it renders an executable <script> on the client (e.g. the
// root layout remounting on a locale switch), so mark it inert there.
const themeScriptProps =
  typeof window === "undefined"
    ? undefined
    : ({ type: "application/json" } as const);

// Root providers without locale-specific features
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
          scriptProps={themeScriptProps}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}

// Locale-specific providers
export function LocaleProviders({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: any;
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Europe/Bucharest"
    >
      {children}
    </NextIntlClientProvider>
  );
}
