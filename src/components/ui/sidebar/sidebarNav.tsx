import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  ListOrdered,
  ListTodo,
  ListTree,
  Receipt,
  RulerDimensionLine,
  TagIcon,
  User2Icon,
} from "lucide-react";
import { useAuthStore } from "@/store/auth/authStore";
import { userPrivilegesService } from "@/services/userPriviligesService";
import type { UserPrivilege } from "@/types/userPriviliges";

export default function SidebarNav() {
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

  // Collect all module_ids the user is allowed to see
  const allowedModuleIds = new Set<number>(
    privileges.flatMap((p) => p.module_ids ?? [])
  );

  const can = (moduleId: number) => allowedModuleIds.has(moduleId);

  if (loading) return null; // or a spinner if preferred

  return (
    <ul className="flex flex-col gap-2">
      {can(1) && (
        <li>
          <span className="text-sm px-3 text-gray-900 dark:text-gray-100 -ml-1">
            Home
          </span>
          <NavLink
            reloadDocument
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            <p>Dashboard</p>
          </NavLink>
        </li>
      )}

      {can(2) && (
        <li>
          <NavLink
            reloadDocument
            to="/purchase-reports"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`
            }
          >
            <Receipt className="w-5 h-5 mr-3" />
            <p>Purchase Requests</p>
          </NavLink>
        </li>
      )}

      {can(3) && (
        <li>
          <NavLink
            reloadDocument
            to="/purchase-order"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`
            }
          >
            <ListOrdered className="w-5 h-5 mr-3" />
            <p>Purchase Orders</p>
          </NavLink>
        </li>
      )}

      {/* User Management */}
      {can(4) && (
        <>
          <span className="text-sm px-3 text-gray-900 dark:text-gray-100 -ml-1">
            User
          </span>
          <li>
            <NavLink
              reloadDocument
              to="/users"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`
              }
            >
              <User2Icon className="w-5 h-5 mr-3" />
              <p>Users</p>
            </NavLink>
          </li>
        </>
      )}

      {/* Masterdata */}
      {(can(5) || can(6) || can(7)) && (
        <>
          <span className="text-sm px-3 text-gray-900 dark:text-gray-100 -ml-1">
            Masterdata
          </span>
          {can(5) && (
            <li>
              <NavLink
                reloadDocument
                to="/uom"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`
                }
              >
                <RulerDimensionLine className="w-5 h-5 mr-3" />
                <p>Uom</p>
              </NavLink>
            </li>
          )}
          {can(6) && (
            <li>
              <NavLink
                reloadDocument
                to="/department"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`
                }
              >
                <Building2 className="w-5 h-5 mr-3" />
                <p>Department</p>
              </NavLink>
            </li>
          )}
          {can(7) && (
            <li>
              <NavLink
                reloadDocument
                to="/tags"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`
                }
              >
                <TagIcon className="w-5 h-5 mr-3" />
                <p>Tags</p>
              </NavLink>
            </li>
          )}
        </>
      )}

      {/* Logs */}
      {(can(8) || can(9)) && (
        <>
          <span className="text-sm px-3 text-gray-900 dark:text-gray-100 -ml-1">
            Logs
          </span>
          {can(8) && (
            <li>
              <NavLink
                reloadDocument
                to="/user-logs"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`
                }
              >
                <ListTodo className="w-5 h-5 mr-3" />
                <p>User Logs</p>
              </NavLink>
            </li>
          )}
          {can(9) && (
            <li>
              <NavLink
                reloadDocument
                to="/audit-logs"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`
                }
              >
                <ListTree className="w-5 h-5 mr-3" />
                <p>Audit Logs</p>
              </NavLink>
            </li>
          )}
        </>
      )}
    </ul>
  );
}
