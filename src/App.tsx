import { useAuthStore } from "@/store/auth/authStore";
import Navbar from "./components/ui/navbar";
import Dashboard from "./features/dashboard/pages/dashboats";
import ProtectedRoute from "./routes/ProtectedRoute";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./features/auth/pages/login";
import SignupPage from "./features/auth/pages/register";

function AppWrapper() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  
  // Only hide navbar on auth pages or when user is not logged in
  const hideNavbar = ["/login", "/register"].includes(location.pathname) || !user;

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div>
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
    </>
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