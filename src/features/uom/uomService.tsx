import api from "@/lib/api";
import type { Uom } from "./types";

export interface PagedUomResponse {
  items: Uom[];
  totalPages: number;
  totalItems: number;
  pageNumber: number;
  pageSize: number;
}

export const uomService = {
  /**
   * Get all UOM records (paginated)
   */
  getAll: async (
    params?: Partial<{
      pageNumber: number;
      pageSize: number;
      searchTerm: string;
      sortBy: string;
      sortOrder: "asc" | "desc";
    }>
  ): Promise<PagedUomResponse> => {
    const res = await api.get("api/uoms", { params });
    return res.data;
  },

  /**
   * Get a single UOM by id
   */
  getById: async (id: number | string): Promise<Uom> => {
    const res = await api.get(`api/uoms/${id}`);
    return res.data;
  },

  /**
   * Create a new UOM
   */
  create: async (payload: Pick<Uom, "description">): Promise<Uom> => {
    const res = await api.post("api/uoms", payload);
    return res.data;
  },

  /**
   * Update a UOM by id
   */
  update: async (
    id: number | string,
    payload: Pick<Uom, "description">
  ): Promise<Uom> => {
    const res = await api.put(`api/uoms/${id}`, payload);
    return res.data;
  },

  /**
   * Delete a UOM by id
   */
  delete: async (id: number | string): Promise<{ message: string }> => {
    const res = await api.delete(`api/uoms/${id}`);
    return res.data;
  },
};
