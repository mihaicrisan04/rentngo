import { describe, expect, it } from "vitest";
import { getBlogUpdatePatch, getCoverImagePayload } from "./blog-cover-update";

describe("getBlogUpdatePatch", () => {
  it("preserves the existing cover when omitted", () => {
    expect(getBlogUpdatePatch({ title_en: "Updated" }, undefined)).toEqual({
      title_en: "Updated",
    });
  });

  it("sets a supplied cover image ID", () => {
    expect(getBlogUpdatePatch({ title_en: "Updated" }, "storage-id")).toEqual({
      title_en: "Updated",
      coverImage: "storage-id",
    });
  });

  it("unsets the stored cover for the null transport sentinel", () => {
    expect(getBlogUpdatePatch({ title_en: "Updated" }, null)).toEqual({
      title_en: "Updated",
      coverImage: undefined,
    });
  });
});

describe("getCoverImagePayload", () => {
  it("sends the selected storage ID", () => {
    expect(getCoverImagePayload("storage-id")).toBe("storage-id");
  });

  it("sends null when the cover is cleared", () => {
    expect(getCoverImagePayload(undefined)).toBeNull();
  });
});
