import api from "@/lib/api";
import {
  PurchaseReport,
  PurchaseReportInput,
  PurchaseReportCleanItem,
  PurchaseReportItemPo,
} from "./types";
import { PaginatedResponse } from "@/types/paginator";

// Service for Purchase Requests
export const purchaseReportService = {
  // Get full paginated reports
  getAll: async (params?: {
    searchTerm?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
    tagDescription?: string;
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
    tagDescription?: string;
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
    data: PurchaseReportInput,
  ): Promise<PurchaseReport> => {
    const res = await api.put(`api/purchase-reports/${id}`, data);
    return res.data;
  },

  // Update existing item row
  approveEdit(
    prId: number,
    index: number,
    itemData: {
      quantity: string | number;
      unit: string;
      item_description: string;
      tag: any;
      remarks: string;
    },
  ) {
    return api.post<PurchaseReport>(
      `/api/purchase-reports/${prId}/items/${index}/approve-edit`,
      itemData, // ✅ Send the item data in request body
    );
  },

  // Delete reports
  delete: async (id: number): Promise<void> => {
    await api.delete(`api/purchase-reports/${id}`);
  },

  // Approve or reject a specific item
  updateItemStatus: async (
    id: number,
    index: number,
    status: "approved" | "rejected" | "pending" | "pending_tr" | "return",
    remark?: string,
    asRole?: "technical_reviewer" | "hod" | "both",
    loggedUserId?: number, // 👈 add this
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
    status: string,
  ): Promise<PurchaseReport> => {
    const res = await api.patch(
      `api/purchase-reports/${id}/update-item-status-only`,
      {
        index,
        status,
      },
    );
    return res.data;
  },

  // async updatePoNo(id: number, po_no: string) {
  //   const res = await api.patch(`api/purchase-reports/${id}/po-no`, { po_no });
  //   return res.data;
  // },

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
      payload,
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
    deliveryStatus: "pending" | "delivered" | "partial",
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

  // ✅ Remove a single item row
  removeRow: async (id: number, rowIndex: number): Promise<PurchaseReport> => {
    const res = await api.delete(`api/purchase-reports/${id}/row`, {
      params: { row_index: rowIndex },
    });

    return res.data;
  },

  addItem: async (id: number): Promise<PurchaseReport> => {
    const res = await api.post(`api/purchase-reports/${id}/row`);
    return res.data;
  },

  // ✅ Bulk remove item rows
  removeRows: async (
    id: number,
    rowIndices: number[],
  ): Promise<PurchaseReport> => {
    const res = await api.delete(`api/purchase-report/${id}/items`, {
      data: { row_indices: rowIndices }, // DELETE with request body
    });
    return res.data;
  },

  // ✅ Bulk approve/edit items
  approveEdits: async (
    id: number,
    itemsData: Array<{
      index: number;
      quantity?: string | number;
      unit?: string;
      item_description?: string;
      tag?: any;
      remarks?: string;
    }>,
  ): Promise<PurchaseReport> => {
    const res = await api.patch(`api/purchase-report/${id}/items/approve`, {
      items_data: itemsData, // PATCH body
    });
    return res.data;
  },

  getClean: async (params?: {
    searchTerm?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<PurchaseReportCleanItem>> => {
    const res = await api.get("api/purchase-reports-clean", { params });
    return res.data;
  },

  // ✅ Clean single report
  getCleanById: async (id: number): Promise<PurchaseReportCleanItem> => {
    const res = await api.get(`api/purchase-reports-clean/${id}`);
    return res.data;
  },

  updateSapId: async (id: number, sap_id: string) => {
    const res = await api.patch(`api/purchase-reports/${id}/sap-id`, {
      sap_id,
    });
    return res.data;
  },

  // ✅ Update WHOLE DOCUMENT PO NO
  updateDocumentPoNo: async (
    id: number,
    poNo: string,
  ): Promise<PurchaseReport> => {
    const res = await api.patch(`api/purchase-reports/${id}/po-no`, {
      po_no: poNo,
    });

    return res.data;
  },

  // ✅ Update PER-ITEM PO NO
  updatePerItemPoNo: async (
    id: number,
    payload: {
      item_index: number;
      po_no: string;
      status?: string;
    },
  ): Promise<PurchaseReport> => {
    const res = await api.patch(
      `api/purchase-reports/${id}/items/po-no`,
      payload,
    );

    return res.data;
  },

  // ✅ Approve WHOLE DOCUMENT PO
  approveDocumentPoDate: async (
    id: number,
    payload: {
      date: string;
      status: "approved" | "canceled";
    },
  ): Promise<PurchaseReport> => {
    const res = await api.patch(
      `api/purchase-reports/${id}/po-approve-date`,
      payload,
    );

    return res.data.report; // ← matches your controller response
  },

  // ✅ Approve PER-ITEM PO
  approvePerItemPoDate: async (
    id: number,
    payload: {
      item_index: number;
      date: string;
      status: "approved" | "canceled";
    },
  ): Promise<PurchaseReportItemPo> => {
    const res = await api.patch(
      `api/purchase-reports/${id}/items/po-approve-date`,
      payload,
    );

    return res.data.item_po;
  },
};
