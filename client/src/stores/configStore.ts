import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type DataSource = 'navidrome' | 'local' | 'mock';

interface ConfigState {
  isFirstLaunch: boolean;
  dataSource: DataSource;
  setDataSource: (dataSource: DataSource) => void;
  completeFirstLaunch: () => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      isFirstLaunch: true,
      dataSource: 'mock',
      setDataSource: (dataSource) => set({ dataSource, isFirstLaunch: false }),
      completeFirstLaunch: () => set({ isFirstLaunch: false }),
    }),
    {
      name: 'config-storage',
    }
  )
);