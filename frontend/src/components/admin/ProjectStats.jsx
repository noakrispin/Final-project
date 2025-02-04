/**
 * This component displays the total number of projects based on the active tab.
 * 
 * Props:
 * - projects: Array of project objects.
 * - activeTab: The currently active tab.
 */
import React from 'react';
import PropTypes from 'prop-types';

const ProjectStats = ({ projects, activeTab }) => {
  const filteredCount = projects.filter(project => {
    switch(activeTab) {
      case 'All Projects':
        return true;
      case 'Part A':
        return project.part === 'A';
      case 'Part B':
        return project.part === 'B';
      default:
        return true;
    }
  }).length;

  return (
    <div className="bg-blue-50 rounded-lg p-8 text-center">
      <span className="text-4xl font-bold text-blue-600 block mb-2">
        {filteredCount}
      </span>
      <span className="text-gray-600 text-lg">
        {activeTab === 'All Projects' 
          ? 'Total Projects' 
          : `Total Projects ${activeTab}`}
      </span>
    </div>
  );
};

ProjectStats.propTypes = {
  projects: PropTypes.array.isRequired,
  activeTab: PropTypes.string.isRequired
};

export default ProjectStats;
