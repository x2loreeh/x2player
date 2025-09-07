import enTranslations from "@/locales/en/translation.json";
import itTranslations from "@/locales/it/translation.json";

export const translations = {
  en: enTranslations,
  it: itTranslations,
};

export type Language = keyof typeof translations;

export const getTranslator =
  (lang: Language) =>
  (key: keyof typeof translations.en): string => {
    return (translations[lang] as any)[key] || translations.en[key];
  };