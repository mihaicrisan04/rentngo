export const GOOGLE_PLACE_ID = "ChIJ9Q3JNjcPSUcRNH4ZIZMWsM8";

export const GOOGLE_REVIEWS_URL = `https://search.google.com/local/reviews?placeid=${GOOGLE_PLACE_ID}`;

export const GOOGLE_WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`;

/** Snapshot of the Google Business Profile; update together with the reviews below. */
export const GOOGLE_RATING = {
  score: 5,
  reviewCount: 64,
} as const;

export interface GoogleReview {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** Verbatim from Google, in the language it was written in. */
  text: string;
  /** "YYYY-MM" the review was posted. */
  postedAt: string;
}

/** Hand-picked from the Google Business Profile. Never edit the wording. */
export const GOOGLE_REVIEWS: readonly GoogleReview[] = [];
