"use client";

import { useTranslations } from "next-intl";
import {
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandWhatsapp,
  IconMail,
  IconPhone,
  type Icon,
} from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { COMPANY, whatsAppChatUrl } from "@/lib/company";
import { cn } from "@/lib/utils";

interface QuickContactLink {
  key: "whatsapp" | "instagram" | "tiktok" | "phone" | "email";
  href: string;
  icon: Icon;
  className: string;
  external: boolean;
  /** Socials stay desktop-only; on mobile they live in the footer. */
  desktopOnly?: boolean;
}

export function QuickContactBubbles() {
  const t = useTranslations("common.quickContact");
  const tContact = useTranslations("contactPage");

  const links: QuickContactLink[] = [
    {
      key: "whatsapp",
      href: whatsAppChatUrl(tContact("whatsappMessage")),
      icon: IconBrandWhatsapp,
      className: "bg-[#25D366]",
      external: true,
    },
    {
      key: "instagram",
      href: COMPANY.social.instagram,
      icon: IconBrandInstagram,
      className:
        "bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fd5949_45%,#d6249f_60%,#285AEB_90%)]",
      external: true,
      desktopOnly: true,
    },
    {
      key: "tiktok",
      href: COMPANY.social.tiktok,
      icon: IconBrandTiktok,
      className: "bg-black ring-1 ring-white/20",
      external: true,
      desktopOnly: true,
    },
    {
      key: "phone",
      href: `tel:${COMPANY.phone.tel}`,
      icon: IconPhone,
      className: "bg-[#055E3B]",
      external: false,
    },
    {
      key: "email",
      href: `mailto:${COMPANY.email}`,
      icon: IconMail,
      className: "bg-sky-600",
      external: false,
    },
  ];

  return (
    <nav
      aria-label={t("label")}
      className="fixed right-3 bottom-4 z-40 flex flex-col gap-2.5 md:right-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 print:hidden"
    >
      {links.map(
        ({ key, href, icon: LinkIcon, className, external, desktopOnly }) => (
          <Tooltip key={key}>
            <TooltipTrigger asChild>
              <a
                href={href}
                aria-label={t(key)}
                {...(external && {
                  target: "_blank",
                  rel: "noopener noreferrer",
                })}
                className={cn(
                  "flex size-11 items-center justify-center rounded-full text-white shadow-lg shadow-black/25 transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:size-12",
                  desktopOnly && "max-md:hidden",
                  className,
                )}
              >
                <LinkIcon className="size-[22px] md:size-6" stroke={1.75} />
              </a>
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={8}>
              {t(key)}
            </TooltipContent>
          </Tooltip>
        ),
      )}
    </nav>
  );
}
