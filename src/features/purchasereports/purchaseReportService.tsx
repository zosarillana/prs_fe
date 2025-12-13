import api from "@/lib/api";
import { PurchaseReport, PurchaseReportInput } from "./types";
import { PaginatedResponse } from "@/types/paginator";

// Service for Purchase Requests
export const purchaseReportService = {
  // Get full paginated reports
  getAll: async (params?: {
    searchTerm?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<PurchaseReport>> => {
    const res = await api.get("api/purchase-reports", { params });
    return res.data;
  },

  // Get table view reports
  getTable: async (params?: {
    searchTerm?: string;
    statusTerm?: string; // ✅ NEW
    prStatusTerm?: string;
    completedTr?: boolean;
    ownDepartment?: boolean;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<any>> => {
    const res = await api.get("api/purchase-reports-table", { params });
    return res.data;
  },

  // Get single report
  getById: async (id: number): Promise<PurchaseReport> => {
    const res = await api.get(`api/purchase-reports/${id}`);
    return res.data;
  },

  // ✅ NEW: Get table reports without role filters
  getTableReports: async (params?: {
    searchTerm?: string;
    statusTerm?: string;
    prStatusTerm?: string;
    completedTr?: boolean;
    ownDepartment?: boolean;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<any>> => {
    const res = await api.get("api/purchase-reports/table-reports", { params });
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

  // Delete reports
  delete: async (id: number): Promise<void> => {
    await api.delete(`api/purchase-reports/${id}`);
  },

  // Approve or reject a specific item
  updateItemStatus: async (
    id: number,
    index: number,
    status: "approved" | "rejected" | "pending" | "pending_tr",
    remark?: string,
    asRole?: "technical_reviewer" | "hod" | "both",
    loggedUserId?: number // 👈 add this
  ): Promise<PurchaseReport> => {
    const res = await api.patch(`api/purchase-reports/${id}/approve-item`, {
      index,
      status,
      remark,
      ...(asRole ? { as_role: asRole } : {}),
      ...(loggedUserId ? { logged_user_id: loggedUserId } : {}),
    });
    return res.data;
  },

  updateItemStatusOnly: async (
    id: number,
    index: number,
    status: string
  ): Promise<PurchaseReport> => {
    const res = await api.patch(
      `api/purchase-reports/${id}/update-item-status-only`,
      {
        index,
        status,
      }
    );
    return res.data;
  },

  async updatePoNo(id: number, po_no: string) {
    const res = await api.patch(`api/purchase-reports/${id}/po-no`, { po_no });
    return res.data;
  },

  async cancelPoNo(id: number) {
    const res = await api.patch(`api/purchase-reports/${id}/cancel-po-no`);
    return res.data;
  },

  async returnPo(id: number) {
    const res = await api.patch(`api/purchase-reports/${id}/return-po-no`);
    return res.data;
  },

  // ✅ NEW: Approve PO (set Approved + date)
  async poApproveDate(id: number, payload: { date: string; status: string }) {
    const res = await api.post(
      `api/purchase-reports/${id}/po-approve-date`,
      payload
    );
    return res.data;
  },

  // Get summary counts (role-based)
  getSummary: async (): Promise<any> => {
    const res = await api.get("api/purchase-reports/summary");
    return res.data;
  },

  // ✅ NEW: Update delivery status of a purchase report
  updateDeliveryStatus: async (
    id: number,
    deliveryStatus: "pending" | "delivered" | "partial"
  ): Promise<PurchaseReport> => {
    const res = await api.patch(`api/purchase-reports/${id}/delivery-status`, {
      delivery_status: deliveryStatus,
    });
    return res.data;
  },

  // ✅ NEW: Get NEXT generated series number (preview)
  getNextSeriesNo: async (): Promise<number> => {
    const res = await api.get("api/purchase-reports/next-series");
    return res.data.next_series_no;
  },
};
