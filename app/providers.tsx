'use client'

import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { UserEnsurer } from "@/components/UserEnsurer";
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