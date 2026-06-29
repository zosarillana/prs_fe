import api from "@/lib/api";
import type { PaginatedResponse } from "@/types/paginator";

export const priceMonitoringService = {
  importExcel: async (file: File): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("api/import-items", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },

  getTable: async (params: any) => {
    const res = await api.get("api/item-prices/table", { params });
    return res.data;
  },
};
