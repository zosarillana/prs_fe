import { useEffect, useState } from "react";
import { PaginatedResponse } from "@/types/paginator";
import { purchaseReportService } from "../purchaseReportService";
import type { PurchaseReport } from "../types";
import { toast } from "sonner";
import { Uom } from "@/features/uom/types";
import { uomService } from "@/features/uom/uomService";

export function useCreatePurchaseReport(initialDraft?: {
  editDraft: boolean;
  draftData: PurchaseReport | null;
}) {
  const [rows, setRows] = useState<number>(0);
  const [uoms, setUoms] = useState<Uom[]>([]);
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
  const [openPopovers, setOpenPopovers] = useState<{ [key: number]: boolean }>(
    {}
  );

  const [editDraft, setEditDraft] = useState(initialDraft?.editDraft ?? false);
  const [draftData, setDraftData] = useState(initialDraft?.draftData ?? null);

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
        setUoms(res.items);
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

  const handleSubmit = async (isDraft = false) => {
    if (!reportData) {
      console.error("❌ No report data");
      return;
    }

    console.log("🚀 =========================");
    console.log("🚀 SUBMIT STARTED");
    console.log("🚀 =========================");
    console.log("📋 isDraft:", isDraft);
    console.log("📋 Item count:", items.length);
    console.log("📋 Report data:", reportData);
    console.log("📦 All items:", JSON.stringify(items, null, 2));

    // Check each item individually
    items.forEach((item, index) => {
      console.log(`\n🔍 Item ${index + 1}:`, {
        quantity: item.quantity,
        unit: item.unit,
        description: item.description,
        tag: item.tag,
        remarks: item.remarks,
        hasTag: !!(item.tag && item.tag.trim()),
        hasDescription: !!(item.description && item.description.trim()),
        hasQuantity: !!(item.quantity && Number(item.quantity) > 0),
        hasUnit: !!(item.unit && item.unit.trim()),
      });
    });

    // ✅ Validate tags are filled for ALL submissions (including drafts)
    const itemsWithoutTags = items.filter(
      (item) => !item.tag || item.tag.trim() === ""
    );

    if (itemsWithoutTags.length > 0) {
      console.error("❌ Items without tags:", itemsWithoutTags);
      console.error("❌ Item indices without tags:", 
        items.map((item, i) => (!item.tag || item.tag.trim() === "") ? i : null).filter(i => i !== null)
      );
      toast.error(`All items must have a tag before submitting. Missing tags on ${itemsWithoutTags.length} item(s).`);
      return;
    }

    // ✅ Validate other required fields for ALL submissions (including drafts)
    const itemsWithoutDescription = items.filter(
      (item) => !item.description || item.description.trim() === ""
    );

    if (itemsWithoutDescription.length > 0) {
      console.error("❌ Items without description:", itemsWithoutDescription);
      toast.error(`All items must have a description before submitting. Missing on ${itemsWithoutDescription.length} item(s).`);
      return;
    }

    const itemsWithoutQuantity = items.filter(
      (item) => !item.quantity || Number(item.quantity) <= 0
    );

    if (itemsWithoutQuantity.length > 0) {
      console.error("❌ Items without valid quantity:", itemsWithoutQuantity);
      toast.error(`All items must have a valid quantity before submitting. Invalid on ${itemsWithoutQuantity.length} item(s).`);
      return;
    }

    const itemsWithoutUnit = items.filter(
      (item) => !item.unit || item.unit.trim() === ""
    );

    if (itemsWithoutUnit.length > 0) {
      console.error("❌ Items without unit:", itemsWithoutUnit);
      toast.error(`All items must have a unit before submitting. Missing on ${itemsWithoutUnit.length} item(s).`);
      return;
    }

    const payload = {
      id: draftData?.id ?? undefined,
      user_id: reportData.user_id,
      series_no: reportData.series_no,
      pr_purpose: reportData.purpose,
      department: reportData.department,
      date_submitted: reportData.date_submitted
        ? reportData.date_submitted.toLocaleDateString("en-CA")
        : null,
      date_needed: reportData.date_needed
        ? reportData.date_needed.toLocaleDateString("en-CA")
        : null,
      quantity: items.map((item) => Number(item.quantity) || 0),
      unit: items.map((item) => item.unit),
      item_description: items.map((item) => item.description),
      tag: items.map((item) => item.tag),
      remarks: items.map((item) => item.remarks),
      is_draft: isDraft,
    };

    console.log("📤 =========================");
    console.log("📤 PAYLOAD BEING SENT");
    console.log("📤 =========================");
    console.log("📤 Full payload:", payload);
    console.log("📤 Array counts:", {
      quantity: payload.quantity.length,
      unit: payload.unit.length,
      item_description: payload.item_description.length,
      tag: payload.tag.length,
      remarks: payload.remarks.length,
    });
    console.log("📤 Tags array:", payload.tag);
    console.log("📤 is_draft:", payload.is_draft);

    try {
      toast.loading(
        isDraft ? "Saving as draft..." : "Submitting Purchase Request..."
      );

      let result;
      if (editDraft && draftData?.id) {
        console.log("🔄 Updating existing draft:", draftData.id);
        result = await purchaseReportService.update(draftData.id, payload);
      } else {
        console.log("🆕 Creating new purchase request");
        result = await purchaseReportService.create(payload);
      }

      console.log("✅ =========================");
      console.log("✅ SERVER RESPONSE");
      console.log("✅ =========================");
      console.log("✅ Response:", result);
      console.log("✅ Response item_status:", result.item_status);
      console.log("✅ Response item_status count:", result.item_status?.length);
      console.log("✅ Response tag count:", result.tag?.length);
      console.log("✅ Response pr_status:", result.pr_status);

      toast.dismiss();
      toast.success(
        isDraft
          ? editDraft
            ? "Draft updated successfully!"
            : "Draft saved successfully!"
          : "Purchase Request submitted successfully! 🎉"
      );

      // Reset form
      setItems([]);
      setRows(0);
      setReportData(null);
      setEditDraft(false);
      setDraftData(null);
    } catch (err: any) {
      toast.dismiss();
      const apiError = err?.response?.data;
      if (apiError?.errors) {
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
    openPopovers,
    setOpenPopovers,
    editDraft,
    setEditDraft,
    draftData,
    setDraftData,
  };
}