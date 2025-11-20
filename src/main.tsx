import { createRoot } from "react-dom/client";
import "./i18n";
import App from "./App";
import "./App.css";
import i18n from "./i18n";

async function init() {
  await i18n.changeLanguage();
  const root = createRoot(document.getElementById("root")!);
  root.render(<App />);
}

init();
