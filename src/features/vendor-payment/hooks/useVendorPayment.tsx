import { useEffect, useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { vendorPaymentService } from "../vendorPaymentService";
import { VendorPayment } from "../types/vendorPaymentTypes";
import { PaginatedResponse } from "@/types/paginator";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { AxiosError } from "axios";

export function useVendorPayments() {
  const [payments, setPayments] = useState<VendorPayment[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const response: PaginatedResponse<any> =
        await vendorPaymentService.getAll({
          pageNumber: page,
          pageSize,
          searchTerm: debouncedSearchTerm,
        });

      const mappedPayments: VendorPayment[] = response.items.map((item) => ({
        srl_no: item.purchase_report?.series_no,
        po_no: item.po_number,
        inv_no: item.inv_number,
        id: item.id,
        prs_id: item.prs_id,
        vendor_name: item.vendor?.vendor_name,
        created_at: item.created_at,
        cheque_number: item.cheque_number,
        amount: item.amount,
        date_served: item.date_served,
        status: item.cheque_status,
      }));

      setPayments(mappedPayments);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Failed to fetch payments", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearchTerm]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const refresh = () => fetchPayments();

  const getVisiblePages = (): (number | string)[] => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  };

  // ✅ Only delete uses useMutation
  const { mutate: deleteMutate } = useMutation({
    mutationFn: async (id: number) => {
      await vendorPaymentService.delete(id);
    },
    onSuccess: () => {
      toast.success("Vendor payment deleted successfully");
      fetchPayments();
    },
    onError: (error: unknown) => {
      // ✅ Type guard for AxiosError
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message || "Failed to delete vendor payment",
        );
      } else {
        toast.error("Failed to delete vendor payment");
      }
    },
  });

  const deletePayment = (id: number) => {
    toast.warning("Delete this vendor payment?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => deleteMutate(id),
      },
    });
  };

  return {
    payments,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    getVisiblePages,
    loading,
    refresh,
    deletePayment,
    searchTerm,
    setSearchTerm,
  };
}
