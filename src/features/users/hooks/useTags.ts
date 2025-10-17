import { useState, useEffect } from "react";
import { tagsService } from "@/features/tags/tagsService";
import { userPrivilegesService } from "@/services/userPriviligesService";
import type { Tag } from "@/features/tags/types";
import { useAuthStore } from "@/store/auth/authStore";

export function useTags() {
  const user = useAuthStore((state) => state.user);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserTags = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Fetch user privileges to get their assigned tag_ids
        const privileges = await userPrivilegesService.getAll();
        const userPrivilege = privileges.find((p) => p.user_id === user.id);

        // 2. If user has no privileges or no tag_ids, return empty
        if (
          !userPrivilege ||
          !userPrivilege.tag_ids ||
          userPrivilege.tag_ids.length === 0
        ) {
          setTags([]);
          setLoading(false);
          return;
        }

        // 3. Fetch all tags
        const allTags = await tagsService.getAll();

        // 4. Filter to only show tags that are in the user's tag_ids
        const userTags = allTags.filter((tag) =>
          userPrivilege.tag_ids.includes(tag.id)
        );

        setTags(userTags);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch user tags:", err);
        setError(err?.response?.data?.message || "Failed to load tags");
        setTags([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTags();
  }, [user?.id]);

  return { tags, loading, error };
}
