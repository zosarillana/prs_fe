import React from "react";
import { Link, useNavigate } from "react-router-dom";

// 404 Not Found component optimized for a Vite + React + Tailwind project
// Default export so you can `import NotFound from './NotFound.jsx'`

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 px-6">
      <div className="max-w-4xl w-full text-center py-16">
        <div className="flex flex-col-reverse md:flex-row items-center gap-10 md:gap-16">
          {/* Illustration */}
          <figure className="flex-1">
            <svg
              viewBox="0 0 600 400"
              className="w-full max-w-md mx-auto"
              role="img"
              aria-labelledby="notFoundTitle notFoundDesc"
            >
              <title id="notFoundTitle">404: Page not found</title>
              <desc id="notFoundDesc">A friendly robot looking puzzled next to a broken link illustration.</desc>

              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="10" stdDeviation="20" floodOpacity="0.12" />
                </filter>
              </defs>

              <g filter="url(#shadow)">
                <rect x="60" y="60" width="480" height="240" rx="20" fill="url(#g1)" opacity="0.12" />
              </g>

              <g transform="translate(120,60)">
                <g className="animate-[float_6s_ease-in-out_infinite]">
                  <circle cx="120" cy="120" r="70" fill="#e6f0ff" />
                  <rect x="85" y="40" width="70" height="60" rx="10" fill="#fff" stroke="#cbd5e1" />
                  <circle cx="120" cy="120" r="10" fill="#111827" />
                  <path d="M60 180c30-30 90-30 120 0" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" fill="none" />
                </g>

                <g transform="translate(270,40)">
                  <path d="M40 0 L80 32 L48 96 L0 72 Z" fill="#fef3c7" stroke="#f59e0b" />
                </g>
              </g>

            </svg>
          </figure>

          {/* Content */}
          <div className="flex-1 text-left md:text-left">
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Error</p>
            <h1 className="mt-3 text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
              404 — Page not found
            </h1>
            <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-prose">
              Oops — the page you were trying to reach doesn't exist or has been moved. If you followed a link,
              it might be out of date.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400"
              >
                Take me home
              </Link>

              {/* <Link
                to="/help"
                className="ml-1 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-transparent bg-transparent text-sm text-indigo-600 hover:underline"
              >
                Help & support
              </Link> */}
            </div>

            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
              <p>Tip: try searching from the main page or check the URL for typos.</p>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-xs text-gray-400">© {new Date().getFullYear()} agrieximfze</footer>
      </div>

      {/* small inline styles for the subtle floating animation (Tailwind JIT-friendly) */}
      <style>{`
        @keyframes float { 0% { transform: translateY(0px) } 50% { transform: translateY(-8px) } 100% { transform: translateY(0px) } }
        .animate-\[float_6s_ease-in-out_infinite\] { animation: float 6s ease-in-out infinite }
      `}</style>
    </main>
  );
}
