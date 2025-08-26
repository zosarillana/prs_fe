import api from "@/lib/api";
import { PurchaseReport, PurchaseReportInput } from "./types";
import { PaginatedResponse } from "@/types/paginator";

// Service for purchase reports
export const purchaseReportService = {
  // Get full paginated reports
  getAll: async (
    params?: {
      searchTerm?: string;
      fromDate?: string;
      toDate?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      pageNumber?: number;
      pageSize?: number;
    }
  ): Promise<PaginatedResponse<PurchaseReport>> => {
    const res = await api.get("api/purchase-reports", { params });
    return res.data;
  },

  // Get table view reports
  getTable: async (
    params?: {
      searchTerm?: string;
      fromDate?: string;
      toDate?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      pageNumber?: number;
      pageSize?: number;
    }
  ): Promise<PaginatedResponse<any>> => {
    const res = await api.get("api/purchase-reports-table", { params });
    return res.data;
  },

  // Get single report
  getById: async (id: number): Promise<PurchaseReport> => {
    const res = await api.get(`api/purchase-reports/${id}`);
    return res.data;
  },

  // Create new report
  create: async (data: PurchaseReportInput): Promise<PurchaseReport> => {
    const res = await api.post("api/purchase-reports", data);
    return res.data;
  },

  // Update existing report
  update: async (
    id: number,
    data: PurchaseReportInput
  ): Promise<PurchaseReport> => {
    const res = await api.put(`api/purchase-reports/${id}`, data);
    return res.data;
  },

  // Delete report
  delete: async (id: number): Promise<void> => {
    await api.delete(`api/purchase-reports/${id}`);
  },
};
