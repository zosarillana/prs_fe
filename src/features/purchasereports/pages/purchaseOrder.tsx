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
import {
  HashIcon,
  ListOrdered,
  Loader,
  Plus,
  Receipt,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import { TableSkeleton } from "@/components/ui/skeletons/purchasereports/tableSkeleton";
import { usePurchaseReports } from "../hooks/usePurchaseReports";

export default function PUrchaseOrder() {
  const {
    user,
    data,
    loading,
    fetching,
    page,
    setPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
  } = usePurchaseReports();

  // First load skeleton
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
      {/* header */}
      <div className="flex flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-6">Purchase Orders</h1>
        <div className="flex flex-row gap-2">
          {/* {!(
            user?.role?.includes("hod") ||
            user?.role?.includes("technical_reviewer") ||
            user?.role?.includes("purchasing")
          ) && (
            <Button asChild>
              <Link to="/purchase-reports/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Purchase Request
              </Link>
            </Button>
          )} */}
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

      {/* table */}
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
              <TableHead className="border-b">ToT (Days)</TableHead>
              <TableHead className="border-b">Purchasing Associate</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="cursor-pointer">
            {/* Inline loader while fetching */}
            {fetching && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
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
              data?.items
                ?.filter(
                  (item) =>
                    item.po_status === "approved" ||
                    item.po_status === "Cancelled" ||
                    item.po_status === "For_approval"
                )
                .map((item) => (
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
              item.po_status === "Cancelled"
                ? "bg-red-100 hover:bg-red-200"
                : ""
            }
            [&>td]:!bg-transparent
          `}
                  >
                    <TableCell className="font-medium capitalize">
                      <div className="flex flex-row gap-2">
                        <HashIcon className="h-4 w-5 my-1"></HashIcon>{" "}
                        <p className="my-1">{item.series_no}</p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {item.pr_created ?? "n/a"}
                    </TableCell>
                    <TableCell className="font-medium capitalize">
                      <div className="flex flex-row gap-2">
                        <HashIcon className="h-4 w-5 my-1"></HashIcon>{" "}
                        <p className="my-1">{item.po_no ?? "n/a"} </p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                       {item.po_status === "For_approval"
                        ? "For CEO Approval"
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
                    <TableCell className="capitalize">
                      {item.po_created_date && item.po_approved_date
                        ? `${new Date(item.po_created_date)
                            .toLocaleDateString("en-US", {
                              month: "2-digit",
                              day: "2-digit",
                              year: "numeric",
                            })
                            .replace(/\//g, "-")} - ${new Date(
                            item.po_approved_date
                          )
                            .toLocaleDateString("en-US", {
                              month: "2-digit",
                              day: "2-digit",
                              year: "numeric",
                            })
                            .replace(/\//g, "-")}`
                        : "n/a"}
                    </TableCell>

                    <TableCell className="capitalize">
                      {item.purchaser_id?.name ?? "n/a"}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {/* pagination footer */}
        <div className="flex items-center justify-end w-full border-t p-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && setPage(page - 1)}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from({ length: data?.totalPages ?? 0 }, (_, i) => (
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

          {/* page size selector */}
          <div className="flex items-center gap-2 w-[200px]">
            <span className="text-sm text-muted-foreground w-full">
              Rows per page:
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => setPageSize(Number(value))}
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
  );
}
