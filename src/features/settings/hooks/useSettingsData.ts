import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { userPrivilegesService } from "@/services/userPriviligesService";
import { userService } from "@/features/users/userService";
import { tagsService } from "@/features/tags/tagsService";
import { departmentService } from "@/features/department/departmentService";
import { moduleService } from "@/services/modulesService";

import type { UserPrivilege } from "@/types/userPriviliges";
import type { User } from "@/types/users";
import type { Department } from "@/features/department/types";
import type { Tag } from "@/features/tags/types";
import type { Module } from "@/types/modules";

export function useToggleSelection() {
  return useCallback(
    (
      id: number,
      selected: number[],
      setter: React.Dispatch<React.SetStateAction<number[]>>
    ) => {
      setter(
        selected.includes(id)
          ? selected.filter((x) => x !== id)
          : [...selected, id]
      );
    },
    []
  );
}

export function usePrivilegesData() {
  const [privileges, setPrivileges] = useState<UserPrivilege[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [privs, usersRes, tagsRes, deptRes, modulesRes] = await Promise.all(
        [
          userPrivilegesService.getAll(),
          userService.getAll({ pageSize: 9999 }),
          tagsService.getAll(),
          departmentService.getAll({ pageSize: 9999 }),
          moduleService.getAll(),
        ]
      );

      setPrivileges(privs);
      setUsers(usersRes.items);
      setTags(tagsRes);
      setDepartments(deptRes.items);
      setModules(modulesRes);
    } catch (err) {
      console.error(err);
      const errorMsg = "Failed to load data. Please refresh.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    privileges,
    users,
    tags,
    departments,
    modules,
    loading,
    error,
    loadData,
  };
}
