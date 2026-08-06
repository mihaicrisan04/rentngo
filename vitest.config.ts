import { defineConfig } from "vitest/config";

// Unit tests for backend helpers, pure library code, and server-rendered
// component smoke tests (react-dom/server; no jsdom).
export default defineConfig({
  resolve: {
    alias: { "@": import.meta.dirname },
  },
  test: {
    include: [
      "lib/**/*.test.ts",
      "convex/**/*.test.ts",
      "components/**/*.test.tsx",
    ],
    environment: "node",
  },
});
