import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BlurElements } from '../components/shared/BlurElements';
import { Section } from '../components/sections/Section';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Actions } from '../components/actions/Actions';

const ProjectStatus = {
  OVERDUE: 'Overdue',
  COMPLETED: 'Completed',
  PENDING: 'Pending'
};

const SubmissionStatus = {
  NOT_SUBMITTED: 'Not Submitted',
  SUBMITTED: 'Submitted'
};

const FILTERS = {
  PROJECTS: ['all', 'overdue', 'completed', 'pending'],
  TASKS: ['all', 'Not Submitted', 'Submitted']
};

const ProjectsSupervisors = () => {
  const [projects, setProjects] = useState([]);
  const [projectsFilter, setProjectsFilter] = useState('all');
  const [tasksFilter, setTasksFilter] = useState('all');
  const [searchProjects, setSearchProjects] = useState('');
  const [searchTasks, setSearchTasks] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const filterData = useCallback((data, searchTerm, filterKey, filterValue) => {
    return data.filter(item => {
      const matchesSearch = Object.values(item)
        .some(val => typeof val === 'string' && val.toLowerCase().includes(searchTerm.toLowerCase()));

      if (filterValue === 'all') return matchesSearch;
      return matchesSearch && item[filterKey]?.toLowerCase() === filterValue.toLowerCase();
    });
  }, []);

  const filteredProjects = useMemo(() => 
    filterData(projects, searchProjects, 'status', projectsFilter),
    [projects, searchProjects, projectsFilter, filterData]
  );

  const filteredTasks = useMemo(() => 
    filterData(projects, searchTasks, 'gradeStatus', tasksFilter),
    [projects, searchTasks, tasksFilter, filterData]
  );

  const handleNavigateToEvaluationForms = useCallback(() => {
    navigate('/evaluation-forms');
  }, [navigate]);

  const projectColumns = useMemo(() => [
    { key: 'id', header: '#', sortable: true },
    { key: 'title', header: 'Project Title', sortable: true },
    { key: 'students', header: 'Students', render: (value) => value.join(', ') },
    { key: 'part', header: 'Part' },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <StatusBadge value={value} statusType={ProjectStatus} />
      )
    },
    { key: 'deadline', header: 'Deadline', sortable: true },
    {
      key: 'actions',
      header: 'Actions',
      render: () => <Actions onNavigate={handleNavigateToEvaluationForms} />
    }
  ], [handleNavigateToEvaluationForms]);

  const taskColumns = useMemo(() => [
    { key: 'id', header: '#', sortable: true },
    { key: 'title', header: 'Project Title', sortable: true },
    {
      key: 'gradeStatus',
      header: 'Grade Status',
      render: (value) => <StatusBadge value={value} statusType={SubmissionStatus} />
    },
    {
      key: 'feedbackStatus',
      header: 'Feedback Status',
      render: (value) => <StatusBadge value={value} statusType={SubmissionStatus} />
    },
    { key: 'deadline', header: 'Deadline', sortable: true },
    {
      key: 'actions',
      header: 'Actions',
      render: () => <Actions onNavigate={handleNavigateToEvaluationForms} />
    }
  ], [handleNavigateToEvaluationForms]);

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
        <h1 className="text-3xl font-bold mb-6">Projects Dashboard</h1>
        <Section
          title="Projects Supervised"
          description="Projects under your supervision or requiring your evaluation."
          filters={FILTERS.PROJECTS}
          filterState={[projectsFilter, setProjectsFilter]}
          searchState={[searchProjects, setSearchProjects]}
          tableData={filteredProjects}
          tableColumns={projectColumns}
        />

        <Section
          title="Pending Tasks"
          description="Tasks requiring your attention."
          filters={FILTERS.TASKS}
          filterState={[tasksFilter, setTasksFilter]}
          searchState={[searchTasks, setSearchTasks]}
          tableData={filteredTasks}
          tableColumns={taskColumns}
        />
      </div>
    </div>
  );
};

export default ProjectsSupervisors;