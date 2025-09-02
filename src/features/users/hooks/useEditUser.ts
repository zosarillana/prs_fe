// src/features/users/hooks/useEditUserForm.ts
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { User } from "../types";
import { userService } from "../userService";

interface UseEditUserFormProps {
  user: User | null;
  onSuccess?: () => void;
}

export function useEditUserForm({ user, onSuccess }: UseEditUserFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState<string>("");
  const [role, setRole] = useState<string>("");

  const queryClient = useQueryClient();

  // Pre-fill form when user is passed
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setDepartment(user.department?.[0] ?? "");
      setRole(user.role?.[0] ?? "");
    }
  }, [user]);

  // Mutation for updating user
  const { mutate, isPending } = useMutation({
    mutationFn: (data: Partial<User>) => userService.update(user!.id, data),
    onMutate: () => {
      toast.loading("Saving changes...");
    },
    onSuccess: () => {
      toast.dismiss(); // remove loading
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] }); // refresh users list
      onSuccess?.();
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error(err?.message || "Failed to update user ❌");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    mutate({
      name,
      email,
      department: [department],
      role: [role],
    });
  };

  return {
    name,
    setName,
    email,
    setEmail,
    department,
    setDepartment,
    role,
    setRole,
    isPending,
    handleSubmit,
  };
}