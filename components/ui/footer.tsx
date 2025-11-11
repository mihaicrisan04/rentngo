"use client";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
import { SocialIcon } from "react-social-icons";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

interface FooterProps {
  logo: React.ReactNode;
  brandName?: string;
}

const socialLinks = [
  {
    icon: (
      <SocialIcon
        url="https://www.tiktok.com/@rentn.go"
        style={{ height: 36, width: 36 }}
        borderRadius={"0.5rem"}
      />
    ),
    href: "https://www.tiktok.com/@rentngo",
    label: "TikTok",
  },
  {
    icon: (
      <SocialIcon
        url="https://www.instagram.com/rentn_go.ro"
        style={{ height: 36, width: 36 }}
        borderRadius={"0.5rem"}
      />
    ),
    href: "https://www.instagram.com/rentn_go.ro",
    label: "Instagram",
  },
  {
    icon: (
      <SocialIcon
        url="https://www.facebook.com/share/1Ad82uMtP3/?mibextid=wwXIfr"
        style={{ height: 36, width: 36 }}
        borderRadius={"0.5rem"}
      />
    ),
    href: "https://www.facebook.com/share/1Ad82uMtP3/?mibextid=wwXIfr",
    label: "Facebook",
  },
];

export function Footer({ logo, brandName }: FooterProps) {
  const t = useTranslations("footer");
  const locale = useLocale();

  const mainLinks = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/cars`, label: t("cars") },
    { href: `/${locale}/transfers`, label: t("transfers") },
    { href: `/${locale}/about`, label: t("about") },
    { href: `/${locale}/contact`, label: t("contact") },
  ];

  const legalLinks = [
    { href: `/${locale}/privacy`, label: t("privacy") },
    { href: `/${locale}/terms`, label: t("terms") },
  ];

  return (
    <footer className="pb-6 pt-16 lg:pb-8 px-4 lg:pt-24 bg-muted border-t">
      <div className="container mx-auto max-w-6xl lg:px-8">
        <div className="md:flex md:items-end md:justify-between">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-x-2"
            aria-label={brandName || "Go to homepage"}
          >
            {logo}
            {brandName && (
              <span className="font-bold text-xl">{brandName}</span>
            )}
          </Link>
          <div className="flex items-center gap-3 mt-6 md:mt-0">
            <ul className="flex list-none space-x-3">
              {socialLinks.map((link, i) => (
                <li key={i} className="h-9 w-9 rounded-full">
                  {link.icon}
                </li>
              ))}
            </ul>
            <ThemeToggle />
          </div>
        </div>
        <div className="border-t mt-6 pt-6 md:mt-8 md:pt-8 lg:grid lg:grid-cols-10 lg:gap-8">
          <nav className="lg:col-start-5 lg:col-span-6 xl:col-start-6 xl:col-span-5 mb-6 lg:mb-0">
            <ul className="list-none flex flex-wrap -my-1 -mx-2 lg:justify-end">
              {mainLinks.map((link, i) => (
                <li key={i} className="my-1 mx-2 shrink-0">
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/80 hover:text-primary hover:underline underline-offset-4 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="lg:col-start-5 lg:col-span-6 xl:col-start-6 xl:col-span-5 mb-6 lg:mb-0">
            <ul className="list-none flex flex-wrap -my-1 -mx-3 lg:justify-end">
              {legalLinks.map((link, i) => (
                <li key={i} className="my-1 mx-3 shrink-0">
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 text-sm leading-6 text-muted-foreground whitespace-nowrap lg:mt-0 lg:row-start-1 lg:col-span-4 xl:col-span-5">
            <div>{t("copyright")}</div>
            <div>{t("allRightsReserved")}</div>
            <div className="flex items-center gap-1 mt-2">
              <span>{t("builtBy")}</span>
              <Link
                href="https://mihaicrisan.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline underline-offset-4 transition-colors"
              >
                Mihai Crisan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
