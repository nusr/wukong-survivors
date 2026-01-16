import { createRoot } from "react-dom/client";
import "./i18n";
import App from "./App";
import "./App.css";
import i18n from "./i18n";
import { useSettingStore } from "./store";
import { isFullScreen } from "./util";

async function init() {
  await i18n.changeLanguage();
  useSettingStore.getState().setFullScreenEnabled(isFullScreen());
  const root = createRoot(document.getElementById("root")!);
  root.render(<App />);
}

init();
