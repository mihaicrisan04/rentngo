"use client";

import React from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { SignInButton, Show } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { LanguageSelector } from "@/components/shared/navigation/language-selector";
import { useLocale, useTranslations } from "next-intl";
import { UserButton } from "@/components/shared/auth/user-button";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useScroll } from "@/components/ui/use-scroll";
import {
  Home,
  Car,
  ArrowRightLeft,
  BookOpen,
  Info,
  Phone,
} from "lucide-react";

interface HeaderProps {
  logo: React.ReactNode;
}

export function Header({ logo }: HeaderProps) {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");
  const tNav = useTranslations("navigation");

  const links = [
    { name: t("home"), href: `/${locale}`, icon: Home },
    { name: t("cars"), href: `/${locale}/cars`, icon: Car },
    { name: t("transfers"), href: `/${locale}/transfers`, icon: ArrowRightLeft },
    { name: t("blog"), href: `/${locale}/blog`, icon: BookOpen },
    { name: t("about"), href: `/${locale}/about`, icon: Info },
    { name: t("contact"), href: `/${locale}/contact`, icon: Phone },
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

  const isOnDarkBackground =
    pathname === `/${locale}` || pathname === `/${locale}/about`;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mx-auto w-full max-w-7xl border-b border-transparent md:rounded-xl md:border md:transition-all md:ease-out md:duration-300",
        {
          "bg-background/90 supports-[backdrop-filter]:bg-background/60 border-border/50 backdrop-blur-xl md:top-4 md:max-w-5xl md:shadow-lg":
            scrolled && !open,
          "bg-background": open,
        }
      )}
    >
      <nav
        className={cn(
          "flex h-14 w-full items-center px-4 md:h-12 md:transition-all md:ease-out md:duration-300",
          {
            "md:px-3": scrolled,
          }
        )}
      >
        <Link
          href={`/${locale}`}
          className="flex items-center space-x-2 flex-1 md:flex-1"
          onClick={handleLinkClick}
        >
          {logo}
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 lg:flex lg:absolute lg:left-1/2 lg:-translate-x-1/2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "transition-colors duration-300 rounded-lg text-[13px] font-medium",
                  !scrolled && isOnDarkBackground
                    ? isActive
                      ? "[color:rgb(255_255_255)] bg-white/10"
                      : "[color:rgba(255_255_255_0.8)] hover:[color:rgb(255_255_255)] hover:bg-white/10"
                    : isActive
                      ? "text-foreground bg-accent"
                      : "text-foreground/65 hover:text-foreground"
                )}
                href={link.href}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop right */}
        <div className="hidden items-center gap-2 lg:flex lg:flex-1 lg:justify-end">
          <LanguageSelector />

          <Show when="signed-in">
            <UserButton />
          </Show>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "transition-colors rounded-lg",
                  !scrolled && isOnDarkBackground
                    ? "[color:rgb(255_255_255)] hover:[color:rgb(255_255_255)] border-white/25 hover:bg-white/10"
                    : "text-foreground hover:text-foreground"
                )}
              >
                {tNav("login")}
              </Button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button size="sm" className="rounded-lg">
                {tNav("signUp")}
              </Button>
            </SignInButton>
          </Show>
        </div>

        {/* Mobile hamburger */}
        <Button
          size="icon"
          variant="outline"
          onClick={() => setOpen(!open)}
          className={cn(
            "lg:hidden rounded-lg",
            !scrolled &&
              isOnDarkBackground &&
              "[color:rgb(255_255_255)] border-white/25"
          )}
        >
          <MenuToggleIcon open={open} className="size-5" duration={300} />
        </Button>
      </nav>

      {/* ═══════════════════════════════════════════
          MOBILE MENU — bold, full-screen
      ═══════════════════════════════════════════ */}
      <div
        className={cn(
          "bg-background fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-y-auto lg:hidden",
          open ? "block" : "hidden"
        )}
      >
        <div
          data-slot={open ? "open" : "closed"}
          className={cn(
            "data-[slot=open]:animate-in data-[slot=open]:fade-in-0 data-[slot=closed]:animate-out data-[slot=closed]:fade-out-0 ease-out duration-200",
            "flex h-full w-full flex-col"
          )}
        >
          {/* Navigation links */}
          <div className="px-5 pt-6 pb-4">
            <nav className="flex flex-col gap-1">
              {links.map((link, index) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/80 hover:bg-muted active:bg-muted"
                    )}
                    style={{
                      animationDelay: open ? `${index * 40}ms` : "0ms",
                    }}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span>{link.name}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Language + Auth — right below nav links */}
          <div className="px-5 pt-2 pb-8">
            <div className="section-divider mb-5"></div>

            <div className="space-y-5">
              {/* Language — rendered larger in mobile context */}
              <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-muted/50">
                <div className="text-sm font-medium text-foreground/80">
                  {tNav("language")}
                </div>
                <div className="[&_button]:h-10 [&_button]:w-auto [&_button]:px-3 [&_button]:text-base [&_button]:rounded-xl [&>div]:w-auto">
                  <LanguageSelector />
                </div>
              </div>

              <Show when="signed-in">
                {/* Profile row — matching the nav link style */}
                <div
                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-muted/50 cursor-pointer active:bg-muted"
                  onClick={() => {
                    handleLinkClick();
                    router.push(`/${locale}/profile`);
                  }}
                >
                  <div className="[&_button]:h-10 [&_button]:w-10 [&_button]:rounded-xl [&_img]:h-10 [&_img]:w-10">
                    <UserButton />
                  </div>
                  <span className="text-base font-medium text-foreground/80">
                    {tNav("profile")}
                  </span>
                </div>
              </Show>

              <Show when="signed-out">
                <div className="flex flex-col gap-3">
                  <SignInButton mode="modal">
                    <Button
                      className="w-full rounded-xl h-12 text-base"
                      onClick={handleLinkClick}
                    >
                      {tNav("signUp")}
                    </Button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl h-12 text-base"
                      onClick={handleLinkClick}
                    >
                      {tNav("login")}
                    </Button>
                  </SignInButton>
                </div>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
