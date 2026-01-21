import { TableSkeleton } from "@/components/ui/skeletons/purchasereports/tableSkeleton";
import { ProgressCalendarDialog } from "../../components/calendar/progressCalendarDialog";
import { TablePagination } from "../../filters/pagination/tablePagination";
import { ProgressReportHeader } from "./headers/progressReportHeader";
import { ProgressReportTable } from "./table/progressReportTable";
import { useProgressReport } from "../../hooks/useProgressReport";

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
    addProgress,
    deleteProgress,
    updateProgress,
    user,
  } = useProgressReport();

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Progress Status</h1>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  const selectedReport = data?.items.find(
    (item) => item.id === selectedReportId,
  );

  return (
    <div className="p-6">
      {/* ✅ HEADER */}
      <ProgressReportHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setPage={setPage}
      />

      <div className="overflow-hidden rounded-lg border shadow">
        {/* ✅ TABLE */}
        <ProgressReportTable
          data={data}
          fetching={fetching}
          onOpenCalendar={handleOpenCalendar}
        />

        {/* ✅ PAGINATION */}
        <div className="flex items-center justify-between w-full border-t p-4">
          {/* Left side: Showing X of Y */}
          <div className="text-sm text-muted-foreground">
            Showing {data?.items?.length ?? 0} of {data?.totalItems ?? 0}
          </div>

          {/* Right side: Pagination and page size */}
          <div className="flex items-center gap-6">
            <TablePagination
              page={page}
              totalPages={data?.totalPages ?? 0}
              pageSize={pageSize}
              setPage={setPage}
              setPageSize={setPageSize}
            />
          </div>
        </div>
      </div>

      {/* ✅ DIALOG (only place this should be used) */}
      <ProgressCalendarDialog
        open={calendarOpen}
        onOpenChange={handleCloseCalendar}
        reportId={selectedReportId}
        seriesNo={selectedReport?.series_no}
        progresses={progresses}
        onAddProgress={addProgress}
        onUpdateProgress={updateProgress}
        onDeleteProgress={deleteProgress}
        userRole={
          user?.role ? (Array.isArray(user.role) ? user.role : [user.role]) : []
        }
      />
    </div>
  );
}
