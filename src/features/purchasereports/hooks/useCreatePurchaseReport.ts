import { useEffect, useState } from "react";
import { PaginatedResponse } from "@/types/paginator";
import { purchaseReportService } from "../purchaseReportService";
import type { PurchaseReport } from "../types";
import { toast } from "sonner";
import { Uom } from "@/features/uom/types";
import { uomService } from "@/features/uom/uomService";

export function useCreatePurchaseReport() {
  const [rows, setRows] = useState<number>(0);
  const [uoms, setUoms] = useState<Uom[]>([]); // ✅ add this
  const [reportData, setReportData] = useState<{
    series_no: string;
    purpose: string;
    user_id: number;
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

  // Fetch existing Purchase Requests
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await purchaseReportService.getTable({
          pageNumber: 1,
          pageSize: 10,
        });
        setData(res);
      } catch (error) {
        console.error("Failed to fetch Purchase Requests", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    const fetchUoms = async () => {
      try {
        const res = await uomService.getAll({ pageNumber: 1, pageSize: 9999 });
        setUoms(res.items); // ✅ only set the array
      } catch (error) {
        console.error("Failed to fetch UOMs", error);
      }
    };
    fetchUoms();
  }, []);

  const handleChange = (index: number, field: string, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async () => {
    if (!reportData) return;

    const payload = {
      user_id: reportData.user_id,
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

    try {
      toast.loading("Submitting Purchase Request...");
      await purchaseReportService.create(payload);

      // ✅ Success
      setItems([]);
      setRows(0);
      setReportData(null);
      toast.dismiss(); // remove the loading toast
      toast.success("Purchase Request submitted successfully!");
    } catch (err: any) {
      toast.dismiss(); // remove the loading toast

      const apiError = err?.response?.data;
      if (apiError?.errors) {
        // Show a separate toast for each field error
        Object.entries(apiError.errors).forEach(([field, messages]) => {
          toast.error(`${field}: ${(messages as string[]).join(", ")}`);
        });
      } else {
        toast.error(apiError?.message || "Failed to submit Purchase Request.");
      }
    }
  };

  return {
    rows,
    setRows,
    reportData,
    setReportData,
    items,
    setItems,
    data,
    uoms,
    loading,
    handleChange,
    handleSubmit,
  };
}
