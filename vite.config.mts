import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { version } from "./package.json" with { type: "json" };
import { codecovVitePlugin } from "@codecov/vite-plugin";

const venderConfig = {
  "react-vendor": ["react", "react-dom"],
  "i18next-vendor": ["i18next", "react-i18next"],
  "phaser-vendor": ["phaser"],
  "util-vendor": ["lodash", "zustand", "@sentry/react"],
};

const preloadInfo = ["weapons/golden_staff"]
  .map(
    (v) =>
      `<link rel="prefetch" href="./assets/${v}.svg" as="image" type="image/svg+xml" />`,
  )
  .join("\n");

function htmlSlot(options: Record<string, string>): PluginOption {
  return {
    name: "html-slot",
    transformIndexHtml(indexHtml: string) {
      if (Object.keys(options).length === 0) {
        return indexHtml;
      }
      for (const [slot, html] of Object.entries(options)) {
        indexHtml = indexHtml.replace(slot, html);
      }

      return indexHtml;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.ROOT_BASE_URL ? process.env.ROOT_BASE_URL : undefined,
  plugins: [
    react(),
    htmlSlot({
      "<!--BUNDLE_INFO-->": `<script>window.__bundle_info = ${JSON.stringify({ time: new Date().toISOString(), commit_id: process.env.COMMIT_ID ?? `v${version}` })}</script>`,
      "<!--PRELOAD_INFO-->": preloadInfo,
    }),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "wukong-survivors",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
  server: {
    port: 3000,
    open: false,
  },
  build: {
    modulePreload: true,
    outDir: "./dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          for (const [chunkName, chunks] of Object.entries(venderConfig)) {
            if (chunks.some((chunk) => id.includes(`node_modules/${chunk}`))) {
              return chunkName;
            }
          }
        },
      },
    },
  },
});
