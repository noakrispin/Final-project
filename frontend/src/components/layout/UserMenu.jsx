import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCircleUser } from "react-icons/fa6";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useAuth } from '../../context/AuthContext';

const UserMenu = ({ customActions = [] }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
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
    <div
      className="flex items-center gap-2 cursor-pointer relative"
      onClick={() => setDropdownOpen(!dropdownOpen)}
      ref={dropdownRef}
    >
      <FaCircleUser className="w-6 h-6 rounded-full" aria-hidden="true" />
      <RiArrowDropDownLine className="w-6 h-6" aria-hidden="true" />
      {dropdownOpen && (
        <div className='absolute top-full right-0 mt-2 text-sm font-medium text-gray-600 z-20 bg-white py-2 rounded-md shadow-md border border-gray-100 w-64'>
          <button onClick={() => navigate('/profile')} className="hover:bg-gray-50 cursor-pointer px-4 py-2 w-full text-left">
            My Profile
          </button>
          {user.role === 'Admin' && !customActions.length && (
            <button onClick={() => navigate('/admin-projects')} className="hover:bg-gray-50 cursor-pointer px-4 py-2 w-full text-left">
              Admin Dashboard
            </button>
          )}
          {customActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="hover:bg-gray-50 cursor-pointer px-4 py-2 w-full text-left"
            >
              {action.label}
            </button>
          ))}
          <button onClick={logout} className="hover:bg-gray-50 cursor-pointer px-4 py-2 w-full text-left">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;

