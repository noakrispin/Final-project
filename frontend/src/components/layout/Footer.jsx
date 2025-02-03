import React from "react";
import { FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white text-gray-600 border-t border-gray-300 py-6 mt-10">
      <div className="max-w-6xl mx-auto text-center px-4">
        {/* Project Description */}
        <p className="text-lg font-medium">
          This platform was developed as part of our{" "}
          <span className="text-primary font-semibold">Final Project</span>{" "}
          in the <span className="font-semibold">Information Systems Engineering</span> program.
        </p>
        <p className="text-gray-700 mt-1">
          Supervised by <span className="text-primary font-semibold">Julia Sheidin</span>.
        </p>

        {/* Names and LinkedIn Links */}
        <div className="flex justify-center gap-8 mt-4">
          <a
            href="https://www.linkedin.com/in/noy-malka-808b29245/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-700 hover:text-primary transition"
          >
            <FaLinkedin className="text-lg text-blue-600" /> <span className="text-base">Noy Malka</span>
          </a>
          <a
            href="https://www.linkedin.com/in/noa-krispin-b4a9b4239/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-700 hover:text-primary transition"
          >
            <FaLinkedin className="text-lg text-blue-600" /> <span className="text-base">Noa Krispin</span>
          </a>
        </div>

        {/* Copyright Info */}
        <p className="mt-4 text-sm text-gray-500">
          © 2025 <span className="text-primary font-medium">ProjectHUB</span>. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
