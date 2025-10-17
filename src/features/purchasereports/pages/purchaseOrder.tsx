import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { HashIcon, Loader, Search } from "lucide-react";
import { TableSkeleton } from "@/components/ui/skeletons/purchasereports/tableSkeleton";
import { useReportGetHook } from "../hooks/useReportGetHook"; // ✅ NEW HOOK

export default function PurchaseOrder() {
  const {
    data,
    loading,
    fetching,
    page,
    setPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    statusTerm,
    setStatusTerm,
  } = useReportGetHook();

  // ✅ Set default statusTerm for this page (POs only)
  React.useEffect(() => {
    setStatusTerm("canceled,approved,For_approval");
  }, [setStatusTerm]);

  // 🌀 Skeleton loader
  if (loading) {
    return (
      <div className="p-6 -mt-4">
        <h1 className="text-3xl font-bold mb-6">Purchase Orders</h1>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="p-6 -mt-4">
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-6">Purchase Orders</h1>

        <div className="flex flex-row gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search requests..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border text-card-foreground shadow">
        <Table className="border-separate border-spacing-0 w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px] border-b">PR Number</TableHead>
              <TableHead className="border-b">PR Created</TableHead>
              <TableHead className="border-b">PO Number</TableHead>
              <TableHead className="border-b">PO Status</TableHead>
              <TableHead className="border-b">PO Created</TableHead>
              <TableHead className="border-b">PO Approved Date</TableHead>
              <TableHead className="border-b">PO Approval (Days)</TableHead>
              <TableHead className="border-b">
                # of Days On Hold for PO
              </TableHead>
              <TableHead className="border-b">Purchasing Associate</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="cursor-pointer">
            {/* Loader row */}
            {fetching && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Updating reports...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {!fetching &&
              data?.items?.map((item) => (
                <TableRow
                  key={item.id}
                  className={`
                    ${
                      item.po_status === "approved"
                        ? "bg-green-100 hover:bg-green-200"
                        : ""
                    }
                    ${
                      item.po_status === "For_approval"
                        ? "bg-yellow-100 hover:bg-yellow-200"
                        : ""
                    }
                    ${
                      item.po_status === "canceled"
                        ? "bg-red-100 hover:bg-red-200"
                        : ""
                    }
                    [&>td]:!bg-transparent
                  `}
                >
                  <TableCell className="font-medium capitalize">
                    <div className="flex flex-row gap-2">
                      <HashIcon className="h-4 w-5 my-1" />
                      <p className="my-1">{item.series_no}</p>
                    </div>
                  </TableCell>

                  <TableCell>{item.pr_created ?? "n/a"}</TableCell>

                  <TableCell className="font-medium capitalize">
                    <div className="flex flex-row gap-2">
                      <HashIcon className="h-4 w-5 my-1" />
                      <p className="my-1">{item.po_no ?? "n/a"}</p>
                    </div>
                  </TableCell>

                  <TableCell className="capitalize">
                    {item.po_status === "For_approval"
                      ? "For CEO Approval"
                      : item.po_status === "canceled"
                      ? "Cancelled"
                      : item.po_status ?? "n/a"}
                  </TableCell>

                  <TableCell className="capitalize">
                    {item.po_created_date
                      ? new Date(item.po_created_date)
                          .toLocaleDateString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                          })
                          .replace(/\//g, "-")
                      : "n/a"}
                  </TableCell>

                  <TableCell className="capitalize">
                    {item.po_approved_date
                      ? new Date(item.po_approved_date)
                          .toLocaleDateString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                          })
                          .replace(/\//g, "-")
                      : "n/a"}
                  </TableCell>

                  {/* PO Approval Days */}
                  <TableCell className="capitalize">
                    {(() => {
                      const poCreatedDate = item.po_created_date
                        ? new Date(item.po_created_date)
                        : null;
                      const poApprovedDate = item.po_approved_date
                        ? new Date(item.po_approved_date)
                        : null;

                      if (!poCreatedDate) return "N/A";
                      if (!poApprovedDate) return "Pending approval";

                      const diffDays = Math.floor(
                        (poApprovedDate.getTime() - poCreatedDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                      );

                      if (diffDays < 0) return "Invalid date sequence";
                      if (diffDays === 0) return "Within the day";
                      return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
                    })()}
                  </TableCell>

                  {/* Days on hold for PO */}
                  <TableCell>
                    {(() => {
                      const hodDate = item.hod_signed_at
                        ? new Date(item.hod_signed_at)
                        : null;
                      const trDate = item.tr_signed_at
                        ? new Date(item.tr_signed_at)
                        : null;
                      const poCreatedDate = item.po_created_date
                        ? new Date(item.po_created_date)
                        : null;

                      let latestApprovalDate: Date | null = null;
                      if (hodDate && trDate)
                        latestApprovalDate =
                          hodDate > trDate ? hodDate : trDate;
                      else if (hodDate) latestApprovalDate = hodDate;
                      else if (trDate) latestApprovalDate = trDate;

                      if (!latestApprovalDate || !poCreatedDate) return "N/A";

                      const diffDays = Math.floor(
                        (poCreatedDate.getTime() -
                          latestApprovalDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                      );

                      if (diffDays < 0) return "Invalid date sequence";
                      return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
                    })()}
                  </TableCell>

                  <TableCell className="capitalize">
                    {item.purchaser_id?.name ?? "n/a"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {/* Pagination footer */}
        <div className="flex items-center justify-between w-full border-t p-4">
          {/* Left side: Showing X of Y */}
          <div className="text-sm text-muted-foreground">
            Showing {data?.items?.length ?? 0} of {data?.totalItems ?? 0}
          </div>

          {/* Right side: Pagination and page size */}
          <div className="flex items-center gap-6">
            <Pagination>
              <PaginationContent>
                {/* Previous Button */}
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => page > 1 && setPage(page - 1)}
                    className={
                      page === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {/* Dynamic Pagination with Ellipsis */}
                {(() => {
                  const total = data?.totalPages ?? 0;
                  const visiblePages: (number | string)[] = [];

                  if (total <= 7) {
                    // If few pages, show all
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
                    onClick={() =>
                      data && page < data.totalPages && setPage(page + 1)
                    }
                    className={
                      data && page === data.totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            {/* Page size selector */}
            <div className="flex items-center gap-2 w-[200px]">
              <span className="text-sm text-muted-foreground w-full">
                Rows per page:
              </span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Rows" />
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
      </div>
    </div>
  );
}
