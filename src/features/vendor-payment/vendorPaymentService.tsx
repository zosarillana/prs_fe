import api from "@/lib/api";
import { VendorPaymentPayload } from "./types/vendorPaymentTypes";
import { PaginatedResponse } from "@/types/paginator";

export interface GetAllParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const vendorPaymentService = {
  // Get paginated vendor payments
  async getAll(
    params: GetAllParams = {},
  ): Promise<PaginatedResponse<VendorPaymentPayload>> {
    const res = await api.get("api/vendor-payments", { params });
    return res.data;
  },

  async getById(id: number): Promise<VendorPaymentPayload> {
    const res = await api.get(`api/vendor-payments/${id}`);
    return res.data;
  },

  async create(data: VendorPaymentPayload): Promise<VendorPaymentPayload> {
    const res = await api.post("api/vendor-payments", data);
    return res.data;
  },

  async update(
    id: number,
    data: VendorPaymentPayload,
  ): Promise<VendorPaymentPayload> {
    const res = await api.put(`api/vendor-payments/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`api/vendor-payments/${id}`);
  },
  

  async serve(id: number, dateServed?: string): Promise<VendorPaymentPayload> {
    const res = await api.post(`api/vendor-payments/${id}/serve`, {
      date_served: dateServed,
    });
    return res.data;
  },
};
