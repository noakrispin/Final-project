import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import projectsData from '../../data/projects.json';
import { assets } from '../../assets/assets';
import UserMenu from './UserMenu';
import SearchBar from '../shared/SearchBar';
import MobileMenu from '../shared/MobileMenu';


const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  console.log("Navbar received user:", user); // Debugging log

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const filteredResults = projectsData.filter(project =>
      project.title.toLowerCase().includes(query.toLowerCase()) ||
      project.description?.toLowerCase().includes(query.toLowerCase()) ||
      project.supervisor?.toLowerCase().includes(query.toLowerCase()) ||
      project.projectCode?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5); // Limit to 5 results for better UX
    setSearchResults(filteredResults);
    setShowResults(true);
  };

  const handleResultClick = (resultId) => {
    const selectedProject = projectsData.find(project => project.id === resultId);
    if (selectedProject) {
      navigate(`/project/${selectedProject.id}`);
      setShowResults(false); // Close the results window
    }
  };

  console.log("Navbar received user:", user); // Add this to confirm reactivity
  
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

        <MobileMenu isOpen={menuOpen} setIsOpen={setMenuOpen}>
          <ul className="flex flex-col lg:flex-row items-center gap-2 lg:gap-12 font-medium text-gray-800 text-sm">
            <NavLink to='/projectsSupervisors'>MY PROJECTS</NavLink>
            <NavLink to='/MyProjectsReview'>PROJECTS TO REVIEW</NavLink>
            <NavLink to='/SupervisorGradesFeedback'>GRADES</NavLink>
            <NavLink to='/contact'>CONTACT</NavLink>
          </ul>
        </MobileMenu>

        <div className="flex items-center gap-4 ml-auto mr-4">
          <div className="relative hidden lg:block">
            <SearchBar
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search"
            />
            
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-[300px] overflow-y-auto">
                {searchResults.map(result => (
                  <div
                    key={result.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-none transition-colors"
                    onClick={() => handleResultClick(result.id)}
                  >
                    <p className="font-medium text-gray-900">{result.title}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{result.supervisor}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {user ? (
            <UserMenu user={user} logout={logout} />
            ) : (
            <Button
              onClick={() => navigate('/login')}
              className="bg-[#6366F1] hover:bg-[#5558E1] text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Login
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
