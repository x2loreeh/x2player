import { useSettingsStore } from "@/stores/settingsStore";
import { getTranslator, Language } from "@/lib/translations";

export const useTranslation = () => {
  const { language } = useSettingsStore();
  // Fallback to 'it' if the language is not set
  const effectiveLanguage = language || 'it';
  return getTranslator(effectiveLanguage as Language);
};