"use client";

import logo from "@/assets/images/logosidebar.png";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TableSkeletonPrInput } from "@/components/ui/skeletons/purchasereports/tableSkeletonPrInput";
import { File } from "lucide-react";
import { RemarkPrDialog } from "../workflow/remarkPrDialog";
import { SetMultiplePurchaseReportTable } from "./table/setMultiplePurchaseReportTable";
import { useSetMultiplePurchaseReportDialog } from "./hooks/useSetMultiplePurchaseReportDialog";
import { SetMultiplePoSignatureSection } from "./components/setMultiplePurchaseReportSignature";
import { DrApproveDialog } from "../workflow/drApproveDialog";

interface SetMultiplePurchaseReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prId: number | null;
  onSuccess?: () => void;
}

export function SetMultiplePurchaseReportDialogProps({
  open,
  onOpenChange,
  prId,
  onSuccess,
}: SetMultiplePurchaseReportDialogProps) {
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
    canSelectItemMultiple,
    bulkAction,
    isExporting,
    isAdmin,
    isHod,
    isTechnicalReviewer,
    hasBothRoles,
    truncate,
    setReport,
    approveDialogOpen,
    setApproveDialogOpen,
    approveTargetId,
    approveItemPoMutation,
    downloadPaginatedPDF,
    openApproveDialog,
    setApproveTargetId,
    approveItemPoById,
    approveBulkItemPoByIndices, // ✅ Add this
    bulkApproveIndices, // ✅ Add this
    openBulkApproveDialog, // ✅ Add this
  } = useSetMultiplePurchaseReportDialog(prId, open);

  // ✅ Single item approve handler
  const handleApprovePoClick = (itemIndex: number) => {
    if (!report?.item_pos) return;

    const itemPo = report.item_pos.find((po) => po.item_index === itemIndex);

    if (itemPo?.id) {
      openApproveDialog(itemPo.id);
    }
  };

  // ✅ Bulk approve handler - use the new helper
  const handleBulkApprovePoClick = (itemIndices: number[]) => {
    openBulkApproveDialog(itemIndices);
  };

  const openDocumentApproveDialog = () => {
    setApproveTargetId(null); // null means document-level
    setApproveDialogOpen(true);
  };
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
              PURCHASE REQUISITION SLIP (SET MULTIPLE PO)
            </p>

            {loading ? (
              <TableSkeletonPrInput rows={3} />
            ) : report ? (
              <>
                <div className="space-y-4 text-sm">
                  {/* Header Info */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-row justify-between w-full">
                      <div className="mt-6">
                        <p>
                          <strong>Purpose:</strong> {report.pr_purpose}
                        </p>
                      </div>

                      <div className="-mt-24">
                        <div className="flex flex-col items-start gap-4 mt-12">
                          <p className="mr-[43px]">
                            <strong>Series No:</strong> {report.series_no}
                          </p>
                          <p className="mr-[43px]">
                            <strong>SAP PR:</strong> {report.sap_id || "—"}
                          </p>
                          <p className="mr-[43px]">
                            <strong>Date:</strong> {report.date_submitted}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row justify-between w-full">
                      <p>
                        <strong>Department:</strong>{" "}
                        {report.user?.department || ""}
                      </p>
                      <p>
                        <strong>Date Needed:</strong> {report.date_needed}
                      </p>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="overflow-hidden rounded-lg border text-card-foreground shadow">
                    <SetMultiplePurchaseReportTable
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
                      canSelectItem={canSelectItemMultiple}
                      isAdmin={isAdmin}
                      isHod={isHod}
                      isTechnicalReviewer={isTechnicalReviewer}
                      hasBothRoles={hasBothRoles}
                      onReportUpdate={(updatedReport) =>
                        setReport(updatedReport)
                      }
                      onApprovePoClick={handleApprovePoClick} // ✅ Pass the handler
                      onBulkApprovePoClick={handleBulkApprovePoClick} // ✅ Pass the handler
                    />
                  </div>

                  {/* Signature Sections */}
                  <div id="signature-section" className="grid grid-cols-1 h-48">
                    <div className="flex flex-row justify-between w-full gap-8">
                      <SetMultiplePoSignatureSection
                        title="Created By"
                        user={report.user}
                        date={report.created_at}
                        API_BASE_URL={API_BASE_URL}
                      />
                      <SetMultiplePoSignatureSection
                        title="Approved By"
                        user={report.hod_user_id}
                        date={report.hod_signed_at}
                        API_BASE_URL={API_BASE_URL}
                      />
                      <SetMultiplePoSignatureSection
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
              {!(
                user?.role?.includes("hod") ||
                user?.role?.includes("technical_reviewer") ||
                user?.role?.includes("user")
              ) && (
                <Button
                  onClick={() => downloadPaginatedPDF(printRef)}
                  disabled={isExporting}
                >
                  <div className="flex items-center gap-2">
                    {isExporting ? (
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 018 8h-4l3.5 3.5L24 12h-4a8 8 0 01-8 8v-4l-3.5 3.5L12 24v-4a8 8 0 01-8-8z"
                        ></path>
                      </svg>
                    ) : (
                      <File />
                    )}
                    <p>{isExporting ? "Generating..." : "Generate PDF"}</p>
                  </div>
                </Button>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
      <DrApproveDialog
        open={approveDialogOpen}
        onClose={() => {
          setApproveDialogOpen(false);
          setApproveTargetId(null);
        }}
        onConfirm={({ date, status }) => {
          // ✅ Check if we're in bulk mode first
          if (bulkApproveIndices.length > 0) {
            // Bulk approval: approve all selected indices with the same date
            approveBulkItemPoByIndices(bulkApproveIndices, date, status);
          } else if (approveTargetId !== null) {
            // Single item approval: approve one item by its database ID
            approveItemPoById(approveTargetId, date, status);
          }
        }}
      />
    </Dialog>
  );
}
