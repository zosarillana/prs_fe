import { useAuthStore } from "@/store/auth/authStore";
import Layout from "./components/layout/layout";
import Dashboard from "./features/dashboard/pages/dashboard";
import ProtectedRoute from "./routes/protectedRoute";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./features/auth/pages/login";
import SignupPage from "./features/auth/pages/register";

function AppWrapper() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  const hideNavbar =
    ["/login", "/register"].includes(location.pathname) || !user;

  // If navbar should be hidden, render routes without layout
  if (hideNavbar) {
    return (
      <div className="min-h-screen bg-gray-50">
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