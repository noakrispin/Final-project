import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '../ui/Card';

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
    <Card className="bg-white shadow-sm">
      <div className="px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Total Projects</h2>
        <p className="text-3xl font-bold text-primary mt-1">{filteredCount}</p>
      </div>
    </Card>
  );
};

ProjectStats.propTypes = {
  projects: PropTypes.array.isRequired,
  activeTab: PropTypes.string.isRequired
};

export default ProjectStats;

