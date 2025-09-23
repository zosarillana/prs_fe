// Updated useEditUserForm hook
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
  // Profile form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState<string>("");
  const [role, setRole] = useState<string>("");

  // Password form states
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirm: false,
  });

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

  // Reset password form when dialog closes/user changes
  useEffect(() => {
    setPassword("");
    setPasswordConfirmation("");
    setShowPasswords({ password: false, confirm: false });
  }, [user]);

  const togglePasswordVisibility = (field: 'password' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Mutation for updating user profile
  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: (data: Partial<User>) => userService.update(user!.id, data),
    onMutate: () => {
      toast.loading("Saving changes...");
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onSuccess?.();
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error(err?.response?.data?.message || "Failed to update user");
    },
  });

  // Mutation for updating user password
  const { mutate: updatePassword, isPending: isPasswordPending } = useMutation({
    mutationFn: (data: { password: string; password_confirmation: string }) => 
      userService.updatePassword(user!.id, data),
    onMutate: () => {
      toast.loading("Updating password...");
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Password updated successfully");
      // Reset password form
      setPassword("");
      setPasswordConfirmation("");
      setShowPasswords({ password: false, confirm: false });
      onSuccess?.();
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error(err?.response?.data?.message || "Failed to update password");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    updateProfile({
      name,
      email,
      department: [department],
      role: [role],
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (password !== passwordConfirmation) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    updatePassword({
      password,
      password_confirmation: passwordConfirmation,
    });
  };

  return {
    // Profile form
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
    // Password form
    password,
    setPassword,
    passwordConfirmation,
    setPasswordConfirmation,
    showPasswords,
    togglePasswordVisibility,
    isPasswordPending,
    handlePasswordSubmit,
  };
}