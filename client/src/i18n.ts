import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslation from "./locales/en/translation.json";
import itTranslation from "./locales/it/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      it: {
        translation: itTranslation,
      },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'cookie'],
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18n;