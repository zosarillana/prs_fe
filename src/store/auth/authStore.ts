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
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        setTimeout(() => {
          isHandlingAuthError = false;
        }, 1000);
      },

      initializeAuth: async () => {
        // 🔒 If already initializing, return the same promise
        if (authInitializationPromise) {
          console.log("🛡️ Auth already initializing, reusing promise");
          return authInitializationPromise;
        }

        const state = get();
        
        // If already initialized, do nothing
        if (state.initialized) {
          console.log("🛡️ Auth already initialized, skipping");
          return;
        }

        // 🔒 Create and store the initialization promise
        authInitializationPromise = (async () => {
          console.log("🚀 Starting auth initialization ONCE");
          
          const currentState = get();
          
          // No token = not authenticated
          if (!currentState.token) {
            console.log("❌ No token found");
            set({ initialized: true, loading: false });
            return;
          }

          // Have both token and user = already authenticated
          if (currentState.token && currentState.user) {
            console.log("✅ Using cached auth data");
            set({ 
              isAuthenticated: true, 
              initialized: true, 
              loading: false 
            });
            return;
          }

          // Need to fetch user data
          console.log("🔄 Calling /me API");
          set({ loading: true });
          
          try {
            const res = await authService.me();
            if (res?.user) {
              console.log("✅ /me API success");
              set({ 
                user: res.user, 
                isAuthenticated: true, 
                loading: false,
                initialized: true 
              });
            } else {
              console.log("❌ /me API returned no user");
              set({ 
                token: null,
                user: null, 
                isAuthenticated: false, 
                loading: false,
                initialized: true 
              });
            }
          } catch (err: any) {
            console.error("❌ /me API failed:", err);
            
            // If 401, handle it properly
            if (err?.response?.status === 401) {
              get().handleAuthError();
            } else {
              set({ 
                token: null,
                user: null, 
                isAuthenticated: false, 
                loading: false,
                initialized: true 
              });
            }
          }
        })();

        await authInitializationPromise;
        authInitializationPromise = null; // Clear when done
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