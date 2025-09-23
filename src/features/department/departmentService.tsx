import api from "@/lib/api";
import type { Department } from "./types";

export interface PagedDepartmentResponse {
  items: Department[];
  totalPages: number;
  totalItems: number;
  pageNumber: number;
  pageSize: number;
}

export const departmentService = {
  /**
   * Get all departments (paginated)
   */
  getAll: async (
    params?: Partial<{
      pageNumber: number;
      pageSize: number;
      searchTerm: string;
      sortBy: string;
      sortOrder: "asc" | "desc";
    }>
  ): Promise<PagedDepartmentResponse> => {
    const res = await api.get("api/departments", { params });
    return res.data;
  },

  /**
   * Get a single department by ID
   */
  getById: async (id: number | string): Promise<Department> => {
    const res = await api.get(`api/departments/${id}`);
    return res.data;
  },

  /**
   * Create a new department
   */
  create: async (
    payload: Pick<Department, "name" | "description">
  ): Promise<Department> => {
    const res = await api.post("api/departments", payload);
    return res.data;
  },

  /**
   * Update an existing department
   */
  update: async (
    id: number | string,
    payload: Partial<Pick<Department, "name" | "description">>
  ): Promise<Department> => {
    const res = await api.put(`api/departments/${id}`, payload);
    return res.data;
  },

  /**
   * Delete a department
   */
  delete: async (id: number | string): Promise<{ message: string }> => {
    const res = await api.delete(`api/departments/${id}`);
    return res.data;
  },
};
