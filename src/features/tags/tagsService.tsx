import api from "@/lib/api";
import type { Tag } from "./types";

export interface TagFilters {
  department_id?: number | number[];
  description?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  limit?: number;
}

export const tagsService = {
  /**
   * Get all tags with optional filters
   */
  getAll: async (filters?: TagFilters): Promise<Tag[]> => {
    const params = new URLSearchParams();

    if (filters?.department_id !== undefined) {
      const deptId = Array.isArray(filters.department_id)
        ? filters.department_id.join(",")
        : String(filters.department_id);
      params.append("department_id", deptId);
    }

    if (filters?.description) {
      params.append("description", filters.description);
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

    const queryString = params.toString();
    const url = queryString ? `api/tags?${queryString}` : "api/tags";
    
    const res = await api.get(url);
    return res.data;
  },

  /**
   * Get a single tag by id
   */
  getById: async (id: number | string): Promise<Tag> => {
    const res = await api.get(`api/tags/${id}`);
    return res.data;
  },

  /**
   * Create a new tag
   */
  create: async (payload: {
    department_id: number;
    description?: string;
  }): Promise<Tag> => {
    const res = await api.post("api/tags", payload);
    return res.data;
  },

  /**
   * Update an existing tag
   */
  update: async (
    id: number | string,
    payload: Partial<{
      department_id: number;
      description?: string;
    }>
  ): Promise<Tag> => {
    const res = await api.put(`api/tags/${id}`, payload);
    return res.data;
  },

  /**
   * Delete a tag by id
   */
  delete: async (id: number | string): Promise<{ message: string }> => {
    const res = await api.delete(`api/tags/${id}`);
    return res.data;
  },
};