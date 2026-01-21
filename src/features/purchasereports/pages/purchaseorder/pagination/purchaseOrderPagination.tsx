
import React from "react";
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

interface PurchaseOrderPaginationProps {
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages?: number;
  totalItems?: number;
  currentCount?: number;
}

export const PurchaseOrderPagination: React.FC<
  PurchaseOrderPaginationProps
> = ({
  page,
  setPage,
  pageSize,
  setPageSize,
  totalPages = 0,
  totalItems = 0,
  currentCount = 0,
}) => {
  const visiblePages: (number | string)[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) visiblePages.push(i);
  } else {
    const startRange = Math.max(2, page - 1);
    const endRange = Math.min(totalPages - 1, page + 1);

    visiblePages.push(1);

    if (startRange > 2) visiblePages.push("...");

    for (let i = startRange; i <= endRange; i++) visiblePages.push(i);

    if (endRange < totalPages - 1) visiblePages.push("...");

    visiblePages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between">
      {/* Left */}
      <div className="text-sm text-muted-foreground">
        Showing {currentCount} of {totalItems}
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">
        <Pagination>
          <PaginationContent>
            {/* Previous */}
            <PaginationItem>
              <PaginationPrevious
                onClick={() => page > 1 && setPage(page - 1)}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {/* Pages */}
            {visiblePages.map((p, i) =>
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
              ),
            )}

            {/* Next */}
            <PaginationItem>
              <PaginationNext
                onClick={() => page < totalPages && setPage(page + 1)}
                className={
                  page === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        {/* Page Size */}
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
  );
};
