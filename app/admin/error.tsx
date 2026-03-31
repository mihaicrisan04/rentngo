"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center space-y-4 p-8">
        <h1 className="text-2xl font-bold">Dashboard Error</h1>
        <p className="text-muted-foreground max-w-md">
          Something went wrong loading the admin dashboard.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="text-left text-xs bg-muted p-3 rounded-md max-w-lg overflow-auto">
            {error.message}
          </pre>
        )}
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
