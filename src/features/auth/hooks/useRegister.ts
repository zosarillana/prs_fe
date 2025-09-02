import { useMutation } from "@tanstack/react-query";
import { authService } from "../authService";
import { RegisterInput, RegisterResponse } from "../types";

export function useRegister() {
  return useMutation<RegisterResponse, unknown, RegisterInput>({
    mutationFn: authService.register,
    onError: (error) => {
      console.error("Registration error:", error);
    },
  });
}
