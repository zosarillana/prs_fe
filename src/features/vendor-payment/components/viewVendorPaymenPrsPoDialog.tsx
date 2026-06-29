"use client";

import logo from "@/assets/images/logosidebar.png";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { TableSkeletonPrInput } from "@/components/ui/skeletons/purchasereports/tableSkeletonPrInput";
import { SetMultiplePoSignatureSection } from "@/features/purchasereports/components/multiplePo/components/setMultiplePurchaseReportSignature";
import { SetMultiplePurchaseReportTable } from "../table/vendorPaymentViewsPrsPoTable";
import { useSetMultiplePurchaseReportDialog } from "@/features/purchasereports/components/multiplePo/hooks/useSetMultiplePurchaseReportDialog";

interface ViewVendorPaymentPrsPoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prId: number | null;
}

export function ViewVendorPaymentPrsPoDialog({
  open,
  onOpenChange,
  prId,
}: ViewVendorPaymentPrsPoDialogProps) {
  const { report, loading, printRef, API_BASE_URL } =
    useSetMultiplePurchaseReportDialog(prId, open);

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
                        <strong>Department:</strong> {report.user?.department || ""}
                      </p>
                      <p>
                        <strong>Date Needed:</strong> {report.date_needed}
                      </p>
                    </div>
                  </div>

                  {/* Items Table */}
                  <SetMultiplePurchaseReportTable report={report} />

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

          <DialogFooter className="mt-4">
            <div className="flex flex-row gap-4">
              <button
                className="border px-4 py-2 rounded"
                onClick={() => onOpenChange(false)}
              >
                Close
              </button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
