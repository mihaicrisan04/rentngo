"use client";

import React from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { LanguageSelector } from "@/components/language-selector";
import { useLocale, useTranslations } from "next-intl";
import { UserButton } from "@/components/user-button";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useScroll } from "@/components/ui/use-scroll";

interface HeaderProps {
  logo: React.ReactNode;
}

export function Header({ logo }: HeaderProps) {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("navigation");

  const links = [
    { name: t("home"), href: `/${locale}` },
    { name: t("cars"), href: `/${locale}/cars` },
    { name: t("transfers"), href: `/${locale}/transfers` },
    { name: t("blog"), href: `/${locale}/blog` },
    { name: t("about"), href: `/${locale}/about` },
    { name: t("contact"), href: `/${locale}/contact` },
  ];

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLinkClick = () => {
    setOpen(false);
  };

  const isOnDarkBackground = pathname === `/${locale}` || pathname === `/${locale}/about`;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mx-auto w-full max-w-7xl border-b border-transparent md:rounded-md md:border md:transition-all md:ease-out",
        {
          "bg-background/95 supports-[backdrop-filter]:bg-background/50 border-border backdrop-blur-lg md:top-4 md:max-w-6xl md:shadow":
            scrolled && !open,
          "bg-background": open,
        }
      )}
    >
      <nav
        className={cn(
          "flex h-14 w-full items-center px-4 md:h-12 md:transition-all md:ease-out",
          {
            "md:px-2": scrolled,
          }
        )}
      >
        <Link href={`/${locale}`} className="flex items-center space-x-2 flex-1 md:flex-1" onClick={handleLinkClick}>
          {logo}
        </Link>

        <div className="hidden items-center gap-2 lg:flex lg:absolute lg:left-1/2 lg:-translate-x-1/2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "transition-colors duration-300",
                  !scrolled && isOnDarkBackground
                    ? isActive
                      ? "[color:rgb(255_255_255)]"
                      : "[color:rgba(255_255_255_0.85)] hover:[color:rgb(255_255_255)]"
                    : isActive
                      ? "text-foreground"
                      : "text-foreground/70 hover:text-foreground"
                )}
                href={link.href}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 lg:flex lg:flex-1 lg:justify-end">
          <LanguageSelector />

          <SignedIn>
            <UserButton />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "transition-colors",
                  !scrolled && isOnDarkBackground
                    ? "[color:rgb(255_255_255)] hover:[color:rgb(255_255_255)] border-white/30 hover:bg-white/10"
                    : "text-primary hover:text-foreground"
                )}
              >
                {t("login")}
              </Button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button size="sm">{t("signUp")}</Button>
            </SignInButton>
          </SignedOut>
        </div>

        <Button
          size="icon"
          variant="outline"
          onClick={() => setOpen(!open)}
          className={cn(
            "lg:hidden",
            !scrolled && isOnDarkBackground && "[color:rgb(255_255_255)] border-white/30"
          )}
        >
          <MenuToggleIcon open={open} className="size-5" duration={300} />
        </Button>
      </nav>

      <div
        className={cn(
          "bg-background fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y lg:hidden",
          open ? "block" : "hidden"
        )}
      >
        <div
          data-slot={open ? "open" : "closed"}
          className={cn(
            "data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out",
            "flex h-full w-full flex-col gap-y-2 p-4"
          )}
        >
          <div className="grid gap-y-2 pb-4 border-b">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  className={buttonVariants({
                    variant: "ghost",
                    className: cn(
                      "justify-start",
                      isActive && "text-primary bg-accent"
                    ),
                  })}
                  href={link.href}
                  onClick={handleLinkClick}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="mb-2 text-sm font-medium text-muted-foreground">
              {t("language")}
            </div>
            <LanguageSelector />

            <SignedIn>
              <UserButton />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" className="w-full" onClick={handleLinkClick}>
                  {t("login")}
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button className="w-full" onClick={handleLinkClick}>
                  {t("signUp")}
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}
