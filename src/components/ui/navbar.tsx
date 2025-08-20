import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth/authStore";
import { useThemeStore } from "@/store/theme/themeStore";
import { Bell, Sun, Moon } from "lucide-react";

interface NavbarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Navbar({ sidebarOpen, toggleSidebar }: NavbarProps) {
  const user = useAuthStore((state) => state.user);
  const { theme, toggleTheme } = useThemeStore();

  return (
    <nav
      className={`
        bg-white dark:bg-gray-900 dark:text-gray-200
        shadow-sm px-6 py-2.5 border-b border-gray-300 dark:border-gray-700
        flex justify-between items-center sticky top-0 z-40
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? "ml-64" : "ml-0"}
      `}
    >
      <div className="flex items-center">
        {/* Hamburger Menu Button */}
        <button
          onClick={toggleSidebar}
          className="mr-4 focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
      </div>

      <div className="space-x-4 flex items-center">
        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>

        {user && (
            <button  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    <Bell className="w-5 h-5  dark:text-gray-300 cursor-pointer hover:text-gray-700 dark:hover:text-white transition-colors" />
            </button>
      
        )}
      </div>
    </nav>
  );
}
