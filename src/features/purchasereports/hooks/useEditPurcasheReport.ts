import { useEffect, useState } from "react";
import { PurchaseReport } from "../types";
import { purchaseReportService } from "../purchaseReportService";
import { Uom } from "@/features/uom/types";
import { uomService } from "@/features/uom/uomService";

export function useEditPurchaseReport(prId: number | null, open: boolean) {
  const [report, setReport] = useState<PurchaseReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [uoms, setUoms] = useState<Uom[]>([]);

  useEffect(() => {
    const fetchUoms = async () => {
      try {
        const res = await uomService.getAll({ pageNumber: 1, pageSize: 9999 });
        setUoms(res.items);
      } catch (error) {
        console.error("Failed to fetch UOMs", error);
      }
    };
    fetchUoms();
  }, []);

  
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

  return { report, loading, uoms };
}
