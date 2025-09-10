import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsState = {
  theme: "light" | "dark" | "system";
  language: string;
  streamingQuality: string;
  downloadQuality: string;
  volume: number;
  crossfade: number;
  normalizeVolume: boolean;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setLanguage: (language: string) => void;
  setStreamingQuality: (quality: string) => void;
  setDownloadQuality: (quality: string) => void;
  setVolume: (volume: number) => void;
  setCrossfade: (crossfade: number) => void;
  setNormalizeVolume: (normalize: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "dark",
      language: "en",
      streamingQuality: "high",
      downloadQuality: "high",
      volume: 1,
      crossfade: 0,
      normalizeVolume: false,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setStreamingQuality: (quality) => set({ streamingQuality: quality }),
      setDownloadQuality: (quality) => set({ downloadQuality: quality }),
      setVolume: (volume) => set({ volume }),
      setCrossfade: (crossfade) => set({ crossfade }),
      setNormalizeVolume: (normalize) => set({ normalizeVolume: normalize }),
    }),
    {
      name: "settings-storage",
    }
  )
);