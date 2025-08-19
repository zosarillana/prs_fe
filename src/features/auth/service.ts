import api from "@/lib/api";
import { LoginInput, LoginResponse } from "./types";

export const authService = {
  login: async (data: LoginInput): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>("/login", data);
    return res.data;
  },
  me: async () => {
    const res = await api.get("/me");
    return res.data;
  },
};
