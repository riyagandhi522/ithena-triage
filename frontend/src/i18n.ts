import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enUS from "./locales/en-US/triage.json";
import deDE from "./locales/de-DE/triage.json";
import jaJP from "./locales/ja-JP/triage.json";

i18n.use(initReactI18next).init({
  resources: {
    "en-US": { triage: enUS },
    "de-DE": { triage: deDE },
    "ja-JP": { triage: jaJP },
  },
  lng: "en-US",
  fallbackLng: "en-US",
  ns: ["triage"],
  defaultNS: "triage",
  interpolation: { escapeValue: false },
});

export default i18n;
