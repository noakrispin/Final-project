import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RiMenu3Line } from "react-icons/ri";
import { FiSearch } from "react-icons/fi";
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import projectsData from '../../data/projects.json';
import { assets } from '../../assets/assets';
import UserMenu from './UserMenu';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const { user } = useAuth();

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
      <div className="flex items-center h-16 px-4 max-w-[1400px] mx-auto">
        <div className="flex-none">
          <Link to="/">
            <img
              className="w-40 cursor-pointer"
              src={assets.logo}
              alt="ProjectHub Logo"
            />
          </Link>
        </div>
        
        <button
          className="lg:hidden ml-auto flex items-center"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <RiMenu3Line className="w-6 h-6 cursor-pointer" />
        </button>

        <div className={`lg:flex flex-1 justify-center ${menuOpen ? 'block' : 'hidden'} absolute lg:static top-16 left-0 w-full lg:w-auto bg-white lg:bg-transparent`}>
          <ul className="flex flex-col lg:flex-row items-center gap-2 lg:gap-12 font-medium text-gray-800 text-sm">
            <NavLink to='/projectsSupervisors'>MY PROJECTS</NavLink>
            <NavLink to='/supervisorsStatus'>PROJECTS FOR REVIEW</NavLink>
            <NavLink to='/evaluation-forms'>GRADES</NavLink>
            <NavLink to='/contact'>CONTACT</NavLink>
          </ul>
        </div>

        <div className="flex items-center gap-4 ml-auto mr-4">
          <div className="relative hidden lg:block">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearch}
              className="pl-8 pr-3 py-1.5 w-48 bg-[#F4F4F8] rounded-md text-sm text-gray-600 placeholder:text-gray-500 border-none"
              aria-label="Search projects"
            />
            <FiSearch className="absolute left-2 top-2.5 text-gray-500 w-4 h-4" aria-hidden="true" />
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
            <UserMenu />
          ) : (
            <Button
              onClick={() => navigate('/signUp')}
              className="bg-[#6366F1] hover:bg-[#5558E1] text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Create account
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
      className={`${isActive ? 'text-[#6366F1] border-b-2 border-[#6366F1]' : 'hover:text-[#6366F1]'} py-2 px-4 lg:py-1 text-base`}
    >
      <li>{children}</li>
    </Link>
  );
};

export default Navbar;

