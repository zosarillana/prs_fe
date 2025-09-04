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
  Eye,
  Loader,
  MoreVertical,
  PencilLine,
  Plus,
  Trash,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { TableSkeleton } from "@/components/ui/skeletons/purchasereports/tableSkeleton";
import { ViewPurchaseReportDialog } from "../components/viewPurchaseReportDialog";
import { usePurchaseReports } from "../hooks/usePurchaseReports";

export default function PurchaseReport() {
  const {
    user,
    data,
    loading,
    fetching,
    page,
    setPage,
    pageSize,
    setPageSize,
    open,
    setOpen,
    viewId,
    searchTerm,
    setSearchTerm,
    handleView,
    handleEdit,
    handleDelete,
  } = usePurchaseReports();

  // First load skeleton
  if (loading) {
    return (
      <div className="p-6 -mt-4">
        <h1 className="text-3xl font-bold mb-6">
          {user?.role?.includes("hod")
            ? "Approve PRs"
            : user?.role?.includes("technical_reviewer")
            ? "Review Items"
            : "Purchase Reports"}
        </h1>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="p-6 -mt-4">
      {/* header */}
      <div className="flex flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-6">
          {user?.role?.includes("hod")
            ? "Approve Purchase Reports"
            : user?.role?.includes("technical_reviewer")
            ? "Review Items"
            : "Purchase Reports"}
        </h1>
        <div className="flex flex-row gap-2">
          {!(
            user?.role?.includes("hod") ||
            user?.role?.includes("technical_reviewer")
          ) && (
            <Button asChild>
              <Link to="/purchase-reports/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Purchase Report
              </Link>
            </Button>
          )}
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search reports..."
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
              <TableHead className="w-[140px] border-b">
                Series Number
              </TableHead>
              <TableHead className="border-b">Purpose</TableHead>
              <TableHead className="border-b">Department</TableHead>
              <TableHead className="border-b">Submitted By</TableHead>
              <TableHead className="border-b">Status</TableHead>
              <TableHead className="border-b">Date Needed</TableHead>
              <TableHead className="w-[100px] border-b">Action</TableHead>
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
              data?.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.series_no}
                  </TableCell>
                  <TableCell>{item.pr_purpose}</TableCell>
                  <TableCell>
                    {item.department
                      .split("_")
                      .map((word) =>
                        word.toLowerCase() === "it"
                          ? "IT"
                          : word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </TableCell>
                  <TableCell className="capitalize">{item.user.name}</TableCell>
                  <TableCell className="capitalize">{item.pr_status}</TableCell>
                  <TableCell>{item.date_needed}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-34 animate-in fade-in-0 zoom-in-95"
                      >
                        <DropdownMenuItem onClick={() => handleView(item.id)}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>

                        {/* Hide edit/delete for hod + technical_reviewer */}
                        {!(
                          user?.role?.includes("hod") ||
                          user?.role?.includes("technical_reviewer")
                        ) && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleEdit(item.id)}
                            >
                              <PencilLine className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(item)}
                              className="text-red-600 focus:text-red-600 cursor-pointer"
                            >
                              <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      {/* view dialog */}
      <ViewPurchaseReportDialog
        open={open}
        onOpenChange={setOpen}
        prId={viewId}
      />
    </div>
  );
}
