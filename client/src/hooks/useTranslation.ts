import { useSettingsStore } from "@/stores/settingsStore";
import { getTranslator, Language } from "@/lib/translations";

export const useTranslation = () => {
  const { language } = useSettingsStore();
  // Fallback to 'en' if the language is not set
  const effectiveLanguage = language || 'en';
  return getTranslator(effectiveLanguage as Language);
};