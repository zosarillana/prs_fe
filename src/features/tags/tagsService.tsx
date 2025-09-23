import api from "@/lib/api";
import type { Tag } from "./types";

export const tagsService = {
  /**
   * Get all tags (no pagination based on your controller)
   */
  getAll: async (): Promise<Tag[]> => {
    const res = await api.get("api/tags");
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
