import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { idbStorage } from '@/lib/idb-storage';

interface LocalFilesState {
  files: File[];
  setFiles: (files: File[]) => void;
  clearFiles: () => void;
}

export const useLocalFilesStore = create<LocalFilesState>()(
  persist(
    (set) => ({
      files: [],
      setFiles: (files) => set({ files }),
      clearFiles: () => set({ files: [] }),
    }),
    {
      name: 'local-files-storage',
      storage: idbStorage,
      // Salva solo la parte 'files' dello stato
      partialize: (state) => ({ files: state.files }),
      // Evita di idratare lo stato sul client immediatamente, lo faremo manualmente
      skipHydration: true,
    }
  )
);