import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "@/store/auth/authStore";
import {
  LayoutDashboard,
  LogOut,
  MoreVertical,
  Settings,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const user = useAuthStore((state) => state.user);
  const [activeItem, setActiveItem] = useState<string>("");
  const [popoverOpen, setPopoverOpen] = useState(false);

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
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50
          transform transition-transform duration-300 ease-in-out
          border-r border-gray-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col justify-between`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-300">
            <div className="flex items-center gap-2">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8fssEwyy16ieSoPo_62lEqyx0meFbsagCsg&s"
                alt="MyApp Logo"
                className="h-6 w-auto"
              />
              <span className="text-green-700 -ml-1 font-medium">
                agrieximfze
              </span>
            </div>
          </div>

          {/* User Info Section */}
          {user && (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <div className="p-4 border-b border-gray-300 bg-gray-100">
                <PopoverTrigger asChild>
                  <div
                    className={`w-full px-3 py-2 rounded-md transition-colors cursor-pointer
                      ${
                        popoverOpen
                          ? "bg-gray-200 text-gray-900"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      {/* Left side (Avatar + text) */}
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback>
                            {user?.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs text-gray-600">Welcome back,</p>
                          <p className="text-sm font-medium text-gray-900">
                            {user?.name}
                          </p>
                        </div>
                      </div>

                      {/* Right side (⋮ button) */}
                      <MoreVertical className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                </PopoverTrigger>
              </div>

              {/* Popover menu */}
              <PopoverContent side="right" align="end" className="mt-20 w-48">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setActiveItem("profile")}
                    className={`text-sm flex items-center gap-2 text-left px-2 py-2 rounded transition-colors ${
                      activeItem === "profile"
                        ? "bg-gray-200 text-gray-900 font-medium"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveItem("settings")}
                    className={`text-sm flex items-center gap-2 text-left px-2 py-2 rounded transition-colors ${
                      activeItem === "settings"
                        ? "bg-gray-200 text-gray-900 font-medium"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <div className="border-t border-gray-300 -mx-2"></div>
                  <button
                    onClick={() => setActiveItem("logout")}
                    className={`text-sm flex items-center gap-2 text-left px-2 py-2 rounded transition-colors ${
                      activeItem === "logout"
                        ? "bg-gray-100 text-gray-600 font-medium"
                        : "hover:bg-gray-100 text-gray-500"
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Main Navigation */}
          <nav className="p-4">
            <ul className="space-y-2">
              <span className="text-sm px-3 text-gray-900 -ml-1">Home</span>
              <li>
                <NavLink
                  to="/dashboard"
                  onClick={toggleSidebar}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? "bg-gray-0 text-gray-900 font-medium"
                        : "text-gray-600 hover:bg-gray-200"
                    }`
                  }
                >
                  <LayoutDashboard className="w-5 h-5 mr-3" />
                  <p>Dashboard</p>
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t">
          <p className="text-xs">
            Copyright ©2025-2026. agrieximfze. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}
