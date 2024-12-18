import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import projectsData from '../../data/projects.json';
import { assets } from '../../assets/assets';
import UserMenu from './UserMenu';
import SearchBar from '../shared/SearchBar';
import MobileMenu from '../shared/MobileMenu';
import { FiSearch } from 'react-icons/fi';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false); // Added state for showing search results

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
      project.description?.toLowerCase().includes(query.toLowerCase()) ||
      project.supervisor?.toLowerCase().includes(query.toLowerCase()) ||
      project.projectCode?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5); // Limit to 5 results for better UX
    setSearchResults(filteredResults);
    setShowResults(true);
  };

  const handleResultClick = (resultId) => {
    // Implement result click logic here, using resultId
    console.log("Selected Result ID:", resultId);
    //Example: Find the project by ID and navigate to its page.
    const selectedProject = projectsData.find(project => project.id === resultId);
    if(selectedProject){
      navigate(`/project/${selectedProject.id}`);
    }
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

        <MobileMenu isOpen={menuOpen} setIsOpen={setMenuOpen}>
          <ul className="flex flex-col lg:flex-row items-center gap-2 lg:gap-12 font-medium text-gray-800 text-sm">
            <NavLink to='/projectsSupervisors'>MY PROJECTS</NavLink>
            <NavLink to='/ProjectToReview'>PROJECTS TO REVIEW</NavLink>
            <NavLink to='/evaluation-forms'>GRADES</NavLink>
            <NavLink to='/contact'>CONTACT</NavLink>
          </ul>
        </MobileMenu>

        <div className="flex items-center gap-4 ml-auto mr-4">
          <div className="relative hidden lg:block">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-8 pr-3 py-2 w-56 bg-[#F4F4F8] rounded-md text-sm text-gray-600 placeholder:text-gray-500 border-none focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all"
              aria-label="Search projects"
            />
            <FiSearch className="absolute left-2 top-2.5 text-gray-500 w-4 h-4" aria-hidden="true" />
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

