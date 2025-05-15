import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignInButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

interface HeaderProps {
  logo: React.ReactNode;
  brandName?: string;
}

export function Header({ logo, brandName }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
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

// Example usage (remove or modify for actual implementation)
// import Image from "next/image";
// const App = () => (
//   <Header 
//     logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={100} height={40} />} 
//     // brandName="Rent'n Go" // brandName is optional
//   />
// ); 