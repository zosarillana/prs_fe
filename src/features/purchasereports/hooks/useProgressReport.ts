import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { purchaseReportService } from "../purchaseReportService";
import { purchaseReportProgressService } from "../purchaseReportProgressService";
import { useAuthStore } from "@/store/auth/authStore";
import { useDebounce } from "@/hooks/useDebounce";
import { format } from "date-fns";
import { toast } from "sonner";
import type { PurchaseReport } from "../types";
import type { PaginatedResponse } from "@/types/paginator";

/**
 * Hook for listing purchase reports and managing their progress events
 */
export function useProgressReport() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTerm, setStatusTerm] = useState("");
  const [prStatusTerm, setPrStatusTerm] = useState("for_approval");
  const [completedTr, setCompletedTr] = useState(false);
  const [ownDepartment, setOwnDepartment] = useState(false);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  // Calendar Dialog State
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Debounced values
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedStatusTerm = useDebounce(statusTerm, 300);
  const debouncedPrStatusTerm = useDebounce(prStatusTerm, 300);

  // Fetch Purchase Reports
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
        fromDate: fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
        toDate: toDate ? format(toDate, "yyyy-MM-dd") : undefined,
      };
      return purchaseReportService.getTable(params);
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // Fetch progress events for selected report
  const progressQuery = useQuery({
    queryKey: ["purchaseReportProgresses", selectedReportId],
    queryFn: () => purchaseReportProgressService.getAll(selectedReportId!),
    enabled: selectedReportId !== null,
  });

  // Add progress event mutation
  const addProgressMutation = useMutation({
    mutationFn: (payload: any) =>
      purchaseReportProgressService.create(selectedReportId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["purchaseReportProgresses", selectedReportId],
      });
      toast.success("Progress event added");
    },
    onError: () => {
      toast.error("Failed to add progress event");
    },
  });

  // Update progress event mutation
  const updateProgressMutation = useMutation({
    mutationFn: ({ progressId, payload }: { progressId: number; payload: any }) =>
      purchaseReportProgressService.update(progressId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["purchaseReportProgresses", selectedReportId],
      });
      toast.success("Progress event updated");
    },
    onError: () => {
      toast.error("Failed to update progress event");
    },
  });

  // Delete progress event mutation
  const deleteProgressMutation = useMutation({
    mutationFn: (progressId: number) =>
      purchaseReportProgressService.delete(progressId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["purchaseReportProgresses", selectedReportId],
      });
      toast.success("Progress event deleted");
    },
    onError: () => {
      toast.error("Failed to delete progress event");
    },
  });

  // Handle opening calendar
  const handleOpenCalendar = (reportId: number) => {
    setSelectedReportId(reportId);
    setCalendarOpen(true);
  };

  // Handle closing calendar
  const handleCloseCalendar = () => {
    setCalendarOpen(false);
    setTimeout(() => setSelectedReportId(null), 300); // Clear after animation
  };

  // Wrapper functions to match expected types
  const handleAddProgress = async (payload: any): Promise<void> => {
    await addProgressMutation.mutateAsync(payload);
  };

  const handleUpdateProgress = async (progressId: number, payload: any): Promise<void> => {
    await updateProgressMutation.mutateAsync({ progressId, payload });
  };

  const handleDeleteProgress = async (progressId: number): Promise<void> => {
    await deleteProgressMutation.mutateAsync(progressId);
  };

   const handleClearFilters = () => {
    setSearchTerm("");
    setStatusTerm("");
    setPrStatusTerm("");
    setCompletedTr(false);
    setOwnDepartment(false);
    setFromDate(null);
    setToDate(null);
    setPage(1); // Reset to first page when clearing filters
  };

  return {
    // User
    user,

    // Table Data
    data,
    loading: isLoading,
    fetching: isFetching,
    refetch,

    // Pagination
    page,
    setPage,
    pageSize,
    setPageSize,

    // Filters
    searchTerm,
    setSearchTerm,
    statusTerm,
    setStatusTerm,
    prStatusTerm,
    setPrStatusTerm,
    completedTr,
    setCompletedTr,
    ownDepartment,
    setOwnDepartment,
    fromDate,
    setFromDate,
    toDate,
    setToDate,

    // Calendar & Progress Events
    selectedReportId,
    calendarOpen,
    handleOpenCalendar,
    handleCloseCalendar,
    progresses: progressQuery.data?.progresses || [],
    progressLoading: progressQuery.isLoading,
    addProgress: handleAddProgress,
    updateProgress: handleUpdateProgress,
    deleteProgress: handleDeleteProgress,
    handleClearFilters,
  };
}