import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsState = {
  theme: "light" | "dark" | "system";
  language: string;
  streamingQuality: string;
  downloadQuality: string;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setLanguage: (language: string) => void;
  setStreamingQuality: (quality: string) => void;
  setDownloadQuality: (quality: string) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      language: "it",
      streamingQuality: "high",
      downloadQuality: "high",
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setStreamingQuality: (quality) => set({ streamingQuality: quality }),
      setDownloadQuality: (quality) => set({ downloadQuality: quality }),
    }),
    {
      name: "settings-storage",
    }
  )
);