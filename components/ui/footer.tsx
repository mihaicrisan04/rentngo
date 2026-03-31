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
  const t = useTranslations("common");
  const tFooter = useTranslations("footer");
  const locale = useLocale();

  const mainLinks = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/cars`, label: t("cars") },
    { href: `/${locale}/transfers`, label: t("transfers") },
    { href: `/${locale}/about`, label: t("about") },
    { href: `/${locale}/contact`, label: t("contact") },
  ];

  const legalLinks = [
    { href: `/${locale}/privacy`, label: tFooter("privacy") },
    { href: `/${locale}/terms`, label: tFooter("terms") },
  ];

  return (
    <footer className="relative bg-muted">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>

      <div className="mx-auto max-w-6xl px-4 lg:px-0 pt-16 pb-8 lg:pt-20 lg:pb-10">
        {/* Top row — logo, socials, theme */}
        <div className="md:flex md:items-end md:justify-between">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-x-2 group"
            aria-label={brandName || "Go to homepage"}
          >
            {logo}
            {brandName && (
              <span className="font-bold text-xl">{brandName}</span>
            )}
          </Link>
          <div className="flex items-center gap-4 mt-6 md:mt-0">
            <ul className="flex list-none gap-3">
              {socialLinks.map((link, i) => (
                <li key={i} className="hover:scale-110 transition-transform duration-200">
                  {link.icon}
                </li>
              ))}
            </ul>
            <div className="w-px h-6 bg-border/50"></div>
            <ThemeToggle />
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider my-8 md:my-10"></div>

        {/* Bottom grid — links + copyright */}
        <div className="lg:grid lg:grid-cols-10 lg:gap-8">
          {/* Nav links */}
          <nav className="lg:col-start-5 lg:col-span-6 xl:col-start-6 xl:col-span-5 mb-5 lg:mb-0">
            <ul className="list-none flex flex-wrap gap-x-5 gap-y-2 lg:justify-end">
              {mainLinks.map((link, i) => (
                <li key={i} className="shrink-0">
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-foreground/65 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal links */}
          <div className="lg:col-start-5 lg:col-span-6 xl:col-start-6 xl:col-span-5 mb-5 lg:mb-0">
            <ul className="list-none flex flex-wrap gap-x-5 gap-y-2 lg:justify-end">
              {legalLinks.map((link, i) => (
                <li key={i} className="shrink-0">
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Copyright */}
          <div className="text-sm leading-6 text-muted-foreground whitespace-nowrap lg:row-start-1 lg:col-span-4 xl:col-span-5">
            <div>{tFooter("copyright")}</div>
            <div className="text-muted-foreground/70">{tFooter("allRightsReserved")}</div>
            <div className="flex items-center gap-1 mt-2">
              <span>{tFooter("builtBy")}</span>
              <Link
                href="https://mihaicrisan.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline underline-offset-4 transition-colors font-medium"
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
