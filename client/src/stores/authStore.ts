import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import md5 from 'md5';
import type { User } from '@shared/schema';
import type { NavidromeCredentials } from '../types/types';

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
        let finalCredentials = { ...credentials };
        if (credentials.password) {
          const salt = Math.random().toString(36).substring(2, 12);
          const token = md5(credentials.password + salt);
          finalCredentials = {
            serverUrl: credentials.serverUrl,
            username: credentials.username,
            token,
            salt,
          };
        }
        set({
          credentials: finalCredentials,
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
