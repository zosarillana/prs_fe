import { usePurchaseReports } from "../../hooks/usePurchaseReports";
import { usePurchaseReportUrlSync } from "./hooks/userPurchaseReportUrlSync";
import { getPurchaseReportHeading } from "./utils/getPurchaseReportHeading";
import { STATUS_MAP } from "./constants/purchaseReports";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/ui/skeletons/purchasereports/tableSkeleton";
import { Search, Plus } from "lucide-react";

import { Link } from "react-router-dom";
import { DrApproveDialog } from "../../components/drApproveDialog";
import { EditPurchaseReportDialog } from "../../components/editPurchaseReportDialog";
import { ViewPurchaseReportDialog } from "../../components/purchasereports/viewPurchaseReportDialog";
import { SetPoDialog } from "../../components/setPoDialog";
import { PurchasingUserDropdown } from "../../filters/purchasingFilterDropdown";
import { StatusFilterDropdown } from "../../filters/statusFilterDropdown";
import { TagFilterDropdown } from "../../filters/tagFilterDropdown";
import { TablePagination } from "./pagination/tablePagination";
import { PurchaseReportTable } from "./tables/purchaseReportTable";
import { Button } from "@/components/ui/button";
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
    editOpen,
    setEditOpen,
    editId,
    handleDelete,
    refetch,
    handleSetPo,
    poDialogOpen,
    setPoDialogOpen,
    poTargetId,
    approvePoMutation,
    setApproveDialogOpen,
    setApproveTargetId,
    approveDialogOpen,
    approveTargetId,
    statusTerm,
    prStatusTerm,
    setPrStatusTerm,
    setStatusTerm,
    setCompletedTr,
    ownDepartment,
    setOwnDepartment,
    cancelPoMutation,
    returnPoMutation,
    handleCopyToNew,
    handleViewDraft,
    tagDescription,
    setTagDescription,
    purchaserName,
    setPurchaserName,
  } = usePurchaseReports();

  const { ownCreated, completedTr, forCeoApproval, forPoApproval, approvedPo } =
    usePurchaseReportUrlSync({
      statusTerm,
      prStatusTerm,
      setStatusTerm,
      setPrStatusTerm,
      setCompletedTr,
      setOwnDepartment,
    });

  const heading = getPurchaseReportHeading({
    prStatusTerm,
    statusTerm,
    completedTr,
    ownDepartment,
    forCeoApproval,
    forPoApproval,
    approvedPo,
    user,
  });

  if (loading) {
    return (
      <div className="p-6 -mt-4">
        <h1 className="text-3xl font-bold mb-6">{heading}</h1>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="p-6 -mt-4">
      {/* header */}
      <div className="flex flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-6">{heading}</h1>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-2 items-center">
            {/* ✅ Status Filter Dropdown */}
            <StatusFilterDropdown
              statusTerm={statusTerm}
              prStatusTerm={prStatusTerm}
              setStatusTerm={setStatusTerm}
              setPrStatusTerm={setPrStatusTerm}
              setPage={setPage}
              user={user}
            />

            <TagFilterDropdown
              tagDescription={tagDescription}
              setTagDescription={setTagDescription}
              setPage={setPage}
            />

            <PurchasingUserDropdown
              purchaserName={purchaserName}
              setPurchaserName={setPurchaserName}
              setPage={setPage}
            />

            {/* Search Box */}
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

            {/* Create Button */}
            {!(
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
            )}
          </div>
        </div>
      </div>

      {/* table */}
      <div className="overflow-hidden rounded-lg border text-card-foreground shadow">
        <PurchaseReportTable
          data={data}
          fetching={fetching}
          user={user}
          ownCreated={ownCreated}
          completedTr={completedTr}
          forCeoApproval={forCeoApproval}
          approvedPo={approvedPo}
          statusMap={STATUS_MAP}
          handleView={handleView}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleSetPo={handleSetPo}
          handleCopyToNew={handleCopyToNew}
          handleViewDraft={handleViewDraft}
          cancelPoMutation={cancelPoMutation}
          returnPoMutation={returnPoMutation}
          setApproveDialogOpen={setApproveDialogOpen}
          setApproveTargetId={setApproveTargetId}
        />
        {/* pagination footer */}
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

      {/* dialogs */}
      <ViewPurchaseReportDialog
        open={open}
        onOpenChange={setOpen}
        prId={viewId}
        onSuccess={refetch}
      />
      <EditPurchaseReportDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        prId={editId}
      />
      <SetPoDialog
        open={poDialogOpen}
        onOpenChange={setPoDialogOpen}
        reportId={poTargetId}
        onSuccess={refetch}
      />
      <DrApproveDialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        onConfirm={({ date, status }) => {
          if (approveTargetId !== null) {
            approvePoMutation.mutate({ id: approveTargetId, date, status });
          }
        }}
      />
    </div>
  );
}
