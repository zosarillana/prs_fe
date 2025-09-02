import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth/authStore";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string; // Where to redirect non-admin users
  showUnauthorized?: boolean; // Show 403 page instead of redirecting
}

export default function AdminProtectedRoute({ 
  children, 
  fallbackPath = "/dashboard",
  showUnauthorized = false
}: AdminProtectedRouteProps) {
  const { user, isAuthenticated, loading, initialized } = useAuthStore();

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

  // Check if user has admin role - updated for your User type
  const isAdmin = user?.role?.includes('admin') || 
                  user?.department?.some(dept => 
                    dept.toLowerCase().includes('admin')
                  );

  // If authenticated but not admin
  if (initialized && isAuthenticated && !isAdmin) {
    if (showUnauthorized) {
      // Show 403 Unauthorized page
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-400 mb-4">403</h1>
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">Access Denied</h2>
            <p className="text-gray-500 mb-6">You don't have permission to access this resource.</p>
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
      // Redirect to fallback path
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // If admin, show the protected content
  return <>{children}</>;
}