import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { purchaseReportService } from "../purchaseReportService";
import { useAuthStore } from "@/store/auth/authStore";
import type { PurchaseReport } from "../types";
import type { PaginatedResponse } from "@/types/paginator";
import { format } from "date-fns";
import { useDebounce } from "@/hooks/useDebounce";
import React from "react";

export function useReportGetHook() {
  const user = useAuthStore((state) => state.user);

  // State for filters
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusTerm, setStatusTerm] = React.useState("");
  const [prStatusTerm, setPrStatusTerm] = React.useState("");
  const [completedTr, setCompletedTr] = React.useState(false);
  const [fromDate, setFromDate] = React.useState<Date | null>(null);
  const [toDate, setToDate] = React.useState<Date | null>(null);

  // Debounce inputs for smoother UX
  const debouncedSearch = useDebounce(searchTerm, 400);
  const debouncedStatus = useDebounce(statusTerm, 300);
  const debouncedPrStatus = useDebounce(prStatusTerm, 300);

  // 🔍 Query
  const { data, isLoading, isFetching, refetch } = useQuery<
    PaginatedResponse<PurchaseReport>
  >({
    queryKey: [
      "reportGetHook",
      page,
      pageSize,
      debouncedSearch,
      debouncedStatus,
      debouncedPrStatus,
      completedTr,
      fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
      toDate ? format(toDate, "yyyy-MM-dd") : undefined,
    ],
    queryFn: () => {
      const params = {
        pageNumber: page,
        pageSize,
        searchTerm: debouncedSearch,
        statusTerm: debouncedStatus,
        prStatusTerm: debouncedPrStatus,
        completedTr,
        fromDate: fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
        toDate: toDate ? format(toDate, "yyyy-MM-dd") : undefined,
      };

      // ✅ Choose endpoint based on user role
      if (user?.role?.includes("purchasing")) {
        console.log("🟢 Using getTableReports (no role filters)");
        return purchaseReportService.getTableReports(params);
      }

      console.log("🟡 Using getTable (with role filters)");
      return purchaseReportService.getTable(params);
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  return {
    data,
    loading: isLoading,
    fetching: isFetching,
    refetch,
    // Pagination + filters
    page,
    setPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    statusTerm,
    setStatusTerm,
    prStatusTerm,
    setPrStatusTerm,
    completedTr,
    setCompletedTr,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
  };
}
