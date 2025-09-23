import api from "@/lib/api";
import type { AuditLog } from "./types";

export const auditLogService = {
  /**
   * Paginated audit logs
   */
  getAll: async (
    params?: Partial<{
      pageNumber: number;
      pageSize: number;
      searchTerm: string;
      sortBy: string;
      sortOrder: "asc" | "desc";
      user_id: number | string;
      model_type: string;
    }>
  ): Promise<{
    items: AuditLog[];
    totalPages: number;
    totalItems: number;
    pageNumber: number;
    pageSize: number;
  }> => {
    const res = await api.get("api/audit-logs", { params });
    return res.data;
  },

  /**
   * Get a single audit log by id
   */
  getById: async (id: number | string): Promise<AuditLog> => {
    const res = await api.get(`api/audit-logs/${id}`);
    return res.data;
  },
};
