import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import de from "./locales/de/common.json";
import en from "./locales/en/common.json";

export const defaultNS = "common";
export { i18n };

// The monorepo loads these through vite-plugin-i18next-loader's virtual module
// and a language detector. The playground has no such build step and no user
// preference to honour, so the two locales are imported directly and the
// language is fixed — switch it here when a mockup needs the German copy.
i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  ns: ["common"],
  defaultNS,
  resources: {
    en: { common: en },
    de: { common: de },
  },
  react: {
    transKeepBasicHtmlNodesFor: ["br", "strong", "i", "p", "b"],
  },
});
