import { Plus_Jakarta_Sans, Outfit, Geist_Mono } from "next/font/google";

// Shared font instances for both root layouts ([locale] and admin).
// next/font instantiations are deduplicated per module, so importing these
// from multiple root layouts is safe and keeps the CSS variables identical.
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const fontClassNames = `${plusJakarta.variable} ${outfit.variable} ${geistMono.variable} antialiased`;
