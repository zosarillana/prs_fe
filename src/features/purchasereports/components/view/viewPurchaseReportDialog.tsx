"use client";

import logo from "@/assets/images/logosidebar.png";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TableSkeletonPrInput } from "@/components/ui/skeletons/purchasereports/tableSkeletonPrInput";
import { File } from "lucide-react";
import { RemarkPrDialog } from "../remarkPrDialog";
import { PurchaseReportItemsTable } from "./table/viewPurchaseReportDialogTable";
import { useViewPurchaseReportDialog } from "./hooks/useViewPurchaseReportDialog";
import { SignatureSection } from "./components/SignatureSection";

interface ViewPurchaseReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prId: number | null;
  onSuccess?: () => void;
}

export function ViewPurchaseReportDialog({
  open,
  onOpenChange,
  prId,
  onSuccess,
}: ViewPurchaseReportDialogProps) {
  const {
    user,
    API_BASE_URL,
    printRef,
    report,
    loading,
    openModal,
    setOpenModal,
    actionType,
    handleItemAction,
    handleHodTrAction,
    confirmItemAction,
    selectedItems,
    toggleItem,
    toggleAll,
    isIndeterminate,
    allSelected,
    canSelectItem,
    bulkAction,
    isExporting,
    isAdmin,
    isHod,
    isTechnicalReviewer,
    hasBothRoles,
    truncate,
    downloadPaginatedPDF,
  } = useViewPurchaseReportDialog(prId, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] overflow-auto">
        <div className="max-h-[80vh] overflow-y-auto pr-2">
          <div ref={printRef}>
            {/* Company Header */}
            <div className="flex flex-col items-center mb-5">
              <img src={logo} className="h-32 -mb-10" crossOrigin="anonymous" />
              <p className="text-sm font-light mt-3">
                Upper Quinokol, Brgy. Darong, Sta. Cruz, Davao Del Sur.
              </p>
            </div>

            <p className="mt-3 text-lg text-center font-semibold mb-2">
              PURCHASE REQUISITION SLIP
            </p>

            {loading ? (
              <TableSkeletonPrInput rows={3} />
            ) : report ? (
              <>
                <div className="space-y-4 text-sm">
                  {/* Header Info */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-row justify-between w-full">
                      <p>
                        <strong>Purpose:</strong> {report.pr_purpose}
                      </p>
                      <div className="flex flex-col gap-4 -mt-9">
                        <p>
                          <strong className="ml-6">Series No:</strong> {report.series_no}
                        </p>
                        <p>
                          <strong className="ml-12">Date:</strong> {report.date_submitted}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row justify-between w-full">
                      <p>
                        <strong>Department:</strong> {report.user?.department || ""}
                      </p>
                      <p>
                        <strong>Date Needed:</strong> {report.date_needed}
                      </p>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="overflow-hidden rounded-lg border text-card-foreground shadow">
                    <PurchaseReportItemsTable
                      report={report}
                      user={user}
                      isExporting={isExporting}
                      selectedItems={selectedItems}
                      allSelected={allSelected}
                      isIndeterminate={isIndeterminate}
                      onToggleItem={toggleItem}
                      onToggleAll={toggleAll}
                      onBulkAction={bulkAction}
                      onItemAction={handleItemAction}
                      onHodTrAction={handleHodTrAction}
                      canSelectItem={canSelectItem}
                      isAdmin={isAdmin}
                      isHod={isHod}
                      isTechnicalReviewer={isTechnicalReviewer}
                      hasBothRoles={hasBothRoles}
                    />
                  </div>

                  {/* Signature Sections */}
                  <div id="signature-section" className="grid grid-cols-1 h-48">
                    <div className="flex flex-row justify-between w-full gap-8">
                      <SignatureSection
                        title="Created By"
                        user={report.user}
                        date={report.created_at}
                        API_BASE_URL={API_BASE_URL}
                      />
                      <SignatureSection
                        title="Approved By"
                        user={report.hod_user_id}
                        date={report.hod_signed_at}
                        API_BASE_URL={API_BASE_URL}
                      />
                      <SignatureSection
                        title="Reviewed By"
                        user={report.tr_user_id}
                        date={report.tr_signed_at}
                        API_BASE_URL={API_BASE_URL}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p>No data found.</p>
            )}
          </div>

          {/* Dialog Footer */}
          <DialogFooter className="mt-4">
            <div className="flex flex-row gap-4">
              {!(user?.role?.includes("hod") || user?.role?.includes("technical_reviewer") || user?.role?.includes("user")) && (
                <Button
                  onClick={() => downloadPaginatedPDF(printRef)}
                  disabled={isExporting}
                >
                  <div className="flex items-center gap-2">
                    {isExporting ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 018 8h-4l3.5 3.5L24 12h-4a8 8 0 01-8 8v-4l-3.5 3.5L12 24v-4a8 8 0 01-8-8z"></path>
                      </svg>
                    ) : (
                      <File />
                    )}
                    <p>{isExporting ? "Generating..." : "Generate PDF"}</p>
                  </div>
                </Button>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>

      {/* Remark Dialog */}
      <RemarkPrDialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        action={actionType}
        onConfirm={async (remark) => {
          if (!report) return;

          const pendingCount = report.item_status?.filter(
            (s: string) => s === "pending" || s === "pending_tr"
          ).length ?? 0;

          const asRole: "technical_reviewer" | "hod" | "both" | undefined =
            pendingCount === 1
              ? user?.role?.includes("hod")
                ? "hod"
                : user?.role?.includes("technical_reviewer")
                  ? "technical_reviewer"
                  : user?.role?.includes("admin")
                    ? "both"
                    : undefined
              : undefined;

          await confirmItemAction(remark, asRole);

          if (onSuccess) onSuccess();
        }}
      />
    </Dialog>
  );
}
