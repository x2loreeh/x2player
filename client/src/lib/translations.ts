export const translations = {
  it: {
    "No track selected": "Nessuna traccia selezionata",
    "Select a song to play": "Seleziona un brano da riprodurre",
  },
  en: {
    "No track selected": "No track selected",
    "Select a song to play": "Select a song to play",
  },
};

export type Language = keyof typeof translations;

export const getTranslator = (lang: Language) => (key: keyof typeof translations.en) => {
  return translations[lang][key] || translations.en[key];
};