import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth/authStore";
import { useThemeStore } from "@/store/theme/themeStore";
import Layout from "@/components/layout/layout";
import LoginPage from "@/features/auth/pages/login";
import { appRoutes } from "@/routes/appRoutes";
import { userPrivilegesService } from "@/services/userPriviligesService";
import type { UserPrivilege } from "@/types/userPriviliges";
import { Toaster } from "sonner";
import { GlobalEchoListener } from "@/components/websocket/globalEchoListener";
import { useNotificationStore } from "./store/notification/notificationStore";
import { GlobalSystemListener } from "./components/websocket/globalSystemListener";
import NotFound from "@/features/misc/pages/notFound";

function AppWrapper() {
  const { user, loading, initialized, initializeAuth } = useAuthStore();
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const fetchCounts = useNotificationStore((s) => s.fetchCounts);
  const setTheme = useThemeStore((s) => s.setTheme);
  const location = useLocation();

  const [allowedModuleIds, setAllowedModuleIds] = useState<Set<number>>(new Set());
  const [privLoading, setPrivLoading] = useState(true);

  const hideNavbar =
    ["/login", "/register"].includes(location.pathname) || !user;

  // initialize auth
  useEffect(() => {
    if (!initialized) initializeAuth();
  }, [initialized, initializeAuth]);

  // fetch notifications + counts
  useEffect(() => {
    if (user) {
      (async () => {
        await fetchNotifications();
        await fetchCounts();
      })();
    }
  }, [user]);

  // theme setup
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    setTheme(saved ?? "light");
  }, [setTheme]);

  // 🔑 fetch user privileges to build allowedModuleIds
  useEffect(() => {
    if (!user) {
      setAllowedModuleIds(new Set());
      setPrivLoading(false);
      return;
    }

    (async () => {
      try {
        const data: UserPrivilege[] = await userPrivilegesService.getAll();
        const userPrivs = data.filter((p) => p.user_id === user.id);
        const ids = new Set<number>(userPrivs.flatMap((p) => p.module_ids ?? []));
        setAllowedModuleIds(ids);
      } catch (err) {
        console.error("Failed to load privileges", err);
      } finally {
        setPrivLoading(false);
      }
    })();
  }, [user]);

  // loading state
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

  if (privLoading) return null; // or spinner while checking privileges

  const can = (id?: number) => (id ? allowedModuleIds.has(id) : true);

  const renderRoutes = () =>
    appRoutes.map(({ path, element, moduleId }) => (
      <Route
        key={path}
        path={path}
        element={
          moduleId && !can(moduleId) ? (
            <NotFound /> // 🚫 404 if user lacks privilege
          ) : (
            element
          )
        }
      />
    ));

  if (hideNavbar) {
    return (
      <div className="min-h-screen dark:bg-gray-900 dark:text-gray-200">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          {renderRoutes()}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {renderRoutes()}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
      <GlobalEchoListener />
      <GlobalSystemListener />
      <Toaster position="top-right" />
    </Router>
  );
}
