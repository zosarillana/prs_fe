import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAuthStore } from "@/store/auth/authStore";
import { useThemeStore } from "@/store/theme/themeStore";
import Layout from "@/components/layout/layout";
import LoginPage from "@/features/auth/pages/login";
import { appRoutes } from "@/routes/appRoutes";
import { userPrivilegesService } from "@/services/userPriviligesService";
import type { UserPrivilege } from "@/types/userPriviliges";
import { Toaster } from "sonner";
import { useNotificationStore } from "./store/notification/notificationStore";
import NotFound from "@/features/misc/pages/notFound";
import GuestRoute from "@/routes/guestRoute";
import { RealtimeListener } from "./components/websocket/realTimeListener";
import useIdleLogout from "@/hooks/useIdleLogout";

function AppWrapper() {
  const { user, loading, initialized, initializeAuth } = useAuthStore();
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  // const fetchCounts = useNotificationStore((s) => s.fetchCounts);
  const setTheme = useThemeStore((s) => s.setTheme);
  const location = useLocation();

  const [allowedModuleIds, setAllowedModuleIds] = useState<Set<number>>(
    new Set()
  );
  const [privLoading, setPrivLoading] = useState(true);

  const fetchedNotifications = useRef(false);
  const fetchedPrivileges = useRef(false);
  
  // 🔑 Idle logout hook
  useIdleLogout(60 * 60 * 1000); // 10 minutes, can customize

  const hideNavbar =
    ["/login", "/register"].includes(location.pathname) || !user;

  // 🔐 Initialize auth
  useEffect(() => {
    if (!initialized) initializeAuth();
  }, [initialized, initializeAuth]);

  // 🔔 Fetch notifications + counts once per session
  useEffect(() => {
    if (!user || fetchedNotifications.current) return;
    fetchedNotifications.current = true;

    (async () => {
      await fetchNotifications();
      // await fetchCounts();
    })();
    // }, [user, fetchNotifications, fetchCounts]);
  }, [user, fetchNotifications]);

  // 🎨 Theme setup
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    setTheme(saved ?? "light");
  }, [setTheme]);

  // 🔑 Fetch user privileges (only once)
  useEffect(() => {
    const loadPrivileges = async () => {
      if (!user) {
        setAllowedModuleIds(new Set());
        setPrivLoading(false);
        return;
      }

      if (fetchedPrivileges.current) return;
      fetchedPrivileges.current = true;

      try {
        const data: UserPrivilege[] = await userPrivilegesService.getAll();
        const userPrivs = data.filter((p) => p.user_id === user.id);
        const ids = new Set<number>(
          userPrivs.flatMap((p) => p.module_ids ?? [])
        );
        setAllowedModuleIds(ids);
      } catch (err) {
        console.error("Failed to load privileges", err);
      } finally {
        setPrivLoading(false);
      }
    };

    loadPrivileges();
  }, [user]);

  const can = useCallback(
    (id?: number) => (id ? allowedModuleIds.has(id) : true),
    [allowedModuleIds]
  );

  // 🌀 Loading states
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

  if (privLoading) return null;

  const renderRoutes = () =>
    appRoutes.map(({ path, element, moduleId }) => (
      <Route
        key={path}
        path={path}
        element={moduleId && !can(moduleId) ? <NotFound /> : element}
      />
    ));

  const rootRedirect = user ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );

  if (hideNavbar) {
    return (
      <div className="min-h-screen dark:bg-gray-900 dark:text-gray-200">
        <Routes>
          <Route path="/" element={rootRedirect} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          {renderRoutes()}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    );
  }

  return (
    <Layout can={can}>
      <Routes>
        <Route path="/" element={rootRedirect} />
        {renderRoutes()}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <>
      <AppWrapper />
      {/* ✅ Single unified listener (replaces all 3 old listeners) */}
      <RealtimeListener />
      <Toaster position="top-right" />
    </>
  );
}
