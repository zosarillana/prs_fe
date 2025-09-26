import { useQuery } from "@tanstack/react-query";
import { tagsService } from "@/features/tags/tagsService";
import type { Tag } from "@/features/tags/types";

/**
 * Global hook to fetch & cache all tags
 * (read-only, no create/update/delete)
 */
export function useTags() {
  const { data: tags = [], isLoading, isFetching, error, refetch } = useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: () => tagsService.getAll(),
    staleTime: 1000 * 60 * 10, // 10 min cache freshness
    gcTime: 1000 * 60 * 30,    // 30 min garbage collect
    refetchOnWindowFocus: false,
  });

  return {
    tags,          // array of Tag
    loading: isLoading,
    fetching: isFetching,
    error,
    refetch,
  };
}
