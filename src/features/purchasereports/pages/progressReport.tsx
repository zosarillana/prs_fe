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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  CalendarIcon,
  HashIcon,
  Loader,
  MoreVertical,
  Search,
} from "lucide-react";
import { TableSkeleton } from "@/components/ui/skeletons/purchasereports/tableSkeleton";
import { useProgressReport } from "../hooks/useProgressReport";
import { ProgressCalendarDialog } from "../components/progressCalendarDialog";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"; // ✅ Add this import
import { format } from "date-fns"; // ✅ Add this import

export default function ProgressReport() {
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
    selectedReportId,
    calendarOpen,
    handleOpenCalendar,
    handleCloseCalendar,
    progresses,
    progressLoading,
    addProgress,
    deleteProgress,
    updateProgress,
    user,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    handleClearFilters,
    refetch,
  } = useProgressReport();

  if (loading) {
    return (
      <div className="p-6 -mt-4">
        <h1 className="text-3xl font-bold mb-6">Progress Status</h1>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  // Get selected report details for dialog
  const selectedReport = data?.items.find(
    (item) => item.id === selectedReportId
  );

  return (
    <div className="p-6 -mt-4">
      {/* Header */}
      <div className="flex flex-col mb-4">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-3xl font-bold mb-6">Progress Status</h1>

          <div className="flex flex-row gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search requests..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1); // ✅ Add this line to reset to page 1 when searching
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PR Number</TableHead>
              <TableHead>PR Created</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Date Needed</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {fetching && (
              <TableRow>
                <TableCell colSpan={10} className="py-0 px-0">
                  <div className="w-full">
                    <Progress indeterminate className="w-full" />
                  </div>
                </TableCell>
              </TableRow>
            )}

            {data?.items?.map((item) => (
              <TableRow
                key={item.id}
                onClick={() => handleOpenCalendar(item.id)} // ✅ works here
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="flex gap-2 font-semibold">
                  <HashIcon className="h-4 w-5 my-1" />
                  <p className="my-1">{item.series_no}</p>
                </TableCell>
                <TableCell>{item.pr_created}</TableCell>
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
                <TableCell>{item.user.name}</TableCell>
                <TableCell>{item.date_needed}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => e.stopPropagation()} // prevent row click
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        onClick={() => handleOpenCalendar(item.id)}
                      >
                        <Calendar className="mr-2 h-4 w-4" /> Progress Status
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Showing {data?.items?.length ?? 0} of {data?.totalItems ?? 0}
          </div>

          <div className="flex items-center gap-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => page > 1 && setPage(page - 1)}
                    className={
                      page === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {(() => {
                  const total = data?.totalPages ?? 0;
                  const visiblePages: (number | string)[] = [];

                  if (total <= 7) {
                    for (let i = 1; i <= total; i++) visiblePages.push(i);
                  } else {
                    const startRange = Math.max(2, page - 1);
                    const endRange = Math.min(total - 1, page + 1);

                    visiblePages.push(1);
                    if (startRange > 2) visiblePages.push("...");
                    for (let i = startRange; i <= endRange; i++)
                      visiblePages.push(i);
                    if (endRange < total - 1) visiblePages.push("...");
                    visiblePages.push(total);
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

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Rows per page:
              </span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[70px]">
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
      </div>

      {/* Calendar Dialog */}
      <ProgressCalendarDialog
        open={calendarOpen}
        onOpenChange={handleCloseCalendar}
        reportId={selectedReportId}
        seriesNo={selectedReport?.series_no}
        progresses={progresses}
        onAddProgress={addProgress}
        onUpdateProgress={updateProgress} // Add this line
        onDeleteProgress={deleteProgress}
        userRole={
          user?.role ? (Array.isArray(user.role) ? user.role : [user.role]) : []
        }
      />
    </div>
  );
}
