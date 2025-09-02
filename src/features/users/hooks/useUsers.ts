import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { userService } from "@/features/users/userService";
import type { User } from "../types";
import type { PaginatedResponse } from "@/types/paginator";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

export function useUsers() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 👇 debounced searchTerm
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // ✅ Query (only once, with debounce)
  const { data, isLoading, isFetching } = useQuery<PaginatedResponse<User>>({
    queryKey: ["users", page, pageSize, debouncedSearchTerm],
    queryFn: () =>
      userService.getAll({
        pageNumber: page,
        pageSize,
        searchTerm: debouncedSearchTerm,
      }),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30,   // 30 minutes
  });

  // ✅ Update mutation
  const updateUserMutation = useMutation({
    mutationFn: (updatedUser: Partial<User>) => {
      if (!selectedUser) throw new Error("No user selected");
      return userService.update(selectedUser.id, updatedUser);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully!");
      setOpenEditModal(false);
      setSelectedUser(null);
    },
    onError: (err) => {
      toast.error("Failed to update user");
      console.error(err);
    },
  });

  // ✅ Delete mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => userService.delete(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully!");
    },
    onError: (err) => {
      toast.error("Failed to delete user");
      console.error(err);
    },
  });

  const handleSave = (updatedUser: Partial<User>) => {
    updateUserMutation.mutate(updatedUser);
  };

  const handleDelete = async (id: number) => {
    const toastId = toast.loading("Deleting user...");

    try {
      await userService.delete(id);
      toast.success("User deleted successfully", { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (err) {
      console.error("Failed to delete user", err);
      toast.error("Failed to delete user", { id: toastId });
    }
  };

  return {
    data,
    loading: isLoading,
    fetching: isFetching,
    page,
    setPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    openModal,
    setOpenModal,
    openEditModal,
    setOpenEditModal,
    selectedUser,
    setSelectedUser,
    handleSave,
    handleDelete,
  };
}
