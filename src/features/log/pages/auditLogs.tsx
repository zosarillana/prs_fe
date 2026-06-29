import React, { useEffect, useState } from "react";
import { auditLogService } from "../auditLogsService";
import type { AuditLog } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AuditLogs() {
  const [data, setData] = useState<{
    items: AuditLog[];
    totalPages: number;
    totalItems: number;
    pageNumber: number;
    pageSize: number;
  }>();
  const [fetching, setFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const loadLogs = async () => {
    setFetching(true);
    try {
      const res = await auditLogService.getAll({
        pageNumber: page,
        pageSize,
        searchTerm,
        sortBy: "id",
        sortOrder: "desc",
      });
      setData(res);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, pageSize, searchTerm]);

  return (
    <div className="p-6 -mt-4">
      {/* header */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search audit logs..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* table */}
      <div className="overflow-hidden rounded-lg border shadow">
        <Table className="border-separate border-spacing-0 w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] border-b">#</TableHead>
              <TableHead className="border-b">User</TableHead>
              <TableHead className="border-b">Email</TableHead>
              <TableHead className="border-b">Action</TableHead>
              <TableHead className="border-b">Model</TableHead>
              <TableHead className="border-b">IP Address</TableHead>
              <TableHead className="border-b">Created At</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {fetching && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  <Loader className="h-5 w-5 animate-spin inline mr-2" />
                  Loading...
                </TableCell>
              </TableRow>
            )}

            {!fetching &&
              data?.items?.map((log, idx) => (
                <TableRow key={log.id}>
                  <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>

                  <TableCell>
                    {log.user_name ? (
                      <span className="font-medium">{log.user_name}</span>
                    ) : (
                      <Badge variant="outline">System</Badge>
                    )}
                  </TableCell>

                  <TableCell>{log.user_email ?? "—"}</TableCell>
                  <TableCell className="capitalize">
                    {log.action ?? "—"}
                  </TableCell>
                  <TableCell>{log.model_type ?? "—"}</TableCell>
                  <TableCell>{log.ip_address ?? "—"}</TableCell>
                  <TableCell>
                    {log.created_at
                      ? new Date(log.created_at).toLocaleString()
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}

            {!fetching && data?.items?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-muted-foreground"
                >
                  No audit logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* pagination */}
      {data && (
        <div className="flex justify-between items-center border-t p-4 mt-2">
          {/* Showing info */}
          <div className="text-sm text-muted-foreground">
            Showing {Math.min((page - 1) * pageSize + 1, data.totalItems)}–
            {Math.min(page * pageSize, data.totalItems)} of {data.totalItems}
          </div>

          {/* Pagination and page size selector */}
          <div className="flex items-center gap-6">
            <Pagination>
              <PaginationContent>
                {/* Previous Button */}
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => page > 1 && setPage(page - 1)}
                    className={
                      page === 1 ? "opacity-50 pointer-events-none" : ""
                    }
                  />
                </PaginationItem>

                {/* Page Numbers with Ellipsis */}
                {(() => {
                  const total = data.totalPages;
                  const visiblePages: (number | string)[] = [];

                  if (total <= 7) {
                    // Show all pages if few
                    for (let i = 1; i <= total; i++) visiblePages.push(i);
                  } else {
                    const firstPage = 1;
                    const lastPage = total;
                    const startRange = Math.max(2, page - 1);
                    const endRange = Math.min(total - 1, page + 1);

                    visiblePages.push(firstPage);
                    if (startRange > 2) visiblePages.push("...");
                    for (let i = startRange; i <= endRange; i++)
                      visiblePages.push(i);
                    if (endRange < total - 1) visiblePages.push("...");
                    visiblePages.push(lastPage);
                  }

                  return visiblePages.map((p, i) =>
                    typeof p === "number" ? (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={page === p}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={i}>
                        <span className="px-2 text-muted-foreground">...</span>
                      </PaginationItem>
                    )
                  );
                })()}

                {/* Next Button */}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => page < data.totalPages && setPage(page + 1)}
                    className={
                      page === data.totalPages
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            {/* Page size selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Rows per page:
              </span>
              <Select
                value={pageSize.toString()}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 30, 50].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
