// src/hooks/useUserPrivileges.ts
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth/authStore";
import { userPrivilegesService } from "@/services/userPriviligesService";
import type { UserPrivilege } from "@/types/userPriviliges";

export function useUserPrivileges() {
  const { user } = useAuthStore();
  const [privileges, setPrivileges] = useState<UserPrivilege[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const data = await userPrivilegesService.getAll();
        const userPrivs = data.filter((p) => p.user_id === user.id);
        setPrivileges(userPrivs);
      } catch (err) {
        console.error("Failed to load user privileges", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const allowedModuleIds = new Set<number>(
    privileges.flatMap((p) => p.module_ids ?? [])
  );

  const can = (moduleId: number) => allowedModuleIds.has(moduleId);

  return { privileges, can, loading };
}
