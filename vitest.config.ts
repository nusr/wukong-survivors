import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/.git/**", "**/e2e/**"],
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["html", "lcovonly", "text", "clover", "json"],
      exclude: [
        "node_modules/",
        "**/*.d.ts",
        "**/*.config.*",
        "dist/",
        "**/*.json",
        "**/__mocks__/*",
        "**/*.module.css",
      ],
    },
  },
  resolve: {
    alias: {
      phaser: path.resolve(__dirname, "src/__mocks__/phaser.ts"),
    },
  },
});
