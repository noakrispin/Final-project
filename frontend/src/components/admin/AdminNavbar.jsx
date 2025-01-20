import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaCircleUser } from "react-icons/fa6";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useAuth } from '../../context/AuthContext';
import { assets } from '../../assets/assets';
import MobileMenu from '../shared/MobileMenu';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center h-16 px-4 max-w-[1400px] mx-auto">
        <div className="flex-none">
          <Link to="/admin-dashboard">
            <img
              className="w-40 cursor-pointer"
              src={assets.logo}
              alt="Admin Dashboard"
            />
          </Link>
        </div>

        <MobileMenu isOpen={menuOpen} setIsOpen={setMenuOpen}>
          <ul className="flex flex-col lg:flex-row items-center gap-2 lg:gap-12 font-medium text-sm">
            <NavLink to='/admin-projects'>PROJECTS</NavLink>
            <NavLink to='/admin-reminders'>REMINDERS</NavLink>
            <NavLink to='/admin-grades'>GRADES</NavLink>
            <NavLink to='/admin-upload'>UPLOAD FILES</NavLink>
            <NavLink to='/admin-management'>MANAGEMENT</NavLink>
          </ul>
        </MobileMenu>

        <div className="flex items-center gap-4 ml-auto">
          <div
            className="flex items-center gap-2 cursor-pointer relative"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            ref={dropdownRef}
          >
            <FaCircleUser className="w-6 h-6 rounded-full" aria-hidden="true" />
            <RiArrowDropDownLine className="w-6 h-6" aria-hidden="true" />
            {dropdownOpen && (
              <div className='absolute top-full right-0 mt-2 text-sm font-medium text-gray-600 z-20 bg-white py-2 rounded-md shadow-md border border-gray-100 w-64'>
                <button 
                  onClick={() => navigate('/projectsSupervisors')} 
                  className="hover:bg-gray-50 cursor-pointer px-4 py-2 w-full text-left"
                >
                  Switch to Supervisor Mode
                </button>
                <button 
                  onClick={logout} 
                  className="hover:bg-gray-50 cursor-pointer px-4 py-2 w-full text-left"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`${isActive ? 'text-[#6366F1] border-b-2 border-[#6366F1]' : 'hover:text-[#6366F1]'} py-2 px-4 lg:py-1 text-base`}
    >
      <li>{children}</li>
    </Link>
  );
};

export default AdminNavbar;
