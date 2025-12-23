import api from "@/lib/api";

export interface GetAllParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  item?: string;
  vendor?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ItemPricePayload {
  item_id: number;
  vendor_id: number;
  unit_price: number;
}

export const itemPriceService = {
  /**
   * Get paginated item prices (table)
   */
  async getAll(params: GetAllParams = {}) {
    const res = await api.get("api/item-prices", { params });
    return res.data;
  },

  /**
   * Get single item price
   */
  async getById(id: number) {
    const res = await api.get(`api/item-prices/${id}`);
    return res.data;
  },

  /**
   * Create item price
   */
  async create(data: ItemPricePayload) {
    const res = await api.post("api/item-prices", data);
    return res.data;
  },

  /**
   * Update item price
   */
  async update(id: number, data: ItemPricePayload) {
    const res = await api.put(`api/item-prices/${id}`, data);
    return res.data;
  },

  /**
   * Delete item price
   */
  async delete(id: number) {
    const res = await api.delete(`api/item-prices/${id}`);
    return res.data;
  },
};
