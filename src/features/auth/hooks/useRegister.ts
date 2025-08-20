import { useMutation } from "@tanstack/react-query";
import { authService } from "../authService";
import { useAuthStore } from "@/store/auth/authStore";
import { RegisterInput, RegisterResponse } from "../types";
import { useNavigate } from "react-router-dom";

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation<RegisterResponse, unknown, RegisterInput>({
    mutationFn: authService.register,
    onSuccess: (data) => {
      // Store both token and user data
      setAuth(data.access_token, data.user);
      navigate("/login");
    },
    onError: (error) => {
      console.error("Registration error:", error);
    },
  });
}