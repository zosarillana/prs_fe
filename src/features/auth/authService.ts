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
  await ensureCsrfCookie(); // ✅ ensure the CSRF token exists
  const xsrfToken = Cookies.get("XSRF-TOKEN");

  await api.post("/logout", {}, { headers: { "X-XSRF-TOKEN": xsrfToken } });

  localStorage.removeItem("auth_token");
  localStorage.clear();
},

  me: async (): Promise<{ user: AuthResponse["user"] }> => {
    meCallCounter++;
    
    // 🚨 AGGRESSIVE DEBUGGING
    console.log(`🔥 /ME CALL #${meCallCounter} 🔥`);
    console.log("🕐 Time:", new Date().toISOString());
    console.log("📍 Current URL:", window.location.href);
    console.log("📞 Call Stack:");
    console.trace(); // This will show you EXACTLY what called this
    
    // Add a debugger to pause execution
    // debugger; // Uncomment this to pause and inspect
    
    const res = await api.get("/me");
    console.log(`✅ /ME CALL #${meCallCounter} COMPLETED`);
    return res.data;
  },
};