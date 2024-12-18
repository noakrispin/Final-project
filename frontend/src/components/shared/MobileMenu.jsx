import React from 'react';
import { RiMenu3Line } from "react-icons/ri";

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

