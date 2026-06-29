import { useEffect, useState } from "react";
import { PurchaseReport, PurchaseReportCleanItem } from "@/features/purchasereports/types";
import { purchaseReportService } from "@/features/purchasereports/purchaseReportService";
import { toast } from "sonner";

// ✅ Hook for regular endpoint
export function useGetPurchaseReport(prId: number | null, open: boolean) {
  const [report, setReport] = useState<PurchaseReport | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!prId) return;
    setLoading(true);
    try {
      const data = await purchaseReportService.getById(prId);
      setReport(data);
    } catch (error) {
      console.error("Failed to fetch report:", error);
      toast.error("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && prId) fetchReport();
    else setReport(null);
  }, [open, prId]);

  return { report, setReport, loading, fetchReport };
}

// ✅ Hook for clean endpoint
export function useGetCleanPurchaseReport(prId: number | null, open: boolean) {
  const [report, setReport] = useState<PurchaseReportCleanItem | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!prId) return;
    setLoading(true);
    try {
      const data = await purchaseReportService.getCleanById(prId);
      setReport(data);
    } catch (error) {
      console.error("Failed to fetch clean report:", error);
      toast.error("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && prId) fetchReport();
    else setReport(null);
  }, [open, prId]);

  return { report, setReport, loading, fetchReport };
}