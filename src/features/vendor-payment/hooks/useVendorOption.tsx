import { useQuery } from "@tanstack/react-query";
import { vendorService } from "@/features/pricemonitoring/vendorService";
import type { PaginatedResponse } from "@/types/paginator";

interface Vendor {
  id: number;
  vendor_name: string;
}

export function useVendorOptions() {
  return useQuery<Vendor[]>({
    queryKey: ["vendorOptions"],
    queryFn: async () => {
      const res: PaginatedResponse<Vendor> =
        await vendorService.getAll({
          pageNumber: 1,
          pageSize: 1000,
          searchTerm: "",
        });

      return res.items ?? []; // ✅ never undefined
    },
    staleTime: 1000 * 60 * 10,
  });
}
