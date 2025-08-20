import { useState, ReactNode } from "react";
import Navbar from "../ui/navbar";
import Sidebar from "../ui/sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <main className={`
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'ml-64' : 'ml-0'}
        pt-4
      `}>
        <div className="px-6 py-4">
          {children}
        </div>
      </main>
    </div>
  );
}