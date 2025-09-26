import { useEffect, useState } from "react";
import { PurchaseReport } from "../types";
import { purchaseReportService } from "../purchaseReportService";

export function useEditPurchaseReport(prId: number | null, open: boolean) {
  const [report, setReport] = useState<PurchaseReport | null>(null);
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    if (open && prId) {
      setLoading(true);
      purchaseReportService
        .getById(prId)
        .then(setReport)
        .catch(() => setReport(null))
        .finally(() => setLoading(false));
    } else {
      setReport(null);
    }
  }, [prId, open]);

  return { report, loading };
}
