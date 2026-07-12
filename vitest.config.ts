import { defineConfig } from "vitest/config";

// Unit tests for the pure pricing engine only — no React/jsdom needed.
export default defineConfig({
  test: {
    include: ["lib/pricing/**/*.test.ts"],
    environment: "node",
  },
});
