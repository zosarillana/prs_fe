import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types/users";
import { authService } from "@/features/auth/authService";

type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
};

type AuthActions = {
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  initializeAuth: () => Promise<void>;
  handleAuthError: () => void; // 👈 Handle 401 errors
};

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  loading: false,
  initialized: false,
};

// 🔒 Global flags to prevent multiple calls
let authInitializationPromise: Promise<void> | null = null;
let isHandlingAuthError = false;

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setToken: (token: string) =>
        set((state) => ({
          token,
          isAuthenticated: !!(token && state.user),
        })),

      setUser: (user: User) =>
        set((state) => ({
          user,
          isAuthenticated: !!(state.token && user),
        })),

      setAuth: (token: string, user: User) =>
        set({
          token,
          user,
          isAuthenticated: true,
          initialized: true,
          loading: false,
        }),

      clearAuth: () => {
        authInitializationPromise = null;
        isHandlingAuthError = false;
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          loading: false,
          initialized: true,
        });
      },

      // 👈 Handle 401 errors from API calls
      handleAuthError: () => {
        if (isHandlingAuthError) return;

        isHandlingAuthError = true;
        console.log("🚨 Handling 401 error");

        // Clear auth and redirect
        get().clearAuth();

        // Only redirect if not already on login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }

        setTimeout(() => {
          isHandlingAuthError = false;
        }, 1000);
      },

      initializeAuth: async () => {
        if (authInitializationPromise) return authInitializationPromise;

        const state = get();
        if (state.initialized) return;

        authInitializationPromise = (async () => {
          console.log("🚀 Starting auth initialization");
          set({ loading: true });

          let token = state.token;

          try {
            // 1️⃣ No token? → try refresh first
            if (!token) {
              console.log("🔄 No token, attempting refresh...");
              const refreshed = await authService.refresh();
              token = refreshed.access_token;
              set({ token });
            }

            if (!token) {
              console.log("❌ No token and refresh failed");
              set({ initialized: true, loading: false });
              return;
            }

            // 2️⃣ With token, fetch the user
            console.log("🔑 Fetching /me");
            const res = await authService.me();
            if (res?.user) {
              set({
                user: res.user,
                isAuthenticated: true,
                initialized: true,
                loading: false,
              });
            } else {
              set({
                token: null,
                user: null,
                isAuthenticated: false,
                initialized: true,
                loading: false,
              });
            }
          } catch (err: any) {
            console.error("❌ Auth init failed", err);

            // Refresh might fail with 401 → handle properly
            if (err?.response?.status === 401) {
              get().handleAuthError();
            } else {
              set({
                token: null,
                user: null,
                isAuthenticated: false,
                initialized: true,
                loading: false,
              });
            }
          }
        })();

        await authInitializationPromise;
        authInitializationPromise = null;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.loading = false;
          state.initialized = false;
          state.isAuthenticated = !!(state.token && state.user);
        }
        // Reset global flags
        authInitializationPromise = null;
        isHandlingAuthError = false;
      },
    }
  )
);
