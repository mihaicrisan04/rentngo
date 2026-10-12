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
    },
    {
      key: "tiktok",
      href: COMPANY.social.tiktok,
      icon: IconBrandTiktok,
      className: "bg-black ring-1 ring-white/20",
      external: true,
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
      className="fixed right-1.5 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-2 md:right-4 md:gap-2.5 print:hidden"
    >
      {links.map(({ key, href, icon: LinkIcon, className, external }) => (
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
                "flex size-9 items-center justify-center rounded-full text-white shadow-lg shadow-black/20 transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:size-12",
                className,
              )}
            >
              <LinkIcon className="size-[18px] md:size-6" stroke={1.75} />
            </a>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={8}>
            {t(key)}
          </TooltipContent>
        </Tooltip>
      ))}
    </nav>
  );
}
