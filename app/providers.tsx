'use client'

import ConvexClientProvider from "@/components/convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { UserEnsurer } from "@/components/user-ensurer";
import { Toaster } from "@/components/ui/sonner";

export function Providers({children}: { children: React.ReactNode }) {
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