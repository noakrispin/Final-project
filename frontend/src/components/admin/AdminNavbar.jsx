import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { assets } from "../../assets/assets";
import MobileMenu from "../shared/MobileMenu";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center h-16 px-4 max-w-[1400px] mx-auto">
        {/* Logo */}
        <div className="flex-none">
          <Link to="/admin-projects">
            <img
              className="w-40 cursor-pointer"
              src={assets.logo}
              alt="Admin Dashboard"
            />
          </Link>
        </div>

        {/* Mobile Menu */}
        <MobileMenu isOpen={menuOpen} setIsOpen={setMenuOpen}>
          <ul className="flex flex-col lg:flex-row items-center gap-2 lg:gap-12 font-medium text-sm">
            <NavLink to="/admin-projects" onClick={() => setMenuOpen(false)}>
              PROJECTS
            </NavLink>
            <NavLink to="/admin-reminders" onClick={() => setMenuOpen(false)}>
              REMINDERS
            </NavLink>
            <NavLink to="/admin-grades" onClick={() => setMenuOpen(false)}>
              GRADES
            </NavLink>
            <NavLink
              to="/admin-upload"
              activePaths={["/admin-upload", "/admin-evaluators"]}
              onClick={() => setMenuOpen(false)}
            >
              UPLOAD FILES
            </NavLink>
            <NavLink
              to="/admin-management"
              activePaths={["/admin-management", "/admin-forms"]}
              onClick={() => setMenuOpen(false)}
            >
              MANAGEMENT
            </NavLink>
          </ul>
        </MobileMenu>

{/* Buttons in Navbar */}
<div className="flex items-center gap-2 sm:gap-4 ml-auto">
  {/* Switch to Supervisor Mode Button */}
  <button
    onClick={() => navigate("/profile")}
    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-medium py-1 px-2 sm:px-4 rounded-md shadow-sm hover:shadow-md transition duration-200 text-sm sm:text-base"
  >
    Supervisor Mode
  </button>

  {/* Logout Button */}
  <button
    onClick={logout}
    className="bg-red-500 hover:bg-red-700 text-white font-medium py-1 px-2 sm:px-4 rounded-md shadow-sm hover:shadow-md transition duration-200 text-sm sm:text-base"
  >
    Logout
  </button>
</div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children, activePaths = [], onClick }) => {
  const location = useLocation();
  const isActive = activePaths.includes(location.pathname) || location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick} // Close menu on click
      className={`${
        isActive
          ? "text-[#6366F1] border-b-2 border-[#6366F1]"
          : "hover:text-[#6366F1]"
      } py-2 px-4 lg:py-1 text-base`}
    >
      <li>{children}</li>
    </Link>
  );
};

export default AdminNavbar;
