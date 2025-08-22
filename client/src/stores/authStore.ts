import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NavidromeCredentials, User } from '@shared/schema';

interface AuthState {
  credentials: NavidromeCredentials | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: NavidromeCredentials) => void;
  logout: () => void;
  updateCredentials: (credentials: Partial<NavidromeCredentials>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      credentials: null,
      user: null,
      isAuthenticated: false,
      
      login: (credentials) => {
        set({
          credentials,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        set({
          credentials: null,
          user: null,
          isAuthenticated: false,
        });
      },
      
      updateCredentials: (newCredentials) => {
        const { credentials } = get();
        if (credentials) {
          set({
            credentials: { ...credentials, ...newCredentials },
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        credentials: state.credentials,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
