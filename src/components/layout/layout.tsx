import { useState, ReactNode } from "react";
import Navbar from "../ui/navbar";
import Sidebar from "../ui/sidebar/sidebar";

interface LayoutProps {
  children: ReactNode;
  can: (moduleId: number) => boolean;
}

export default function Layout({ children, can }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen">
      <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Sidebar receives `can` */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} can={can} />

      <main
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-64" : "ml-0"
        } pt-4`}
      >
        <div className="px-6 py-4">{children}</div>
      </main>
    </div>
  );
}
