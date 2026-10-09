import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    environment: "node",
    include: process.env.YUMITRACK_INTEGRATION === "1"
      ? ["tests/integration/**/*.test.ts"]
      : ["tests/unit/**/*.test.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
