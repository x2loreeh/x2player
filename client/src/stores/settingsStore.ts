import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsState = {
  theme: "light" | "dark" | "system";
  language: string;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setLanguage: (language: string) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      language: "it",
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "settings-storage",
    }
  )
);