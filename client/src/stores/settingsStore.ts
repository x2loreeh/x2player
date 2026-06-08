import { create } from "zustand";
import { persist } from "zustand/middleware";

type DataSource = "navidrome" | "local" | "both";

type SettingsState = {
  dataSource: DataSource | null;
  localMusicPath: string | null;
  theme: "light" | "dark" | "system";
  language: string;
  streamingQuality: string;
  downloadQuality: string;
  volume: number;
  crossfade: number;
  normalizeVolume: boolean;
  setDataSource: (dataSource: DataSource) => void;
  enableDataSource: (source: Exclude<DataSource, "both">) => void;
  disableDataSource: (source: Exclude<DataSource, "both">) => void;
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
      localMusicPath: null,
      theme: "dark",
      language: "en",
      streamingQuality: "high",
      downloadQuality: "high",
      volume: 1,
      crossfade: 0,
      normalizeVolume: false,
      setDataSource: (dataSource) => set({ dataSource }),
      enableDataSource: (source) =>
        set((state) => {
          if (state.dataSource === source || state.dataSource === "both") {
            return state;
          }

          return {
            dataSource:
              state.dataSource === null ? source : "both",
          };
        }),
      disableDataSource: (source) =>
        set((state) => {
          if (state.dataSource === null) {
            return state;
          }

          if (state.dataSource === "both") {
            return {
              dataSource: source === "navidrome" ? "local" : "navidrome",
            };
          }

          if (state.dataSource === source) {
            return { dataSource: null };
          }

          return state;
        }),
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
          dataSource: null,
          localMusicPath: null,
        }),
    }),
    {
      name: "settings-storage",
    }
  )
);
