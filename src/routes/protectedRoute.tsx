import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, initialized } = useAuthStore();

  // Show loading while auth is being initialized (only happens once)
  if (!initialized && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (initialized && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ NO AUTH CALLS HERE - just return children if authenticated
  return <>{children}</>;
}