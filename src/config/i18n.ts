import i18n from "i18next";
import { getLocales } from "expo-localization";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en/translation.json";
import es from "@/locales/es/translation.json";

const resources = {
  en: { translation: en },
  es: { translation: es },
};

const FALLBACK_LANGUAGE = "en";

function getInitialLanguage(): "en" | "es" {
  const code = getLocales()[0]?.languageCode;
  return code === "es" ? "es" : FALLBACK_LANGUAGE;
}

void i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: FALLBACK_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
