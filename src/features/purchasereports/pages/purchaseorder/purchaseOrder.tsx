import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { TableSkeleton } from "@/components/ui/skeletons/purchasereports/tableSkeleton";
import { useReportGetHook } from "../../hooks/useReportGetHook";
import { useUpdateDeliveryStatus } from "../../hooks/useUpdateDeliveryStatus";
import { ViewPurchaseReportDialog } from "../../components/view/viewPurchaseReportDialog";
import { PurchaseOrderTable } from "./table/purchaseOrderTable";
import { PurchaseOrderPagination } from "./pagination/purchaseOrderPagination";

export default function PurchaseOrder() {
  const { updateDeliveryStatus, updating } = useUpdateDeliveryStatus();
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
    user,
  } = useReportGetHook();

  // State for view dialog
  const [open, setOpen] = React.useState(false);
  const [viewId, setViewId] = React.useState<number | null>(null);

  // Handler to open view dialog
  const handleView = (id: number) => {
    setViewId(id);
    setOpen(true);
  };

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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border text-card-foreground shadow">
        <PurchaseOrderTable
          data={data}
          fetching={fetching}
          user={user}
          handleView={handleView}
          updateDeliveryStatus={updateDeliveryStatus}
        />

        {/* Pagination footer */}
        <div className="flex items-center justify-between w-full border-t p-4">
          {/* Left side: Showing X of Y */}
          <div className="text-sm text-muted-foreground">
            Showing {data?.items?.length ?? 0} of {data?.totalItems ?? 0}
          </div>

          {/* Right side: Pagination and page size */}
          <PurchaseOrderPagination
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={data?.totalPages}
            totalItems={data?.totalItems}
            currentCount={data?.items?.length}
          />
        </div>
      </div>

      {/* View Dialog */}
      <ViewPurchaseReportDialog
        open={open}
        onOpenChange={setOpen}
        prId={viewId}
        onSuccess={() => {
          // Optionally refetch data after dialog actions
        }}
      />
    </div>
  );
}
