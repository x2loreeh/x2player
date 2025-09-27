import { create } from "zustand";
import { Song } from "@/types/types";

interface LocalFilesState {
  files: Song[];
  setFiles: (files: Song[]) => void;
}

export const useLocalFilesStore = create<LocalFilesState>((set) => ({
  files: [],
  setFiles: (files) => set({ files }),
}));