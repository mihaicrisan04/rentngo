import { defineConfig } from "vitest/config";

// Unit tests for pure lib code (pricing engine + helpers) — no React/jsdom.
export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts"],
    environment: "node",
  },
});
