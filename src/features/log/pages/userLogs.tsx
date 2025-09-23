import React, { useEffect, useState } from "react";
import { userLogService } from "../userLogService";
import type { UserLog } from "../types";
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

export default function UserLogs() {
  const [data, setData] = useState<{
    items: UserLog[];
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
      const res = await userLogService.getAll({
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
        <h1 className="text-3xl font-bold">User Logs</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search user logs..."
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
              <TableHead className="border-b">Name</TableHead>
              <TableHead className="border-b">Email</TableHead>
              <TableHead className="border-b">IP Address</TableHead>
              <TableHead className="border-b">Logged In</TableHead>
              <TableHead className="border-b">Logged Out</TableHead>
              <TableHead className="border-b">User Agent</TableHead>
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
                      <Badge variant="outline">Guest</Badge>
                    )}
                  </TableCell>

                  <TableCell>{log.user_email ?? "—"}</TableCell>
                  <TableCell>{log.ip_address ?? "—"}</TableCell>

                  <TableCell>
                    {log.logged_in_at
                      ? new Date(log.logged_in_at).toLocaleString()
                      : "—"}
                  </TableCell>

                  <TableCell>
                    {log.logged_out_at ? (
                      new Date(log.logged_out_at).toLocaleString()
                    ) : (
                      <Badge variant="secondary">Active</Badge> // ✅
                    )}
                  </TableCell>

                  <TableCell className="max-w-[220px] truncate">
                    {log.user_agent ?? "—"}
                  </TableCell>
                </TableRow>
              ))}

            {!fetching && data?.items?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-muted-foreground"
                >
                  No logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* pagination */}
      {data && (
        <div className="flex justify-between items-center border-t p-4 mt-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && setPage(page - 1)}
                  className={page === 1 ? "opacity-50 pointer-events-none" : ""}
                />
              </PaginationItem>

              {Array.from({ length: data.totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={page === i + 1}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

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

          {/* page size selector */}
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
      )}
    </div>
  );
}
