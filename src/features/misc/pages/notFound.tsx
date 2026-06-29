import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth/authStore";

export default function NotFound() {
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = !!user; // true if user object exists

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 px-6">
      <div className="max-w-4xl w-full text-center py-16">
        <div className="flex flex-col-reverse md:flex-row items-center gap-10 md:gap-16">
          {/* Illustration */}
          <figure className="flex-1 flex justify-center animate-[float_6s_ease-in-out_infinite]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 800 600"
              className="w-full max-w-md"
            >
              <g fill="none" fillRule="evenodd">
                <circle cx="400" cy="300" r="280" fill="#EEF2FF" />
                <text
                  x="400"
                  y="320"
                  textAnchor="middle"
                  fontSize="180"
                  fontWeight="800"
                  fill="#4F46E5"
                  opacity="0.1"
                >
                  404
                </text>
                <path
                  d="M200 400c50-80 120-140 200-140s150 60 200 140"
                  stroke="#4F46E5"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.2"
                />
                <circle cx="260" cy="380" r="10" fill="#6366F1" />
                <circle cx="540" cy="380" r="10" fill="#6366F1" />
                <path
                  d="M350 380a50 30 0 0 0 100 0"
                  stroke="#6366F1"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </g>
            </svg>
          </figure>

          {/* Content */}
          <div className="flex-1 text-left md:text-left">
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
              Error
            </p>
            <h1 className="mt-3 text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
              404 — Page not found
            </h1>
            <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-prose">
              Oops — the page you were trying to reach doesn't exist or has been moved.
              If you followed a link, it might be out of date.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {isLoggedIn ? (
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400"
                >
                  Login
                </Link>
              )}
            </div>

            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
              <p>Tip: try searching from the main page or check the URL for typos.</p>
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
}
