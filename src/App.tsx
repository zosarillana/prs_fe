import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth/authStore";
import { useThemeStore } from "@/store/theme/themeStore";
import Layout from "@/components/layout/layout";
import LoginPage from "@/features/auth/pages/login";
import { appRoutes } from "@/routes/appRoutes";
import { Toaster } from "sonner";
import { GlobalEchoListener } from "@/components/websocket/globalEchoListener";
import { useNotificationStore } from "./store/notification/notificationStore";

function AppWrapper() {
  const { user, loading, initialized, initializeAuth } = useAuthStore();

  const fetchNotifications = useNotificationStore(
    (state) => state.fetchNotifications
  );
  const fetchCounts = useNotificationStore((state) => state.fetchCounts);

  const location = useLocation();
  const setTheme = useThemeStore((state) => state.setTheme);

  const hideNavbar =
    ["/login", "/register"].includes(location.pathname) || !user;

  // Initialize auth ONCE when app starts
  useEffect(() => {
    if (!initialized) {
      initializeAuth();
    }
  }, [initialized, initializeAuth]);

  // Fetch notifications + counts WHEN user is available
  // 🔥 FIXED: Removed function dependencies to prevent re-runs
  useEffect(() => {
    if (user) {
      // Call them sequentially to avoid race conditions
      const loadData = async () => {
        await fetchNotifications();
        await fetchCounts();
      };
      loadData();
    }
  }, [user]); // ✅ Only depend on 'user', not the functions

  // Theme setup - Default to light theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    setTheme(savedTheme ?? "light");
  }, [setTheme]);

  // Show loading ONLY while checking auth for the first time
  if (!initialized && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (hideNavbar) {
    return (
      <div className="min-h-screen dark:bg-gray-900 dark:text-gray-200">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          {/* <Route path="/register" element={<SignupPage />} /> */}
          {appRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {appRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
      <GlobalEchoListener />
      <Toaster position="top-right" />
    </Router>
  );
}