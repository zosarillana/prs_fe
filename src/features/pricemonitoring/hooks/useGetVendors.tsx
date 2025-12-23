import {
  useQuery,
  keepPreviousData,
} from "@tanstack/react-query";
import React from "react";
import { vendorService } from "../vendorService";

export function useGetVendorsHook() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");

  const tableQuery = useQuery({
    queryKey: ["vendors", page, pageSize, searchTerm],
    queryFn: () =>
      vendorService.getAll({
        pageNumber: page,
        pageSize,
        searchTerm,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });

  return {
    tableQuery,
    page,
    setPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
  };
}
