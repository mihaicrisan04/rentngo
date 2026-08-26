"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const languages = {
  ro: { name: "Română", flag: "🇷🇴" },
  en: { name: "English", flag: "🇺🇸" },
};

// Extract blog slug from pathname like /ro/blog/my-slug → my-slug
function extractBlogSlug(pathname: string): string | null {
  const match = pathname.match(/^\/[a-z]{2}\/blog\/([^/]+)$/);
  return match ? match[1] : null;
}

export function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as "ro" | "en";

  const blogSlug = extractBlogSlug(pathname);
  const alternateSlug = useQuery(
    api.blogs.getAlternateSlug,
    blogSlug ? { slug: blogSlug, locale } : "skip",
  );

  const handleLanguageChange = (newLocale: string) => {
    // Remove current locale from pathname if it exists
    const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "") || "/";

    // For blog detail pages, swap to the alternate locale slug
    if (blogSlug && alternateSlug) {
      router.push(`/${newLocale}/blog/${alternateSlug}`);
      return;
    }

    // All other pages: same path, different locale prefix
    const newPath = `/${newLocale}${pathnameWithoutLocale}`;

    router.push(newPath);
  };

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger size="sm" className="w-[50px] md:w-[40px] [&>svg]:hidden">
        <SelectValue>
          {languages[locale as keyof typeof languages]?.flag}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ro">
          <div className="flex items-center gap-2">
            <span>{languages.ro.flag}</span>
            <span>{languages.ro.name}</span>
          </div>
        </SelectItem>
        <SelectItem value="en">
          <div className="flex items-center gap-2">
            <span>{languages.en.flag}</span>
            <span>{languages.en.name}</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
