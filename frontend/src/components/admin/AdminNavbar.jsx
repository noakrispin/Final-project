import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaCircleUser } from "react-icons/fa6";
import { useAuth } from '../../context/AuthContext';
import { assets } from '../../assets/assets';
import MobileMenu from '../shared/MobileMenu';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

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
            <NavLink to='/admin-projects'>PROJECTS</NavLink>
            <NavLink to='/admin-reminders'>REMINDERS</NavLink>
            <NavLink to='/admin-grades'>GRADES</NavLink>
            <NavLink
              to="/admin-upload"
              activePaths={["/admin-upload", "/admin-evaluators"]}
            >
              UPLOAD FILES
            </NavLink>
            <NavLink
              to="/admin-management"
              activePaths={["/admin-management", "/admin-forms"]}
            >
              MANAGEMENT
            </NavLink>
          </ul>
        </MobileMenu>

        {/* Buttons in Navbar */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Switch to Supervisor Mode Button */}
          <button
            onClick={() => navigate('/profile')}
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-medium py-1.5 px-4 rounded-lg shadow-sm hover:shadow-md transition duration-200"
          >
            Supervisor Mode
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-700 text-white font-medium py-1.5 px-4 rounded-lg shadow-sm hover:shadow-md transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children, activePaths = [] }) => {
  const location = useLocation();
  const isActive = activePaths.includes(location.pathname) || location.pathname === to;

  return (
    <Link
      to={to}
      className={`${
        isActive
          ? 'text-[#6366F1] border-b-2 border-[#6366F1]'
          : 'hover:text-[#6366F1]'
      } py-2 px-4 lg:py-1 text-base`}
    >
      <li>{children}</li>
    </Link>
  );
};

export default AdminNavbar;
