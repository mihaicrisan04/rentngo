import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("Mapbox search locale", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN", "test-token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("uses the locale for suggestions without changing geographic scoping", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ suggestions: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { suggestLocations } = await import("./mapbox");

    await suggestLocations("aeroport", "session-id", "ro");

    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.searchParams.get("language")).toBe("ro");
    expect(url.searchParams.get("country")).toBe("RO");
    expect(url.searchParams.get("proximity")).toBe("23.5912,46.7712");
  });

  it("uses the locale when retrieving the persisted address", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          {
            geometry: { coordinates: [23.6, 46.77] },
            properties: { full_address: "Aeroportul Cluj-Napoca" },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { retrieveLocation } = await import("./mapbox");

    const location = await retrieveLocation("mapbox-id", "session-id", "ro");

    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.searchParams.get("language")).toBe("ro");
    expect(location.fullAddress).toBe("Aeroportul Cluj-Napoca");
  });
});
