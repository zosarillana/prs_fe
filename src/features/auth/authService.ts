// Updated AuthService
import api from "@/lib/api";
import Cookies from "js-cookie";
import { LoginInput, RegisterInput, AuthResponse } from "./types";

async function ensureCsrfCookie() {
  await api.get("/sanctum/csrf-cookie");
}

// 🚨 Counter to track calls
let meCallCounter = 0;

export const authService = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    await ensureCsrfCookie();
    const xsrfToken = Cookies.get("XSRF-TOKEN");
    const res = await api.post<AuthResponse>("/login", data, {
      headers: { "X-XSRF-TOKEN": xsrfToken },
    });

    if (res.data.access_token) {
      localStorage.setItem("auth_token", res.data.access_token);
    }

    return res.data;
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    await ensureCsrfCookie();
    const xsrfToken = Cookies.get("XSRF-TOKEN");

    const res = await api.post<AuthResponse>("/register", data, {
      headers: { "X-XSRF-TOKEN": xsrfToken },
    });

    return res.data;
  },

  logout: async (): Promise<void> => {
    try {
      await ensureCsrfCookie(); // ✅ ensure the CSRF token exists
      const xsrfToken = Cookies.get("XSRF-TOKEN");

      await api.post("/logout", {}, { headers: { "X-XSRF-TOKEN": xsrfToken } });
    } catch (err) {
      console.error("Logout API failed:", err);
      // Even if backend fails, still clear client state
    }

    // 1. Clear cookies & storage
    // Cookies.remove("XSRF-TOKEN");
    // localStorage.removeItem("auth_token");
    // localStorage.clear();
    // sessionStorage.clear();

    // 2. Force UI reset (fresh state, no stale data)
    // window.location.href = "/login";
  },

  // 🆕 Change password for authenticated user
  changePassword: async (data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string }> => {
    await ensureCsrfCookie();
    const xsrfToken = Cookies.get("XSRF-TOKEN");
    
    const res = await api.post("/change-password", data, {
      headers: { "X-XSRF-TOKEN": xsrfToken },
    });
    
    return res.data;
  },

  me: async (): Promise<{ user: AuthResponse["user"] }> => {
    meCallCounter++;

    // 🚨 AGGRESSIVE DEBUGGING
    console.log(`🔥 /ME CALL #${meCallCounter} 🔥`);
    console.log("🕐 Time:", new Date().toISOString());
    console.log("📍 Current URL:", window.location.href);
    console.log("📞 Call Stack:");
    console.trace(); // This will show you EXACTLY what called this

    const res = await api.get("/me");
    console.log(`✅ /ME CALL #${meCallCounter} COMPLETED`);
    return res.data;
  },
};
