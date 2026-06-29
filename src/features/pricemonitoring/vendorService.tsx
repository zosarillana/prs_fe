import api from "@/lib/api";

export interface GetAllParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const vendorService = {
  async getAll(params: GetAllParams = {}) {
    const res = await api.get("api/vendors", { params });
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get(`api/vendors/${id}`);
    return res.data;
  },

  async create(data: { vendor_name: string; description?: string }) {
    const res = await api.post("api/vendors", data);
    return res.data;
  },

  async update(
    id: number,
    data: {
      vendor_name: string;
      description?: string;
    }
  ) {
    const res = await api.put(`api/vendors/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    const res = await api.delete(`api/vendors/${id}`);
    return res.data;
  },
};
