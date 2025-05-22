"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignInButton, UserButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

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
  const [menuState, setMenuState] = React.useState(false);
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
            onClick={() => setMenuState(false)}
          >
            {logo}
            {brandName && <span className="text-lg font-semibold hidden sm:inline">{brandName}</span>}
          </Link>
        </div>

        <nav className="hidden lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:flex lg:items-center lg:gap-6 lg:text-sm">
          <Link
            href="/"
            className={cn(
              "transition-colors hover:text-foreground/80",
              isScrolled
                ? (pathname === "/" ? "text-primary" : "text-foreground/60")
                : (pathname === "/"
                    ? "text-background"
                    : (pathname === "/" ? "text-primary" : "text-foreground/60"))
            )}
          >
            Home
          </Link>
          <Link
            href="/cars"
            className={cn(
              "transition-colors hover:text-foreground/80",
              isScrolled
                ? (pathname === "/cars" ? "text-primary" : "text-foreground/60")
                : (pathname === "/"
                    ? "text-background"
                    : (pathname === "/cars" ? "text-primary" : "text-foreground/60"))
            )}
          >
            Cars
          </Link>
          <Link
            href="/transfers"
            className={cn(
              "transition-colors hover:text-foreground/80",
              isScrolled
                ? (pathname === "/transfers" ? "text-primary" : "text-foreground/60")
                : (pathname === "/"
                    ? "text-background"
                    : (pathname === "/transfers" ? "text-primary" : "text-foreground/60"))
            )}
          >
            Transfers
          </Link>
          <Link
            href="/about"
            className={cn(
              "transition-colors hover:text-foreground/80",
              isScrolled
                ? (pathname === "/about" ? "text-primary" : "text-foreground/60")
                : (pathname === "/"
                    ? "text-background"
                    : (pathname === "/about" ? "text-primary" : "text-foreground/60"))
            )}
          >
            About
          </Link>
          <Link
            href="/contact"
            className={cn(
              "transition-colors hover:text-foreground/80",
              isScrolled
                ? (pathname === "/contact" ? "text-primary" : "text-foreground/60")
                : (pathname === "/"
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
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">Login</Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button size="sm">Sign Up</Button>
              </SignInButton>
            </SignedOut>
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setMenuState(!menuState)}
              aria-label={menuState ? "Close Menu" : "Open Menu"}
              className={cn(
                "relative -m-2.5 p-2.5",
              )}
            >
              <Menu
                className={cn("m-auto size-6 duration-200", menuState && "scale-0 opacity-0 rotate-180", !isScrolled && "text-background")}
              />
              <X
                className={cn("absolute inset-0 m-auto size-6 rotate-180 scale-0 opacity-0 duration-200", menuState && "scale-100 opacity-100 rotate-0", !isScrolled && "text-background")}
              />
            </button>
          </div>
        </div>
      </div>

      <div
        data-state={menuState ? "active" : "inactive"}
        className={cn(
          "lg:hidden",
          "absolute inset-x-0 top-full origin-top rounded-b-2xl border-t shadow-xl transition-all duration-300 ease-in-out",
          menuState
            ? "visible scale-100 opacity-100"
            : "invisible scale-95 opacity-0",
          isScrolled && menuState
            ? "border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            : "bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60", 
        )}
      >
        <div className="p-6 space-y-4"> 
          {brandName && !menuState && (
             <div className="flex items-center space-x-2 pb-4 border-b mb-4 sm:hidden">
                {logo}
               <span className="text-lg font-semibold">{brandName}</span>
             </div>
          )}
          <ul className="space-y-2 text-sm">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className={cn(
                    "hover:text-accent-foreground block duration-150 py-2",
                    pathname === item.href ? "text-primary" : "text-muted-foreground" 
                  )}
                  onClick={() => setMenuState(false)}
                >
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col items-stretch gap-3 border-t pt-6">
            <SignedIn>
              <div className="flex items-center justify-start py-2">
                <UserButton afterSignOutUrl="/" />
                {user && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    {user.fullName || user.primaryEmailAddress?.emailAddress || "User"}
                  </span>
                )}
              </div>
            </SignedIn>
            <SignedOut>
              <div className="flex flex-col gap-3">
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm" className="w-full">Login</Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button size="sm" className="w-full">Sign Up</Button>
                </SignInButton>
              </div>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}
