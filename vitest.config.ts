import { defineConfig } from "vitest/config";

// Unit tests for backend helpers and pure library code; no React/jsdom.
export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts", "convex/**/*.test.ts"],
    environment: "node",
  },
});
