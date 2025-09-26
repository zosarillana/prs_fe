import { useQuery } from "@tanstack/react-query";
import { uomService } from "@/features/uom/uomService";
import type { Uom } from "@/features/uom/types";

/**
 * Global hook to fetch & cache all UOMs
 */
export function useUoms() {
  const query = useQuery<Uom[]>({
    queryKey: ["uoms"], // ✅ single key for caching
    queryFn: async () => {
      const res = await uomService.getAll({ pageNumber: 1, pageSize: 9999 });
      return res.items; // API returns { items: Uom[] }
    },
    staleTime: 1000 * 60 * 10, // 10 min cache
    gcTime: 1000 * 60 * 30,    // 30 min garbage collect
    refetchOnWindowFocus: false,
  });

  return {
    uoms: query.data ?? [],
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
