import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth/authStore";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string; // Where to redirect non-admin users
  showUnauthorized?: boolean; // Show 403 page instead of redirecting
}

export default function AdminProtectedRoute({ 
  children, 
  fallbackPath = "/prs/dashboard",
  showUnauthorized = false
}: AdminProtectedRouteProps) {
  const { user, isAuthenticated, loading, initialized } = useAuthStore();

  // Show loading while auth is being initialized (only happens once)
  if (!initialized && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative">
            {/* Animated ring */}
            <div className="w-20 h-20 rounded-full border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
            
            {/* Inner dot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-3 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <p className="mt-4 text-base text-gray-600 dark:text-gray-300 font-medium">
            Verifying access
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please wait a moment
          </p>
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
      // Show 403 Unauthorized page with the same styling as NotFound
      return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 px-6">
          <div className="max-w-4xl w-full text-center py-16">
            <div className="flex flex-col-reverse md:flex-row items-center gap-10 md:gap-16">
              {/* Illustration - Lock/Shield SVG */}
              <figure className="flex-1 flex justify-center animate-[float_6s_ease-in-out_infinite]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 800 600"
                  className="w-full max-w-md"
                >
                  <g fill="none" fillRule="evenodd">
                    <circle cx="400" cy="300" r="280" fill="#EEF2FF" className="dark:opacity-20" />
                    
                    {/* Shield shape */}
                    <path
                      d="M400 120 L500 180 L500 320 C500 420 400 480 400 480 C400 480 300 420 300 320 L300 180 L400 120Z"
                      fill="#4F46E5"
                      opacity="0.1"
                    />
                    
                    {/* Lock body */}
                    <rect x="350" y="290" width="100" height="70" rx="10" fill="#4F46E5" opacity="0.2" />
                    
                    {/* Lock shackle */}
                    <path
                      d="M360 290 L360 250 C360 230 380 210 400 210 C420 210 440 230 440 250 L440 290"
                      stroke="#4F46E5"
                      strokeWidth="12"
                      strokeLinecap="round"
                      opacity="0.3"
                    />
                    
                    {/* Keyhole */}
                    <circle cx="400" cy="325" r="8" fill="#4F46E5" opacity="0.3" />
                    
                    {/* 403 text in background */}
                    <text
                      x="400"
                      y="380"
                      textAnchor="middle"
                      fontSize="80"
                      fontWeight="800"
                      fill="#4F46E5"
                      opacity="0.1"
                    >
                      403
                    </text>
                    
                    {/* Small decorative elements */}
                    <circle cx="340" cy="400" r="6" fill="#6366F1" opacity="0.4" />
                    <circle cx="460" cy="400" r="6" fill="#6366F1" opacity="0.4" />
                  </g>
                </svg>
              </figure>

              {/* Content */}
              <div className="flex-1 text-left md:text-left">
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                  Access Restricted
                </p>
                <h1 className="mt-3 text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
                  403 — Access Denied
                </h1>
                <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-prose">
                  You don't have permission to access this resource. This area is restricted to administrators only.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button 
                    onClick={() => window.history.back()}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Go Back
                  </button>
                  
                  <a
                    href="/prs/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium border border-gray-300 dark:border-gray-600 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 transition-colors duration-200"
                  >
                    Go to Dashboard
                  </a>
                </div>

                <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                  <p>Need access? Contact your system administrator to request the appropriate permissions.</p>
                </div>
              </div>
            </div>

            <footer className="mt-12 text-center text-xs text-gray-400">
              © {new Date().getFullYear()} agrieximfze
            </footer>
          </div>

          {/* Floating animation */}
          <style>{`
            @keyframes float { 
              0% { transform: translateY(0px) } 
              50% { transform: translateY(-8px) } 
              100% { transform: translateY(0px) } 
            }
            .animate-[float_6s_ease-in-out_infinite] { 
              animation: float 6s ease-in-out infinite 
            }
          `}</style>
        </main>
      );
    } else {
      // Redirect to fallback path
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // If admin, show the protected content
  return <>{children}</>;
}