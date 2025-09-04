import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface SettingsState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "settings-storage", // name of the item in the storage (must be unique)
    }
  )
);