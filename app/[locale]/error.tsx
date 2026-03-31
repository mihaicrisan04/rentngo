"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center space-y-4 p-8">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground max-w-md">
          We encountered an unexpected error. Please try again or go back to the
          homepage.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
