export function getBlogUpdatePatch<T extends object, CoverImage>(
  updates: T,
  coverImage: CoverImage | null | undefined,
) {
  if (coverImage === undefined) return updates;

  return {
    ...updates,
    coverImage: coverImage === null ? undefined : coverImage,
  };
}

export function getCoverImagePayload<CoverImage>(
  coverImage: CoverImage | undefined,
) {
  return coverImage ?? null;
}
