import { createRoot } from "react-dom/client";
import "./i18n";
import App from "./App";
import "./App.css";
import i18n from "./i18n";
import { useSettingStore } from "./store";
import { isFullScreen } from "./util";
import {
  init as initSentry,
  browserTracingIntegration,
  replayIntegration,
} from "@sentry/react";

if (location.hostname === "nusr.github.io") {
  initSentry({
    dsn: "https://07d089a03337af8aee98719f34a3164a@o4506851168092160.ingest.us.sentry.io/4510718843420672",
    integrations: [
      browserTracingIntegration(),
      replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: 1.0,
    tracePropagationTargets: ["nusr.github.io"],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

async function init() {
  await i18n.changeLanguage();
  useSettingStore.getState().setFullScreenEnabled(isFullScreen());
  const root = createRoot(document.getElementById("root")!);
  root.render(<App />);
}

init();
