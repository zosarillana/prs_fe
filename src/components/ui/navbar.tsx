import { useAuthStore } from "@/store/auth/authStore";
import { useThemeStore } from "@/store/theme/themeStore";
import { useNotificationStore } from "@/store/notification/notificationStore";
import { Bell, Sun, Moon, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Navbar({ sidebarOpen, toggleSidebar }: NavbarProps) {
  const user = useAuthStore((state) => state.user);
  const { theme, toggleTheme } = useThemeStore();
  const { 
    unreadCount, 
    notifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotificationStore();

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(notificationId);
    }
  };

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
      <div className="my-1.5flex items-center">
        {/* Hamburger Menu Button */}
        <button
          onClick={toggleSidebar}
          className="mr-4 focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-4 h-4"
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
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </button>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <Bell className="w-5 h-5 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-colors" />
                </Button>
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full pointer-events-none"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </div>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              className="w-80 max-h-96" 
              align="end" 
              side="bottom"
              sideOffset={8}
            >
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      markAllAsRead();
                    }}
                    className="text-xs h-auto p-1 hover:underline"
                  >
                    Mark all as read
                  </Button>
                )}
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No notifications yet
                </div>
              ) : (
                <ScrollArea className="h-64">
                  {notifications.slice(0, 10).map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="p-0 focus:bg-gray-50 dark:focus:bg-gray-800"
                    >
                      <div
                        className={`w-full p-3 cursor-pointer transition-colors ${
                          !notification.read_at 
                            ? 'bg-blue-50 dark:bg-blue-950/20 border-l-2 border-l-blue-500' 
                            : ''
                        }`}
                        onClick={() => handleNotificationClick(notification.id, !!notification.read_at)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {notification.read_at ? (
                              <CheckCircle className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Clock className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              !notification.read_at ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'
                            }`}>
                              {notification.data.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Report #{notification.data.report_id}
                              </p>
                              {notification.data.pr_status && (
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  PR: {notification.data.pr_status}
                                </Badge>
                              )}
                              {notification.data.po_status && (
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  PO: {notification.data.po_status}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </ScrollArea>
              )}
              
              {notifications.length > 10 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="p-2 text-center">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View all notifications
                    </Button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}