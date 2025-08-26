import api from "@/lib/api";
import Cookies from "js-cookie";
import { LoginInput, RegisterInput, AuthResponse } from "./types";

async function ensureCsrfCookie() {
  await api.get("/sanctum/csrf-cookie");
}

export const authService = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    await ensureCsrfCookie();
    const xsrfToken = Cookies.get("XSRF-TOKEN");
    const res = await api.post<AuthResponse>("/login", data, {
      headers: { "X-XSRF-TOKEN": xsrfToken },
    });
    
    // Store the correct token field (access_token instead of token)
    if (res.data.access_token) {
      localStorage.setItem('auth_token', res.data.access_token);
    }
    
    return res.data;
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    await ensureCsrfCookie();
    const xsrfToken = Cookies.get("XSRF-TOKEN");
    const res = await api.post<AuthResponse>("/register", data, {
      headers: { "X-XSRF-TOKEN": xsrfToken },
    });
    
    // Store the correct token field
    if (res.data.access_token) {
      localStorage.setItem('auth_token', res.data.access_token);
    }
    
    return res.data;
  },

  logout: async (): Promise<void> => {
    const xsrfToken = Cookies.get("XSRF-TOKEN");
    await api.post("/logout", {}, { headers: { "X-XSRF-TOKEN": xsrfToken } });
    
    // Remove the token on logout
    localStorage.removeItem('auth_token');
    localStorage.clear();
  },
  
  me: async (): Promise<{ user: AuthResponse["user"] }> => {
    const res = await api.get("/me");
    return res.data;
  },
};