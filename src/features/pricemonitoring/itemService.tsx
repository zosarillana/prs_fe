import api from "@/lib/api";

export interface GetAllParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const itemService = {
  async getAll(params: GetAllParams = {}) {
    const res = await api.get("api/items", { params });
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get(`api/items/${id}`);
    return res.data;
  },

  async create(data: {
    item_name: string;
    description?: string;
  }) {
    const res = await api.post("api/items", data);
    return res.data;
  },

  async update(
    id: number,
    data: {
      item_name: string;
      description?: string;
    }
  ) {
    const res = await api.put(`api/items/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    const res = await api.delete(`api/items/${id}`);
    return res.data;
  },
};
