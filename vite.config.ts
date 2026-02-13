import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { version } from "./package.json";

const venderConfig = {
  "react-vendor": ["react", "react-dom"],
  "i18next-vendor": ["i18next", "react-i18next"],
  "phaser-vendor": ["phaser"],
  "util-vendor": ["lodash", "zustand"],
};

type Options = {
  rules: {
    slot: string;
    html: string;
  }[];
};

function htmlSlot(options: Options) {
  const { rules } = options;

  return {
    name: "html-slot",
    transformIndexHtml(indexHtml: string) {
      if (rules.length === 0) {
        return indexHtml;
      }
      for (const item of rules) {
        const { slot, html } = item;
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
      rules: [
        {
          slot: "<!--BUNDLE_INFO-->",
          html: `<script>window.__bundle_info = ${JSON.stringify({ time: new Date().toISOString(), commit_id: process.env.COMMIT_ID ?? `v${version}` })}</script>`,
        },
      ],
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
