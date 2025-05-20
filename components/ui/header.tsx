"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignInButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";

interface HeaderProps {
  logo: React.ReactNode;
  brandName?: string;
}

export function Header({ logo, brandName }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    // Call handler once to set initial state
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ease-in-out
        ${
          isScrolled
            ? "border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            : "border-transparent bg-transparent"
        }
      `}
    >
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-49">
        <div className="flex items-center md:ml-4">
          <Link href="/" className="mr-6 flex items-center">
            {logo}
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-4 mr-4">
          <nav className="flex items-center gap-6 text-sm px-4">
            <Link
              href="/cars"
              className="text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Cars
            </Link>
            <Link
              href="/about"
              className="text-foreground/60 transition-colors hover:text-foreground/80"
            >
              About
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost">Login</Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button>Sign Up</Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}
