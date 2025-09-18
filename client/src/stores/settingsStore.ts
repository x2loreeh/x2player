import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NavidromeCredentials } from "@shared/schema";

type DataSource = "navidrome" | "local";

type SettingsState = {
  dataSource: DataSource | null;
  navidromeCredentials: NavidromeCredentials | null;
  localMusicPath: string | null;
  theme: "light" | "dark" | "system";
  language: string;
  streamingQuality: string;
  downloadQuality: string;
  volume: number;
  crossfade: number;
  normalizeVolume: boolean;
  setDataSource: (dataSource: DataSource) => void;
  setNavidromeCredentials: (credentials: NavidromeCredentials) => void;
  setLocalMusicPath: (path: string) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setLanguage: (language: string) => void;
  setStreamingQuality: (quality: string) => void;
  setDownloadQuality: (quality: string) => void;
  setVolume: (volume: number) => void;
  setCrossfade: (crossfade: number) => void;
  setNormalizeVolume: (normalize: boolean) => void;
  logout: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      dataSource: null,
      navidromeCredentials: null,
      localMusicPath: null,
      theme: "dark",
      language: "en",
      streamingQuality: "high",
      downloadQuality: "high",
      volume: 1,
      crossfade: 0,
      normalizeVolume: false,
      setDataSource: (dataSource) => set({ dataSource }),
      setNavidromeCredentials: (credentials) =>
        set({ navidromeCredentials: credentials }),
      setLocalMusicPath: (path) => set({ localMusicPath: path }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setStreamingQuality: (quality) => set({ streamingQuality: quality }),
      setDownloadQuality: (quality) => set({ downloadQuality: quality }),
      setVolume: (volume) => set({ volume }),
      setCrossfade: (crossfade) => set({ crossfade }),
      setNormalizeVolume: (normalize) => set({ normalizeVolume: normalize }),
      logout: () =>
        set({
          navidromeCredentials: null,
          dataSource: null,
          localMusicPath: null,
        }),
    }),
    {
      name: "settings-storage",
    }
  )
);