import {useMutation} from "@tanstack/react-query";
import { authService } from "../service";
import { useAuthStore } from "@/store";

export function useLogin() {
  const setToken = useAuthStore((state) => state.setToken);

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setToken(data.token);
    },
  });
}
