import { describe, expect, it } from "vitest";
import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match";
import { permanentRedirects } from "./seo-redirects";

/** First matching rule's destination, the way Next walks `redirects()`. */
function redirectFor(pathname: string): string | null {
  for (const rule of permanentRedirects()) {
    const params = getPathMatch(rule.source, {
      strict: true,
      removeUnnamedParams: true,
    })(pathname);
    if (params) {
      const rest = [params.path ?? []].flat().join("/");
      return rule.destination.replace(":path+", rest);
    }
  }
  return null;
}

describe("permanentRedirects", () => {
  it.each([
    ["/cars", "/ro/masini-de-inchiriat-cluj-napoca"],
    ["/ro/cars", "/ro/masini-de-inchiriat-cluj-napoca"],
    ["/en/cars/bmw-x1", "/en/car-rental-cluj-napoca/bmw-x1"],
    [
      "/en/masini-de-inchiriat-cluj-napoca/bmw-x1",
      "/en/car-rental-cluj-napoca/bmw-x1",
    ],
    ["/ro/car-rental-cluj-napoca", "/ro/masini-de-inchiriat-cluj-napoca"],
  ])("moves the old fleet url %s", (from, to) => {
    expect(redirectFor(from)).toBe(to);
  });

  it.each([
    ["/en/3-all-cars", "/en/car-rental-cluj-napoca"],
    ["/en/all-cars/16-mercedes-e-class.html", "/en/car-rental-cluj-napoca"],
    ["/en/content/4-about-us", "/en/about"],
    ["/ro/content/7-transferuri", "/ro/transfers"],
    ["/en/content/3-terms-and-conditions-of-use", "/en/terms"],
    ["/en/content/6-prices", "/en/car-rental-cluj-napoca"],
    ["/en/contact-us", "/en/contact"],
  ])("maps the prestashop url %s", (from, to) => {
    expect(redirectFor(from)).toBe(to);
  });

  it.each([
    "/ro",
    "/en/about",
    "/ro/masini-de-inchiriat-cluj-napoca",
    "/en/car-rental-cluj-napoca/bmw-x1",
    "/ro/blog/ghid-inchiriere",
    "/ro/blog/12-sfaturi.html",
    "/ro/transfers/booking",
    "/r/ana-zb",
  ])("leaves the live page %s alone", (pathname) => {
    expect(redirectFor(pathname)).toBeNull();
  });
});
