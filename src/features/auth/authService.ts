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
    const res = await api.post<AuthResponse>("/api/login", data, {
      headers: { "X-XSRF-TOKEN": xsrfToken },
    });
    return res.data;
  },
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    await ensureCsrfCookie();
    const xsrfToken = Cookies.get("XSRF-TOKEN");
    const res = await api.post<AuthResponse>("/api/register", data, {
      headers: { "X-XSRF-TOKEN": xsrfToken },
    });
    return res.data;
  },
  logout: async (): Promise<void> => {
    const xsrfToken = Cookies.get("XSRF-TOKEN");
    await api.post("/api/logout", {}, { headers: { "X-XSRF-TOKEN": xsrfToken } });
    localStorage.clear();
  },
  
  me: async (): Promise<{ user: AuthResponse["user"] }> => {
    const res = await api.get("/api/me");
    return res.data;
  },
};
