import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth/authStore";
import { Cog, LogOut, MoreVertical, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { authService } from "@/features/auth/authService";
import SidebarNav from "./sidebarNav";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const user = useAuthStore((state) => state.user);
  const [activeItem, setActiveItem] = useState<string>("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = async () => {
    await authService.logout();
    clearAuth();
    navigate("/login");
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 
            bg-white dark:bg-gray-800 
            shadow-lg z-50
            transform transition-all duration-300 ease-in-out
            border-r border-gray-300 dark:border-gray-700
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
            flex flex-col justify-between`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <img
                src="https://agrieximorganic.com/wp-content/uploads/2025/01/AgriExim_Logo_Colour.png"
                alt="MyApp Logo"
                className="h-16 -my-5 -ml-4 w-auto"
              />
              {/* <span className="text-green-700 dark:text-green-400 -ml-1 font-medium">
                  agrieximfze
                </span> */}
            </div>
          </div>

          {/* User Info Section */}
          {user && (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <div className="p-4 border-b border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700/50">
                <PopoverTrigger asChild>
                  <div
                    className={`w-full px-3 py-2 rounded-md transition-colors cursor-pointer
                        ${
                          popoverOpen
                            ? "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      {/* Left side (Avatar + text) */}
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
                            {user?.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Welcome back,
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {user?.name}
                          </p>
                          <p className="text-xs font-light text-gray-900 dark:text-gray-100">
                            {user?.department
                              ?.map((dep) =>
                                dep
                                  .split("_")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1)
                                  )
                                  .join(" ")
                              )
                              .join(", ")}{" "}
                          </p>
                        </div>
                      </div>

                      {/* Right side (⋮ button) */}
                      <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                  </div>
                </PopoverTrigger>
              </div>

              {/* Popover menu */}
              <PopoverContent
                side="right"
                align="end"
                className="mt-20 w-48 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-col gap-1">
                  <NavLink
                    to="/profile"
                    onClick={() => setActiveItem("profile")}
                    className={`text-sm flex items-center gap-2 text-left px-2 py-2 rounded transition-colors ${
                      activeItem === "profile"
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </NavLink>
                  {user?.role?.includes("admin") && (
                    <NavLink
                      to="/settings"
                      onClick={() => setActiveItem("settings")}
                      className={`text-sm flex items-center gap-2 text-left px-2 py-2 rounded transition-colors ${
                        activeItem === "settings"
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      <Cog className="w-4 h-4" />
                      Settings
                    </NavLink>
                  )}

                  <div className="border-t border-gray-300 dark:border-gray-600 -mx-2"></div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setActiveItem("logout");
                    }}
                    className={`text-sm flex items-center gap-2 text-left px-2 py-2 rounded transition-colors ${
                      activeItem === "logout"
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Main Navigation (Scrollable Only) */}
          <nav className="p-4">
            <div className="max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
              <SidebarNav />
            </div>
          </nav>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-gray-300 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Copyright ©2025-2026. agrieximfze. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}
