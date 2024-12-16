import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BlurElements } from '../components/shared/BlurElements';
import { Section } from '../components/sections/Section';
import { Actions } from '../components/actions/Actions';
import { ProjectDetailsDialog } from '../components/shared/ProjectDetailsDialog';
import { Button } from '../components/ui/Button';

// Remove Project Code from filters
const FILTERS = ['All', 'Part A', 'Part B'];

const ProjectsSupervisors = () => {
  const [projects, setProjects] = useState([]);
  const [projectsFilter, setProjectsFilter] = useState('All');
  const [searchProjects, setSearchProjects] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const projectsData = await api.getProjects();
        const filteredProjects = projectsData.filter(project => 
          project.supervisor === user.fullName || 
          (project.presentationAttendees && project.presentationAttendees.includes(user.fullName))
        );
        setProjects(filteredProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to fetch projects. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const filterData = useCallback((data, searchTerm, filterValue) => {
    return data.filter(item => {
      const matchesSearch = Object.values(item)
        .some(val => typeof val === 'string' && val.toLowerCase().includes(searchTerm.toLowerCase()));

      if (filterValue === 'All') return matchesSearch;
      return matchesSearch && item.part === filterValue.split(' ')[1];
    });
  }, []);

  const filteredProjects = useMemo(() => 
    filterData(projects, searchProjects, projectsFilter),
    [projects, searchProjects, projectsFilter, filterData]
  );

  const handleNavigateToEvaluationForms = useCallback((projectId) => {
    navigate(`/evaluation-forms/${projectId}`);
  }, [navigate]);

  const handleProjectClick = useCallback((project) => {
    setSelectedProject(project);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setSelectedProject(null);
  }, []);

  const projectColumns = useMemo(() => [
    { 
      key: 'id', 
      header: '#', 
      sortable: true,
      className: 'text-base'
    },
    { 
      key: 'title', 
      header: 'Project Title', 
      sortable: true,
      render: (value, project) => (
        <Button
          variant="link"
          className="p-0 h-auto font-normal text-left hover:underline text-[#686b80] text-base"
          onClick={() => handleProjectClick(project)}
        >
          {value}
        </Button>
      )
    },
    { 
      key: 'students', 
      header: 'Students',
      className: 'text-base',
      render: (students) => (
        <span className="text-base">
          {students.map(student => student.name).join(', ')}
        </span>
      )
    },
    { 
      key: 'projectCode', 
      header: 'Project Code',
      className: 'text-base',
      sortable: true 
    },
    { 
      key: 'specialNotes', 
      header: 'Special Notes',
      className: 'text-base'
    },
    { 
      key: 'deadline', 
      header: 'Deadline',
      className: 'text-base',
      sortable: true 
    },
  ], [handleProjectClick, handleNavigateToEvaluationForms]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="relative bg-white min-h-screen overflow-hidden">
      <BlurElements />

      <div className="relative z-10 p-4 md:p-6">
        <Section
          title={`My Projects - ${user?.fullName}`}
          description="Here are all the projects currently under your supervision, categorized for easy tracking and management."
          filters={FILTERS}
          filterState={[projectsFilter, setProjectsFilter]}
          searchState={[searchProjects, setSearchProjects]}
          tableData={filteredProjects}
          tableColumns={projectColumns}
        />
        
        <ProjectDetailsDialog
          isOpen={selectedProject !== null}
          onClose={handleCloseDialog}
          project={selectedProject}
        />
      </div>
    </div>
  );
};

export default ProjectsSupervisors;
