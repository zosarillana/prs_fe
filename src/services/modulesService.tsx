import api from "@/lib/api";
import type { Module } from "@/types/modules";

export const moduleService = {
  /**
   * Get all Module records
   */
  getAll: async (): Promise<Module[]> => {
    const res = await api.get("api/modules");
    return res.data;
  },

  /**
   * Get a single Module by id
   */
  getById: async (id: number | string): Promise<Module> => {
    const res = await api.get(`api/modules/${id}`);
    return res.data;
  },

  /**
   * Create a new Module
   */
  create: async (payload: {
    name: string;
    description?: string;
  }): Promise<Module> => {
    const res = await api.post("api/modules", payload);
    return res.data;
  },

  /**
   * Update an existing Module
   */
  update: async (
    id: number | string,
    payload: Partial<{
      name: string;
      description?: string;
    }>
  ): Promise<Module> => {
    const res = await api.put(`api/modules/${id}`, payload);
    return res.data;
  },

  /**
   * Delete a Module by id
   */
  delete: async (id: number | string): Promise<{ message: string }> => {
    const res = await api.delete(`api/modules/${id}`);
    return res.data;
  },
};
