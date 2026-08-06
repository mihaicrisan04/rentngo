import { describe, expect, test } from "vitest";
import { stripUndefined } from "./patch";

describe("stripUndefined", () => {
  test("removes keys whose value is undefined", () => {
    expect(
      stripUndefined({ a: 1, b: undefined, c: "x", d: undefined }),
    ).toEqual({ a: 1, c: "x" });
  });

  test("keeps falsy but defined values", () => {
    expect(stripUndefined({ a: 0, b: "", c: false, d: null })).toEqual({
      a: 0,
      b: "",
      c: false,
      d: null,
    });
  });

  test("returns an empty object when everything is undefined", () => {
    expect(stripUndefined({ a: undefined })).toEqual({});
  });

  test("does not mutate the input", () => {
    const input = { a: 1, b: undefined };
    stripUndefined(input);
    expect(input).toEqual({ a: 1, b: undefined });
  });
});
