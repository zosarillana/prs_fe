import api from "@/lib/api";
import { PaginatedResponse } from "@/types/paginator";
import { User } from "./types";

export const userService = {
  // Paginated list
  getAll: async (params?: {
    searchTerm?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<User>> => {
    const res = await api.get("api/users", { params });
    return res.data;
  },

  // Get single user
  getById: async (id: number): Promise<User> => {
    const res = await api.get(`api/users/${id}`);
    return res.data;
  },

  // Create user
  create: async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    department?: string[];
    role?: string[];
  }): Promise<User> => {
    const res = await api.post("api/users", data);
    return res.data;
  },

  // Update user
  update: async (id: number, data: Partial<User>): Promise<User> => {
    const res = await api.put(`api/users/${id}`, data);
    return res.data;
  },

  // Delete user
  delete: async (id: number): Promise<void> => {
    await api.delete(`api/users/${id}`);
  },
};
