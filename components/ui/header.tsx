"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignInButton, SignedIn, SignedOut, useClerk } from "@clerk/nextjs";
import React from "react";
import { Menu, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { LanguageSelector } from "@/components/language-selector";
import { useLocale, useTranslations } from 'next-intl';
import { UserButton } from "@/components/user-button";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface HeaderProps {
  logo: React.ReactNode;
  brandName?: string;
}

export function Header({ logo, brandName }: HeaderProps) {
  const { signOut } = useClerk();
  const router = useRouter();
  const locale = useLocale();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const pathname = usePathname();
  const t = useTranslations('navigation');

  // menuItems will be used for the mobile navigation
  const menuItems = [
    { name: t('home'), href: `/${locale}` },
    { name: t('cars'), href: `/${locale}/cars` },
    { name: t('transfers'), href: `/${locale}/transfers` },
    { name: t('about'), href: `/${locale}/about` },
    { name: t('contact'), href: `/${locale}/contact` },
  ];

  // Navigation items for desktop NavigationMenu
  const navigationItems = [
    { name: t('home'), href: `/${locale}` },
    { name: t('cars'), href: `/${locale}/cars` },
    { name: t('transfers'), href: `/${locale}/transfers` },
    { name: t('about'), href: `/${locale}/about` },
    { name: t('contact'), href: `/${locale}/contact` },
  ];

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = () => {
    setIsDrawerOpen(false);
  };

  const getNavLinkStyles = (href: string) => {
    const isActive = pathname === href;
    return cn(
      "transition-colors hover:text-foreground/80 font-medium",
      isScrolled
        ? (isActive ? "text-primary" : "text-foreground/60")
        : (pathname === "/" || pathname === "/about"
            ? "text-background"
            : (isActive ? "text-primary" : "text-foreground/60"))
    );
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300 ease-in-out lg:px-4",
        isScrolled
          ? "border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="relative container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link
            href="/"
            className="mr-6 flex items-center space-x-2"
            onClick={handleLinkClick}
          >
            {logo}
            {/* {brandName && <span className="text-lg font-semibold hidden sm:inline">{brandName}</span>} */}
          </Link>
        </div>

        <nav className="hidden lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:flex lg:items-center lg:gap-6">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={getNavLinkStyles(item.href)}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2">
          <div className="hidden lg:flex items-center space-x-4">
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
                    "transition-colors hover:text-foreground",
                    isScrolled
                      ? "text-primary"
                      : (pathname === "/" ? "text-foreground" : "text-primary")
                  )}
                >
                  {t('login')}
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button size="sm">{t('signUp')}</Button>
              </SignInButton>
            </SignedOut>
          </div>

          {/* Mobile Drawer */}
          <div className="lg:hidden">
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <button
                  aria-label="Open Menu"
                  className={cn(
                    "relative -m-2.5 p-2.5",
                  )}
                >
                  <Menu
                    className={cn(
                      "m-auto size-6",
                      !isScrolled && (pathname === "/" || pathname === "/about") && "text-background"
                    )}
                  />
                </button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="text-left">
                  <DrawerTitle className="flex items-center space-x-2">
                    {logo}
                    {brandName && <span className="text-lg font-semibold">{brandName}</span>}
                  </DrawerTitle>
                  <DrawerDescription>
                    Navigate through our services
                  </DrawerDescription>
                </DrawerHeader>
                
                <div className="px-4 pb-4">
                  <nav className="space-y-2">
                    {menuItems.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        className={cn(
                          "block py-3 px-2 rounded-md text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                          pathname === item.href ? "text-primary bg-accent" : "text-muted-foreground"
                        )}
                        onClick={handleLinkClick}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  
                  {/* Language selector in mobile drawer */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="mb-2 text-sm font-medium text-muted-foreground">{t('language')}</div>
                    <LanguageSelector />
                  </div>
                </div>

                <DrawerFooter className="py-6">
                  <SignedIn>
                    <div className="flex flex-col gap-3 border-t pt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start" 
                        onClick={() => {
                          router.push('/profile');
                          handleLinkClick();
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        {t('profile')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start" 
                        onClick={() => {
                          signOut({ redirectUrl: '/' });
                          handleLinkClick();
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        {t('logout')}
                      </Button>
                    </div>
                  </SignedIn>
                  <SignedOut>
                    <div className="flex flex-col gap-3 border-t pt-4">
                      <SignInButton mode="modal">
                        <Button variant="outline" size="sm" className="w-full" onClick={handleLinkClick}>
                          {t('login')}
                        </Button>
                      </SignInButton>
                      <SignInButton mode="modal">
                        <Button size="sm" className="w-full" onClick={handleLinkClick}>
                          {t('signUp')}
                        </Button>
                      </SignInButton>
                    </div>
                  </SignedOut>
                  <DrawerClose asChild>
                    <Button variant="outline" className="mt-4">
                      Close
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </header>
  );
}
