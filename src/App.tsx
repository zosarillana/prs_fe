import { useAuthStore } from "@/store/auth/authStore";
import Layout from "./components/layout/layout";
import Dashboard from "./features/dashboard/pages/dashboard";
import ProtectedRoute from "./routes/protectedRoute";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import LoginPage from "./features/auth/pages/login";
import SignupPage from "./features/auth/pages/register";
import { useThemeStore } from "@/store/theme/themeStore";
import { useEffect } from "react";

function AppWrapper() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  const hideNavbar =
    ["/login", "/register"].includes(location.pathname) || !user;

  const setTheme = useThemeStore((state) => state.setTheme);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, [setTheme]);
  if (hideNavbar) {
    return (
      <div className="min-h-screen dark:bg-gray-900 dark:text-gray-200">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </div>
    );
  }

  // If navbar should be shown, render with layout
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
