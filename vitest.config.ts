import path from "node:path";
import { defineConfig } from "vitest/config";

// Unit tests for backend helpers and pure library code; no React/jsdom.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
  test: {
    include: ["lib/**/*.test.ts", "convex/**/*.test.ts"],
    environment: "node",
  },
});
