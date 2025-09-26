import { useEffect, useState } from "react";
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
import { Uom } from "@/features/uom/types";
import { uomService } from "@/features/uom/uomService";

export function usePurchaseReports() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  // UI State
  const [poDialogOpen, setPoDialogOpen] = useState(false);
  const [poTargetId, setPoTargetId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTerm, setStatusTerm] = useState(""); // ✅ NEW STATE
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedStatusTerm = useDebounce(statusTerm, 300); // debounce for smoother UX

  const [open, setOpen] = useState(false);
  const [viewId, setViewId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveTargetId, setApproveTargetId] = useState<number | null>(null);
  
  // ✅ QUERY – include statusTerm in queryKey + queryFn
  const { data, isLoading, isFetching, refetch } = useQuery<
    PaginatedResponse<PurchaseReport>
  >({
    queryKey: [
      "purchaseReports",
      page,
      pageSize,
      debouncedSearchTerm,
      debouncedStatusTerm, // ✅ include in key
    ],
    queryFn: () =>
      purchaseReportService.getTable({
        pageNumber: page,
        pageSize,
        searchTerm: debouncedSearchTerm,
        statusTerm: debouncedStatusTerm, // ✅ send to backend
      }),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // ✅ Mutations
  const deleteReportMutation = useMutation({
    mutationFn: (id: number) => purchaseReportService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchaseReports"] });
      toast.success("Report deleted successfully");
    },
    onError: () => toast.error("Failed to delete report"),
  });

  const updatePoMutation = useMutation({
    mutationFn: ({ id, po_no }: { id: number; po_no: number }) =>
      purchaseReportService.updatePoNo(id, po_no),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchaseReports"] });
      toast.success("PO number updated successfully");
    },
    onError: () => toast.error("Failed to update PO number"),
  });

  const approvePoMutation = useMutation({
    mutationFn: ({
      id,
      date,
      status,
    }: {
      id: number;
      date: string;
      status: string;
    }) => purchaseReportService.poApproveDate(id, { date, status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchaseReports"] });
      toast.success("PO approved successfully");
    },
    onError: () => toast.error("Failed to approve PO"),
  });

  // Handlers
  const handleView = (id: number) => {
    setViewId(id);
    setOpen(true);
  };

  const handleEdit = (id: number) => {
    setEditId(id);
    setEditOpen(true);
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

  const handleSetPo = (id: number) => {
    setPoTargetId(id);
    setPoDialogOpen(true);
  };

  const cancelPoMutation = useMutation({
    mutationFn: (id: number) => purchaseReportService.cancelPoNo(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchaseReports"] });
      toast.success("PO cancelled successfully");
    },
    onError: () => toast.error("Failed to cancel PO"),
  });

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
    statusTerm,
    setStatusTerm, // ✅ expose setter for dropdown
    open,
    setOpen,
    viewId,
    handleView,
    editOpen,
    setEditOpen,
    editId,
    handleEdit,
    handleDelete,
    refetch,
    poDialogOpen,
    setPoDialogOpen,
    poTargetId,
    handleSetPo,
    setApproveTargetId,
    setApproveDialogOpen,
    approveDialogOpen,
    approveTargetId,
    updatePo: updatePoMutation.mutate,
    approvePo: approvePoMutation.mutate,
    approvePoMutation,
    cancelPoMutation: cancelPoMutation.mutate,
  };
}
