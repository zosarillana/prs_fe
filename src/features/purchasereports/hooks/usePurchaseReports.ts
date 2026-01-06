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
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

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
  const [tagDescription, setTagDescription] = useState(""); // ✅ NEW STATE
  const [prStatusTerm, setPrStatusTerm] = useState(""); // ✅ NEW: for pr_status
  const [completedTr, setCompletedTr] = useState(false);
  const [ownDepartment, setOwnDepartment] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedStatusTerm = useDebounce(statusTerm, 300); // debounce for smoother UX
  const debouncedPrStatusTerm = useDebounce(prStatusTerm, 300); // ✅ NEW
  const [open, setOpen] = useState(false);
  const [viewId, setViewId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveTargetId, setApproveTargetId] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  // ✅ QUERY – include statusTerm in queryKey + queryFn
  const { data, isLoading, isFetching, refetch } = useQuery<
    PaginatedResponse<PurchaseReport>
  >({
    queryKey: [
      "purchaseReports",
      page,
      pageSize,
      debouncedSearchTerm,
      debouncedStatusTerm,
      debouncedPrStatusTerm,
      completedTr,
      ownDepartment,
      tagDescription,
      fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
      toDate ? format(toDate, "yyyy-MM-dd") : undefined,
    ],
    queryFn: () => {
      const params = {
        pageNumber: page,
        pageSize,
        searchTerm: debouncedSearchTerm,
        statusTerm: debouncedStatusTerm,
        prStatusTerm: debouncedPrStatusTerm,
        completedTr,
        ownDepartment,
        tagDescription,
        fromDate: fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
        toDate: toDate ? format(toDate, "yyyy-MM-dd") : undefined,
      };

      console.log("🔍 API Params:", params);

      return purchaseReportService.getTable(params);
    },

    placeholderData: keepPreviousData,

    // ✅ IMPORTANT: These settings allow websocket updates to work
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    refetchOnMount: true, // DO refetch on mount (to catch invalidated queries)
    staleTime: 1000 * 60 * 5, // Cache valid for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in memory for 30 minutes

    // ✅ NEW: Refetch when query becomes stale
    refetchOnReconnect: true,
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
    mutationFn: ({ id, po_no }: { id: number; po_no: string }) =>
      purchaseReportService.updatePoNo(id, po_no),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchaseReports"] });
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
      toast.success("PO approved successfully 🎉");
    },

    onError: (error: any) => {
      // Try to extract a readable error message
      const errorMessage =
        error?.response?.data?.error || // Axios-style error
        error?.message || // JS Error object
        "Failed to approve PO"; // Fallback

      toast.error(errorMessage);
    },
  });

  // Handlers
  const handleView = (id: number) => {
    setViewId(id);
    setOpen(true);
  };

  const navigate = useNavigate();
  const handleCopyToNew = async (id: number) => {
    console.log("🔍 Copy clicked for ID:", id);

    try {
      console.log("📡 Fetching report data...");
      const reportData = await purchaseReportService.getById(id);
      console.log("✅ Report data fetched:", reportData);

      // ✅ Fetch new series number from backend
      const newSeriesNo = await purchaseReportService.getNextSeriesNo();
      console.log("✅ New series number:", newSeriesNo);

      // Merge with copied data but update identifiers
      const { id: reportId, ...rest } = reportData; // exclude id
      const copiedData = {
        ...rest,
        id: undefined,
        series_no: newSeriesNo.toString(), // ✅ NEW series number
        pr_status: "draft",
        po_no: null,
        po_status: null,
        hod_signed_at: null,
        tr_signed_at: null,
        po_created_date: null,
        po_approved_date: null,
        purchaser_id: null,
      };

      console.log("📋 Copied data prepared:", copiedData);

      // Navigate to create page with copied data
      navigate("/purchase-reports/create", {
        state: { copyFrom: copiedData },
      });
    } catch (error) {
      console.error("❌ Copy error:", error);
      toast.error("Failed to copy report");
    }
  };

  const handleViewDraft = async (id: number) => {
    console.log("📝 Viewing draft with ID:", id);

    try {
      // 1️⃣ Fetch the draft data by ID
      const draftData = await purchaseReportService.getById(id);
      console.log("✅ Draft data fetched:", draftData);

      // 2️⃣ Navigate to the create/edit page with draft data
      navigate("/purchase-reports/create", {
        state: {
          editDraft: true, // 👈 flag to tell the create page it's an edit
          draftData: draftData,
        },
      });
    } catch (error) {
      console.error("❌ Failed to load draft:", error);
      toast.error("Failed to open draft for editing.");
    }
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

  const returnPoMutation = useMutation({
    mutationFn: (id: number) => purchaseReportService.returnPo(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchaseReports"] });
      toast.success("PO Returned successfully");
    },
    onError: () => toast.error("Returned to cancel PO"),
  });

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusTerm("");
    setPrStatusTerm("");
    setTagDescription("");
    setCompletedTr(false);
    setOwnDepartment(false);
    setFromDate(null);
    setToDate(null);
    setPage(1); // Reset to first page when clearing filters
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
    statusTerm,
    setStatusTerm, // ✅ expose setter for dropdown
    prStatusTerm, // ✅ expose pr_status state
    setPrStatusTerm, // ✅ expose pr_status setter
    tagDescription,
    setTagDescription,
    setCompletedTr,
    ownDepartment,
    setOwnDepartment,
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
    returnPoMutation: returnPoMutation.mutate,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    handleCopyToNew,
    handleViewDraft,
    handleClearFilters,
  };
}
