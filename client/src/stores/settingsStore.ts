import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";
type Quality = "low" | "medium" | "high" | "lossless";

interface SettingsState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  streamingQuality: Quality;
  setStreamingQuality: (quality: Quality) => void;
  downloadQuality: Quality;
  setDownloadQuality: (quality: Quality) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
      streamingQuality: "high",
      setStreamingQuality: (quality) => set({ streamingQuality: quality }),
      downloadQuality: "high",
      setDownloadQuality: (quality) => set({ downloadQuality: quality }),
    }),
    {
      name: "settings-storage",
    }
  )
);