import { NavLink } from "react-router-dom";
import { LayoutDashboard, Receipt, User2Icon } from "lucide-react";
import { useAuthStore } from "@/store/auth/authStore";

export default function SidebarNav() {
  const { user } = useAuthStore();

  const isAdmin =
    user?.role?.includes("admin") ||
    user?.department?.some((dept) => dept.toLowerCase().includes("admin"));

  return (
    <ul className="space-y-2">
      <span className="text-sm px-3 text-gray-900 dark:text-gray-100 -ml-1">
        Home
      </span>

      <li>
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

      {isAdmin && (
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
    </ul>
  );
}
