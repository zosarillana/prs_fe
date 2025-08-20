// src/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type User = {
  id: number;
  name: string;
  email: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
};

type AuthActions = {
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
};

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,
      
      // Set only the token
      setToken: (token: string) => set((state) => ({ 
        token,
        isAuthenticated: !!(token && state.user)
      })),
      
      // Set only the user
      setUser: (user: User) => set((state) => ({ 
        user,
        isAuthenticated: !!(state.token && user)
      })),
      
      // Set both token and user - THIS IS THE MISSING METHOD
      setAuth: (token: string, user: User) => set({ 
        token,
        user,
        isAuthenticated: true 
      }),
      
      // Clear all auth data
      clearAuth: () => set(initialState)
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      // Rehydrate isAuthenticated state on load
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!(state.token && state.user);
        }
      },
    }
  )
);