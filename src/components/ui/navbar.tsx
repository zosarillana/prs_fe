import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth/authStore";

interface NavbarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Navbar({ sidebarOpen, toggleSidebar }: NavbarProps) {

  const user = useAuthStore((state) => state.user);
 


  return (
    <nav className={`
      bg-white shadow-sm px-6 py-3.5 border-b border-gray-300 flex justify-between items-center sticky top-0 z-40
      transition-all duration-300 ease-in-out
      ${sidebarOpen ? 'ml-64' : 'ml-0'}
    `}>
      <div className="flex items-center">
        {/* Hamburger Menu Button */}
        <button 
          onClick={toggleSidebar}
          className="mr-4 focus:outline-none hover:bg-gray-100 p-1 rounded"
          aria-label="Toggle sidebar"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
        
        {/* <Link to="/" className="flex flex-row gap-2 items-center">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8fssEwyy16ieSoPo_62lEqyx0meFbsagCsg&s"
            alt="MyApp Logo"
            className="h-8 w-auto"
          />
          <p className="text-green-700 font-medium">agrieximfze</p>
        </Link> */}
      </div>

      <div className="space-x-4 flex items-center">
        {user ? (
          <>        
            {/* <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button> */}
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-700 hover:text-blue-600">
              Login
            </Link>
            <Link to="/register" className="text-gray-700 hover:text-blue-600">
              Signup
            </Link>
          </>
        )}
     
      </div>
    </nav>
  );
}