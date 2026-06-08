import enTranslations from "@/locales/en/translation.json";
import itTranslations from "@/locales/it/translation.json";
import esTranslations from "@/locales/es/translation.json";
import frTranslations from "@/locales/fr/translation.json";
import deTranslations from "@/locales/de/translation.json";

export const translations = {
  en: enTranslations,
  it: itTranslations,
  es: esTranslations,
  fr: frTranslations,
  de: deTranslations,
};

export type Language = keyof typeof translations;

export const getTranslator =
  (lang: Language) =>
  (key: keyof typeof translations.en): string => {
    return (translations[lang] as any)[key] || translations.en[key];
  };
