import { useEffect, useState } from "react";
import { PaginatedResponse } from "@/types/paginator";
import { purchaseReportService } from "../purchaseReportService";
import type { PurchaseReport } from "../types";
import { toast } from "sonner";

export function useCreatePurchaseReport() {
  const [rows, setRows] = useState<number>(0);
  const [reportData, setReportData] = useState<{
    series_no: string;
    purpose: string;
    department: string;
    date_submitted?: Date;
    date_needed?: Date;
    amount: number;
  } | null>(null);
  const [items, setItems] = useState<
    {
      quantity: string;
      unit: string;
      description: string;
      tag: string;
      remarks: string;
    }[]
  >([]);
  const [data, setData] = useState<PaginatedResponse<PurchaseReport> | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Fetch existing purchase reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await purchaseReportService.getTable({
          pageNumber: 1,
          pageSize: 10,
        });
        setData(res);
      } catch (error) {
        console.error("Failed to fetch purchase reports", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Sync items array when rows change
  useEffect(() => {
    setItems(
      Array.from({ length: rows }, () => ({
        quantity: "",
        unit: "",
        description: "",
        tag: "",
        remarks: "",
      }))
    );
  }, [rows]);

  const handleChange = (index: number, field: string, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async () => {
    if (!reportData) return;

    const payload = {
      user_id: 1, // later: use real user id from auth store
      series_no: reportData.series_no,
      pr_purpose: reportData.purpose,
      department: reportData.department,
      date_submitted: reportData.date_submitted?.toISOString().split("T")[0],
      date_needed: reportData.date_needed?.toISOString().split("T")[0],
      quantity: items.map((item) => Number(item.quantity) || 0),
      unit: items.map((item) => item.unit),
      item_description: items.map((item) => item.description),
      tag: items.map((item) => item.tag),
      remarks: items.map((item) => item.remarks),
    };

    toast.promise(
      purchaseReportService.create(payload),
      {
        loading: "Submitting purchase report...",
        success: () => {
          // Reset form on success
          setItems([]);
          setRows(0);
          setReportData(null);
          return "Purchase report submitted successfully!";
        },
        error: "Failed to submit purchase report. Please try again.",
      }
    );
  };

  return {
    rows,
    setRows,
    reportData,
    setReportData,
    items,
    setItems,
    data,
    loading,
    handleChange,
    handleSubmit,
  };
}