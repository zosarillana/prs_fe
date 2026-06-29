import {
  useQuery,
  useMutation,
  keepPreviousData,
} from "@tanstack/react-query";
import { priceMonitoringService } from "../priceMonitoringService";
import React from "react";

export function useGetItemPriceHook() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");

  const tableQuery = useQuery({
    queryKey: ["itemPrices", page, pageSize, searchTerm],
    queryFn: () =>
      priceMonitoringService.getTable({
        pageNumber: page,
        pageSize,
        searchTerm,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });

  const importMutation = useMutation({
    mutationFn: priceMonitoringService.importExcel,
    onSuccess: () => {
      tableQuery.refetch();
    },
  });

  return {
    tableQuery,
    importMutation,
    page,
    setPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
  };
}
