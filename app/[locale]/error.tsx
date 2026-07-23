"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function LocaleError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorPage");
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center space-y-4 p-8">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground max-w-md">{t("description")}</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="default">
            {t("tryAgain")}
          </Button>
          <Button asChild variant="outline">
            <Link href="/">{t("goHome")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
