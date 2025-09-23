import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth/authStore";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];      // roles that can access (e.g. ["admin", "purchasing"])
  fallbackPath?: string;       // where to redirect if not allowed
  showUnauthorized?: boolean;  // whether to show 403 page instead of redirect
}

export default function RoleProtectedRoute({
  children,
  allowedRoles,
  fallbackPath = "/dashboard",
  showUnauthorized = false,
}: RoleProtectedRouteProps) {
  const { user, isAuthenticated, loading, initialized } = useAuthStore();

  // 🔄 Show loading while auth initializes
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

  // 🔒 Not authenticated → go to login
  if (initialized && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Check if user has any of the allowed roles
  const hasAccess =
    user?.role?.some(r =>
      allowedRoles.some(allowed => r.toLowerCase().includes(allowed.toLowerCase()))
    ) ||
    user?.department?.some(d =>
      allowedRoles.some(allowed => d.toLowerCase().includes(allowed.toLowerCase()))
    );

  // ❌ If authenticated but doesn’t have access
  if (initialized && isAuthenticated && !hasAccess) {
    if (showUnauthorized) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-400 mb-4">403</h1>
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">Access Denied</h2>
            <p className="text-gray-500 mb-6">
              You don’t have permission to access this resource.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    } else {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // ✅ If allowed, render children
  return <>{children}</>;
}
