import { useState } from "react";
import { toast } from "sonner";
import { useRegister } from "@/features/auth/hooks/useRegister";
import { useQueryClient } from "@tanstack/react-query";

export function useRegisterForm(onSuccessCallback: (open: boolean) => void) {
  const queryClient = useQueryClient();
  const registerMutation = useRegister();
  const { mutate, isPending, isError, error } = registerMutation;

  const [department, setDepartment] = useState<string>("");
  const [role, setRole] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const password_confirmation = formData.get("confirm-password") as string;

    const toastId = toast.loading("Creating account...");

    mutate(
      {
        name,
        email,
        password,
        password_confirmation,
        department: [department],
        role: [role],
      },
      {
        onSuccess: async () => {
          toast.success("User registered successfully!", { id: toastId });

          // 👇 refresh the Users table
          await queryClient.invalidateQueries({ queryKey: ["users"] });

          onSuccessCallback(false); // close dialog
        },
        onError: (err: any) => {
          toast.error((err as any)?.message || "Registration failed", {
            id: toastId,
          });
        },
      }
    );
  };

  return {
    department,
    setDepartment,
    role,
    setRole,
    handleSubmit,
    isPending,
    isError,
    error,
  };
}
