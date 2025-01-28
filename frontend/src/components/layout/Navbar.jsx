import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { projectsApi } from "../../services/projectsAPI";
import { assets } from "../../assets/assets";
import UserMenu from "./UserMenu";
import MobileMenu from "../shared/MobileMenu";
import SearchBar from "../shared/SearchBar";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);


  console.log("Navbar received user:", user); // Debugging log

  // Close the menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  }, [location.pathname]); // Close menu on route change


  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const projects = await projectsApi.getAllProjects();

        const filteredResults = projects
          .filter((project) =>
            [project.title, project.description, project.supervisor, project.projectCode]
              .join(" ")
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
          .slice(0, 5); // Limit to 5 results for performance

        setSearchResults(filteredResults);
        setShowResults(true);
      } catch (error) {
        console.error("Error fetching projects:", error.message);
        setSearchResults([]);
        setShowResults(false);
      }
    };

    fetchResults();
  }, [searchQuery]); // Trigger search whenever searchQuery changes

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleResultClick = (projectCode) => {
    console.log("Navigating to project code:", projectCode);
    navigate(`/project/${projectCode}`); // Navigate to the project details page
    setSearchQuery(""); // Clear the search query
    setSearchResults([]); // Clear the search results
    setShowResults(false); // Close the dropdown
    setMenuOpen(false); // Close the mobile menu
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center h-16 px-4 max-w-[1400px] mx-auto">
        <div className="flex-none">
          <Link to="/profile">
            <img
              className="w-40 cursor-pointer"
              src={assets.logo}
              alt="ProjectHub Logo"
            />
          </Link>
        </div>

        <MobileMenu isOpen={menuOpen} setIsOpen={setMenuOpen}>
          <ul className="flex flex-col lg:flex-row items-center gap-2 lg:gap-12 font-medium text-gray-800 text-sm">
            <NavLink 
            to="/projectsSupervisors"
            onClick={() => setMenuOpen(false)} >
              MY PROJECTS
              </NavLink>
            <NavLink
              to="/MyProjectsReview"
              activePaths={["/MyProjectsReview", "/OtherProjectsReview"]}
              onClick={() => setMenuOpen(false)}>
              PROJECTS TO REVIEW
            </NavLink>
            <NavLink 
            to="/SupervisorGradesFeedback"
            onClick={() => setMenuOpen(false)}>
              GRADES
            </NavLink> 
          </ul>
        </MobileMenu>

        <div className="flex items-center gap-4 ml-auto mr-4">
          <div className="relative hidden lg:block">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange} // Update search query
              placeholder="Search Projects..."
            />

            {showResults && searchResults.length > 0 ? (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-[300px] overflow-y-auto">
                {searchResults.map((result) => (
                  <div
                    key={result.projectCode} // Use projectCode as the key
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-none transition-colors"
                    onClick={() => handleResultClick(result.projectCode)} // Navigate to projectCode
                  >
                    <p className="font-medium text-gray-900">{result.title}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{result.supervisor}</p>
                  </div>
                ))}
              </div>
            ) : (
              searchQuery.trim() && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-4 text-gray-500">
                  No results found
                </div>
              )
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

const NavLink = ({ to, children, activePaths = [] }) => {
  const location = useLocation();
  const isActive = activePaths.includes(location.pathname) || location.pathname === to;

  return (
    <Link
      to={to}
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


export default Navbar;
