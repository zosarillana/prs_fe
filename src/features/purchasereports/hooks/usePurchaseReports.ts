import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { purchaseReportService } from "../purchaseReportService";
import { useAuthStore } from "@/store/auth/authStore";
import type { PurchaseReport } from "../types";
import type { PaginatedResponse } from "@/types/paginator";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

export function usePurchaseReports() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  // pagination + search state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // modal state
  const [open, setOpen] = useState(false);
  const [viewId, setViewId] = useState<number | null>(null);

  const { data, isLoading, isFetching } = useQuery<
    PaginatedResponse<PurchaseReport>
  >({
    queryKey: ["purchaseReports", page, pageSize, debouncedSearchTerm],
    queryFn: () =>
      purchaseReportService.getTable({
        pageNumber: page,
        pageSize,
        searchTerm: debouncedSearchTerm,
      }),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false, // ⬅️ don’t refetch when switching tabs
    refetchOnReconnect: false, // ⬅️ don’t refetch when network reconnects
    refetchOnMount: false, // ⬅️ don’t refetch when component remounts
    staleTime: 1000 * 60 * 5, // ⬅️ data is "fresh" for 5 minutes
    gcTime: 1000 * 60 * 30, // ⬅️ keep in cache for 30 minutes
  });

  // ✅ Delete mutation
  const deleteReportMutation = useMutation({
    mutationFn: (id: number) => purchaseReportService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchaseReports"] });
      toast.success("Report deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete report");
    },
  });

  // handlers
  const handleView = (id: number) => {
    setViewId(id);
    setOpen(true);
  };

  const handleEdit = (id: number) => {
    console.log("Edit report with ID:", id);
  };

  const handleDelete = (item: PurchaseReport) => {
    toast("Delete Report?", {
      description: `Are you sure you want to delete report #${item.series_no}?`,
      action: {
        label: "Confirm",
        onClick: () => deleteReportMutation.mutate(item.id),
      },
    });
  };

  return {
    user,
    data,
    loading: isLoading,
    fetching: isFetching,
    page,
    setPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    open,
    setOpen,
    viewId,
    setViewId,
    handleView,
    handleEdit,
    handleDelete,
  };
}
