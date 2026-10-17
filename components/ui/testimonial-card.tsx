import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TestimonialCardProps {
  author: string;
  rating: number;
  text: string;
  /** Already localized, e.g. "mai 2026". */
  postedLabel: string;
  className?: string;
}

export function TestimonialCard({
  author,
  rating,
  text,
  postedLabel,
  className,
}: TestimonialCardProps) {
  return (
    <figure
      className={cn(
        "flex w-[300px] shrink-0 flex-col rounded-lg border-t sm:w-[340px]",
        "bg-gradient-to-b from-muted/50 to-muted/10",
        "p-4 text-start sm:p-6",
        className,
      )}
    >
      <figcaption className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-base font-semibold text-primary"
        >
          {author.charAt(0).toUpperCase()}
        </span>
        <div className="flex min-w-0 flex-1 flex-col items-start">
          <span className="truncate font-semibold leading-tight">{author}</span>
          <span className="text-xs text-muted-foreground">{postedLabel}</span>
        </div>
        <GoogleIcon className="size-5 shrink-0" />
      </figcaption>
      <span className="sr-only">{`${rating}/5`}</span>
      <div className="mt-3 flex gap-0.5" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              "size-4",
              i < rating
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/40",
            )}
          />
        ))}
      </div>
      <blockquote className="mt-3 line-clamp-6 text-sm text-muted-foreground sm:text-base">
        {text}
      </blockquote>
    </figure>
  );
}

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={className}>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
