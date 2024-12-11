import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaCircleUser } from "react-icons/fa6";
import { RiArrowDropDownLine, RiMenu3Line } from "react-icons/ri";
import { FiSearch } from "react-icons/fi";
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext'; // Import AuthContext
import projectsData from '../../data/projects.json';
import { assets } from '../../assets/assets';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const { user, logout } = useAuth(); // Get user and logout from AuthContext

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const filteredResults = projectsData.filter(project =>
      project.title.toLowerCase().includes(query.toLowerCase()) ||
      project.description.toLowerCase().includes(query.toLowerCase()) ||
      project.supervisor.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filteredResults);
    setShowResults(true);
  };

  const handleResultClick = (projectId) => {
    navigate(`/project/${projectId}`);
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex justify-between items-center py-3 px-4 max-w-full mx-auto">
        <div className="flex items-center gap-2 flex-none">
          <Link to="/">
            <img
              className='w-32 cursor-pointer'
              src={assets.logo}
              alt="ProjectHub Logo"
            />
          </Link>
        </div>
        <button
          className="lg:hidden flex items-center gap-4"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <RiMenu3Line className="w-6 h-6 cursor-pointer" />
        </button>
        <ul className={`lg:flex gap-6 font-medium text-gray-800 text-xs lg:text-sm ${menuOpen ? 'block' : 'hidden'} absolute lg:static top-12 left-0 w-full lg:w-auto bg-white lg:bg-transparent flex-col lg:flex-row`}>
          <NavLink to='/'>HOME</NavLink>
          <NavLink to='/projectsSupervisors'>PROJECTS</NavLink>
          <NavLink to='/supervisorsStatus'>STATUS</NavLink>
          <NavLink to='/evaluation-forms'>FEEDBACK</NavLink>
          <NavLink to='/contact'>CONTACT</NavLink>
        </ul>
        <div className='flex items-center gap-4 flex-none'>
          <div className="relative hidden lg:block">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearch}
              className="pl-8 pr-3 py-1 w-36 bg-[#ECEDF5] rounded-md text-sm text-gray-600 placeholder:text-gray-500 border"
              aria-label="Search projects"
            />
            <FiSearch className="absolute left-2 top-2 text-gray-500 w-4 h-4" aria-hidden="true" />
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                {searchResults.map(result => (
                  <div
                    key={result.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleResultClick(result.id)}
                  >
                    <p className="font-medium">{result.title}</p>
                    <p className="text-sm text-gray-600">{result.supervisor}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {user ? (
            <div
              className='flex items-center gap-2 cursor-pointer relative'
              onClick={() => setDropdownOpen(!dropdownOpen)}
              ref={dropdownRef}
            >
              <FaCircleUser className='w-6 h-6 rounded-full' aria-hidden="true" />
              <RiArrowDropDownLine className="w-6 h-6" aria-hidden="true" />
              {dropdownOpen && (
                <div className='absolute top-10 right-0 pt-2 text-sm font-medium text-gray-600 z-20 bg-stone-50 py-2 space-y-1 rounded-md shadow-md'>
                  <button onClick={() => navigate('/profile')} className="hover:bg-gray-200 cursor-pointer px-4 py-2 w-full text-left">My Profile</button>
                  <button onClick={() => navigate('/supervisorsStatus')} className="hover:bg-gray-200 cursor-pointer px-4 py-2 w-full text-left">My Status</button>
                  <button onClick={logout} className="hover:bg-gray-200 cursor-pointer px-4 py-2 w-full text-left">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Button
              onClick={() => navigate('/signUp')}
              className='bg-primary text-white px-4 py-2 rounded-full text-sm'
            >
              Log In
            </Button>
          )}
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
      className={`${isActive ? 'text-primary border-b-2 border-primary' : 'hover:text-primary'}`}
    >
      <li className='py-2 px-4 lg:py-1'>{children}</li>
    </Link>
  );
};

export default Navbar;
