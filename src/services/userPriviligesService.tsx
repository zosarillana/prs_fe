import api from "@/lib/api";
import { UserPrivilege } from "@/types/userPriviliges";

export interface UserPrivilegeFilters {
  user_id?: number | number[];
  tag_ids?: number[];
  module_ids?: number[];
  role?: string; // 👈 ADD
  sort_by?: string;
  sort_order?: "asc" | "desc";
  limit?: number;
}

export const userPrivilegesService = {
  /**
   * Get all UserPrivilege records with optional filters
   */
  getAll: async (filters?: UserPrivilegeFilters): Promise<UserPrivilege[]> => {
    const params = new URLSearchParams();

    if (filters?.user_id !== undefined) {
      const userId = Array.isArray(filters.user_id)
        ? filters.user_id.join(",")
        : String(filters.user_id);
      params.append("user_id", userId);
    }

    if (filters?.tag_ids && filters.tag_ids.length > 0) {
      params.append("tag_ids", filters.tag_ids.join(","));
    }

    if (filters?.module_ids && filters.module_ids.length > 0) {
      params.append("module_ids", filters.module_ids.join(","));
    }

    if (filters?.sort_by) {
      params.append("sort_by", filters.sort_by);
    }

    if (filters?.sort_order) {
      params.append("sort_order", filters.sort_order);
    }

    if (filters?.limit) {
      params.append("limit", String(filters.limit));
    }

    if (filters?.role) {
      params.append("role", filters.role);
    }

    const queryString = params.toString();
    const url = queryString
      ? `api/user-privileges?${queryString}`
      : "api/user-privileges";

    const res = await api.get(url);
    return res.data;
  },

  /**
   * Get a single UserPrivilege by id
   */
  getById: async (id: number | string): Promise<UserPrivilege> => {
    const res = await api.get(`api/user-privileges/${id}`);
    return res.data;
  },

  /**
   * Create a new UserPrivilege
   */
  create: async (payload: {
    user_id: number;
    tag_ids?: number[];
    module_ids?: number[];
  }): Promise<UserPrivilege> => {
    const res = await api.post("api/user-privileges", payload);
    return res.data;
  },

  /**
   * Update a UserPrivilege by id
   */
  update: async (
    id: number | string,
    payload: {
      tag_ids?: number[];
      module_ids?: number[];
    }
  ): Promise<UserPrivilege> => {
    const res = await api.put(`api/user-privileges/${id}`, payload);
    return res.data;
  },

  /**
   * Delete a UserPrivilege by id
   */
  delete: async (id: number | string): Promise<{ message: string }> => {
    const res = await api.delete(`api/user-privileges/${id}`);
    return res.data;
  },
};
