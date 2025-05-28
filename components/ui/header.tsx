"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignInButton, UserButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
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

// menuItems will be used for the mobile navigation
const menuItems = [
  { name: "Home", href: "/" },
  { name: "Cars", href: "/cars" },
  { name: "Transfers", href: "/transfers" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Header({ logo, brandName }: HeaderProps) {
  const { user } = useUser();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const pathname = usePathname();

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
            {brandName && <span className="text-lg font-semibold hidden sm:inline">{brandName}</span>}
          </Link>
        </div>

        <nav className="hidden lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:flex lg:items-center lg:gap-6 lg:text-base">
          <Link
            href="/"
            className={cn(
              "transition-colors hover:text-foreground/80 font-medium",
              isScrolled
                ? (pathname === "/" ? "text-primary" : "text-foreground/60")
                : (pathname === "/" || pathname === "/about"
                    ? "text-background"
                    : (pathname === "/" ? "text-primary" : "text-foreground/60"))
            )}
          >
            Home
          </Link>
          <Link
            href="/cars"
            className={cn(
              "transition-colors hover:text-foreground/80 font-medium",
              isScrolled
                ? (pathname === "/cars" ? "text-primary" : "text-foreground/60")
                : (pathname === "/" || pathname === "/about"
                    ? "text-background"
                    : (pathname === "/cars" ? "text-primary" : "text-foreground/60"))
            )}
          >
            Cars
          </Link>
          <Link
            href="/transfers"
            className={cn(
              "transition-colors hover:text-foreground/80 font-medium",
              isScrolled
                ? (pathname === "/transfers" ? "text-primary" : "text-foreground/60")
                : (pathname === "/" || pathname === "/about"
                    ? "text-background"
                    : (pathname === "/transfers" ? "text-primary" : "text-foreground/60"))
            )}
          >
            Transfers
          </Link>
          <Link
            href="/about"
            className={cn(
              "transition-colors hover:text-foreground/80 font-medium",
              isScrolled
                ? (pathname === "/about" ? "text-primary" : "text-foreground/60")
                : (pathname === "/" || pathname === "/about"
                    ? "text-background"
                    : (pathname === "/about" ? "text-primary" : "text-foreground/60"))
            )}
          >
            About
          </Link>
          <Link
            href="/contact"
            className={cn(
              "transition-colors hover:text-foreground/80 font-medium",
              isScrolled
                ? (pathname === "/contact" ? "text-primary" : "text-foreground/60")
                : (pathname === "/" || pathname === "/about"
                    ? "text-background"
                    : (pathname === "/contact" ? "text-primary" : "text-foreground/60"))
            )}
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-2">
          <div className="hidden lg:flex items-center space-x-4">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
              {user && (
                <span className={cn(
                  "ml-2 text-sm transition-colors",
                  isScrolled
                    ? "text-muted-foreground"
                    : (pathname === "/" || pathname === "/about"
                        ? "text-background/80"
                        : "text-muted-foreground")
                )}>
                  {user.fullName}
                </span>
              )}
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
                  Login
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button size="sm">Sign Up</Button>
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
                </div>

                <DrawerFooter className="py-6">
                  <SignedIn>
                    <div className="flex items-center justify-start py-2 border-t">
                      <UserButton afterSignOutUrl="/" />
                      {user && (
                        <span className="ml-3 pl-2 text-sm text-muted-foreground">
                          {user.fullName || user.primaryEmailAddress?.emailAddress || "User"}
                        </span>
                      )}
                    </div>
                  </SignedIn>
                  <SignedOut>
                    <div className="flex flex-col gap-3 border-t pt-4">
                      <SignInButton mode="modal">
                        <Button variant="outline" size="sm" className="w-full" onClick={handleLinkClick}>
                          Login
                        </Button>
                      </SignInButton>
                      <SignInButton mode="modal">
                        <Button size="sm" className="w-full" onClick={handleLinkClick}>
                          Sign Up
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
