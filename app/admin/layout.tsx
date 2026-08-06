import "../globals.css";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { GoogleTagManager } from "@next/third-parties/google";
import { fontClassNames } from "../fonts";
import { Providers } from "../providers";
import { AdminShell } from "./admin-shell";

export const metadata: Metadata = {
  title: {
    default: "Admin | Rent'n Go Cluj-Napoca",
    template: "%s | Rent'n Go Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

// Root layout for the admin app (separate root from the public [locale] tree,
// so the public site can be statically rendered per locale).
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      <body className={fontClassNames}>
        <Providers>
          {/* AdminShell reads usePathname; the boundary keeps dynamic admin
              routes (e.g. /admin/vehicles/classes/[classId]) prerenderable
              under `cacheComponents`. */}
          <Suspense fallback={null}>
            <AdminShell>{children}</AdminShell>
          </Suspense>
        </Providers>
        {/* Same Suspense requirement as the public layout: Analytics reads
            the URL internally. */}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <SpeedInsights />
      </body>
    </html>
  );
}
