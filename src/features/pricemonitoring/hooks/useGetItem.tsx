import {
  useQuery,
  keepPreviousData,
} from "@tanstack/react-query";
import React from "react";
import { itemService } from "../itemService";

export function useGetItemsHook() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");

  const tableQuery = useQuery({
    queryKey: ["items", page, pageSize, searchTerm],
    queryFn: () =>
      itemService.getAll({
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
