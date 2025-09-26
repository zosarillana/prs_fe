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

interface SidebarNavProps {
  can: (moduleId: number) => boolean;
}

export default function SidebarNav({ can }: SidebarNavProps) {
  return (
    <ul className="flex flex-col gap-2">
      {can(1) && (
        <li>
          <span className="text-sm px-3 text-gray-900 dark:text-gray-100 -ml-1">
            Home
          </span>
          <NavLink
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

      {can(4) && (
        <>
          <span className="text-sm px-3 text-gray-900 dark:text-gray-100 -ml-1">
            User
          </span>
          <li>
            <NavLink
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

      {(can(5) || can(6) || can(7)) && (
        <>
          <span className="text-sm px-3 text-gray-900 dark:text-gray-100 -ml-1">
            Masterdata
          </span>
          {can(5) && (
            <li>
              <NavLink
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

      {(can(8) || can(9)) && (
        <>
          <span className="text-sm px-3 text-gray-900 dark:text-gray-100 -ml-1">
            Logs
          </span>
          {can(8) && (
            <li>
              <NavLink
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
