import React from 'react';
import { RiMenu3Line } from "react-icons/ri";

/**
 * This component renders a mobile menu button and the menu content.
 * It toggles the visibility of the menu content based on the `isOpen` state.
 * 
 * Props:
 * - isOpen: Boolean indicating if the menu is open.
 * - setIsOpen: Function to toggle the menu open state.
 * - children: The content to display inside the menu.
 */
const MobileMenu = ({ isOpen, setIsOpen, children }) => {
  return (
    <>
      <button
        className="lg:hidden ml-auto flex items-center"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <RiMenu3Line className="w-6 h-6 cursor-pointer" />
      </button>

      <div className={`lg:flex flex-1 justify-center ${isOpen ? 'block' : 'hidden'} absolute lg:static top-16 left-0 w-full lg:w-auto bg-white lg:bg-transparent`}>
        {children}
      </div>
    </>
  );
};

export default MobileMenu;
