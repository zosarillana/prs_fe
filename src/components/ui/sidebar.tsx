import { Link } from "react-router-dom";
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
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50
          transform transition-transform duration-300 ease-in-out
          border-r border-gray-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col justify-between
        `}
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
            <Popover>
              <div className="p-4 border-b border-gray-300 bg-gray-100">
                <PopoverTrigger asChild>
                  <div className="w-full px-3 py-2 text-gray-600 hover:bg-gray-200 rounded-md transition-colors cursor-pointer">
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
                <div className="flex flex-col">
                  <button className="text-sm flex items-center gap-2 text-left px-3 py-2 hover:bg-gray-100 rounded">
                    <User className="w-4 h-4 text-gray-600" />
                    Profile
                  </button>
                  <button className="text-sm flex items-center gap-2 text-left px-3 py-2 hover:bg-gray-100 rounded">
                    <Settings className="w-4 h-4 text-gray-600" />
                    Settings
                  </button>
                  <button className="text-sm flex items-center gap-2 text-left px-3 py-2 hover:bg-gray-100 rounded text-red-500">
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
                <Link
                  to="/dashboard"
                  className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                  onClick={toggleSidebar}
                >
                  <LayoutDashboard className="w-5 h-5 mr-3" />
                  <p>Dashboard</p>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t">
          <p className="text-xs">
            Copyright ©2025-2026. agrieximfze. All rights reserved.
          </p>
          {/* <Link
            to="/settings"
            className="flex items-center px-3 py-2 text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            onClick={toggleSidebar}
          >
            <Settings className="w-5 h-5 mr-3" />
            <p>Settings</p>
          </Link> */}
        </div>
      </div>
    </>
  );
}
