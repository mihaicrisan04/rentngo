import { useLocale, useTranslations } from "next-intl";
import { ExternalLink, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleIcon, TestimonialCard } from "@/components/ui/testimonial-card";
import {
  GOOGLE_RATING,
  GOOGLE_REVIEWS,
  GOOGLE_REVIEWS_URL,
  GOOGLE_WRITE_REVIEW_URL,
} from "@/lib/google-reviews";
import { cn } from "@/lib/utils";

interface TestimonialsSectionProps {
  className?: string;
}

export function TestimonialsSection({ className }: TestimonialsSectionProps) {
  const t = useTranslations("testimonials");
  const locale = useLocale();
  const monthFormat = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <section
      className={cn(
        "bg-transparent text-foreground",
        "py-12 sm:py-24 md:py-32",
        className,
      )}
    >
      <div className="w-full flex flex-col items-center gap-8 text-center sm:gap-12">
        <div className="flex flex-col items-center gap-4 px-4 sm:px-6 lg:px-8 sm:gap-6">
          <h2 className="max-w-[720px] text-2xl font-semibold leading-tight sm:text-4xl md:text-5xl md:leading-tight">
            {t("title")}
          </h2>
          <p className="text-base max-w-[600px] font-medium text-muted-foreground sm:text-lg md:text-xl">
            {t("description")}
          </p>
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-full border border-border/60 bg-card/80 px-5 py-2.5 shadow-sm transition-colors hover:bg-card"
          >
            <GoogleIcon className="size-6" />
            <span className="text-lg font-semibold">
              {GOOGLE_RATING.score.toFixed(1)}
            </span>
            <span className="flex gap-0.5" aria-hidden>
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className="size-4 fill-amber-400 text-amber-400"
                />
              ))}
            </span>
            <span className="text-sm text-muted-foreground">
              {t("reviewCount", { count: GOOGLE_RATING.reviewCount })}
            </span>
          </a>
        </div>

        {GOOGLE_REVIEWS.length > 0 && (
          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
            <div className="group flex overflow-hidden p-2 [--gap:0.5rem] sm:[--gap:1rem] [gap:var(--gap)] flex-row [--duration:80s]">
              <div className="flex shrink-0 [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
                {[...Array(2)].map((_, setIndex) =>
                  GOOGLE_REVIEWS.map((review, i) => (
                    <TestimonialCard
                      key={`${setIndex}-${i}`}
                      author={review.author}
                      rating={review.rating}
                      text={review.text}
                      postedLabel={monthFormat.format(
                        new Date(`${review.postedAt}-01T00:00:00Z`),
                      )}
                    />
                  )),
                )}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-background sm:block" />
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-background sm:block" />
          </div>
        )}

        <div className="flex flex-col gap-3 px-4 sm:flex-row">
          <Button asChild size="lg" className="rounded-xl">
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("seeAllOnGoogle")}
              <ExternalLink className="ml-2 size-4" />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-xl">
            <a
              href={GOOGLE_WRITE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("writeReview")}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
