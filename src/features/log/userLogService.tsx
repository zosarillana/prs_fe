import api from "@/lib/api";
import type { UserLog } from "./types";

export const userLogService = {
  /**
   * Paginated user login/logout logs
   */
  getAll: async (
    params?: Partial<{
      pageNumber: number;
      pageSize: number;
      searchTerm: string;
      sortBy: string;
      sortOrder: "asc" | "desc";
      user_id: number | string;
    }>
  ): Promise<{
    items: UserLog[];
    totalPages: number;
    totalItems: number;
    pageNumber: number;
    pageSize: number;
  }> => {
    const res = await api.get("api/user-logs", { params });
    return res.data;
  },

  /**
   * Get a single user log by id
   */
  getById: async (id: number | string): Promise<UserLog> => {
    const res = await api.get(`api/user-logs/${id}`);
    return res.data;
  },
};
