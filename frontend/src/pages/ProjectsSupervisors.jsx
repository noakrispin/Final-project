import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BlurElements } from '../components/shared/BlurElements';
import { Section } from '../components/sections/Section';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Actions } from '../components/actions/Actions';

const ProjectStatus = {
  OVERDUE: 'Overdue',
  COMPLETED: 'Completed',
  PENDING: 'Pending',
};

const SubmissionStatus = {
  NOT_SUBMITTED: 'Not Submitted',
  SUBMITTED: 'Submitted',
};

const FILTERS = {
  PROJECTS: ['all', 'overdue', 'completed', 'pending'],
  TASKS: ['all', 'Not Submitted', 'Submitted'],
};

const ProjectsSupervisors = () => {
  const [projects, setProjects] = useState([]);
  const [studentsMapping, setStudentsMapping] = useState({}); // Map project ID to students
  const [projectsFilter, setProjectsFilter] = useState('all');
  const [tasksFilter, setTasksFilter] = useState('all');
  const [searchProjects, setSearchProjects] = useState('');
  const [searchTasks, setSearchTasks] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchApprovedProjectsAndStudents = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        // Fetch approved projects for the lecturer or co-lecturer
        const projectsResponse = await fetch(
          `http://localhost:3001/api/approved_projects/lecturer/${user.id}`
        );
        if (!projectsResponse.ok) {
          throw new Error('Failed to fetch approved projects.');
        }
        const projectsData = await projectsResponse.json();

        // Fetch student-project mappings for each approved project
        const studentRequests = projectsData.map((project) =>
          fetch(`http://localhost:3001/api/student_projects/${project.id}`)
        );
        const studentResponses = await Promise.all(studentRequests);
        const studentData = await Promise.all(
          studentResponses.map((res) => (res.ok ? res.json() : []))
        );

        // Map project IDs to student names
        const studentsMapping = {};
        projectsData.forEach((project, index) => {
          const students = studentData[index];
          studentsMapping[project.id] = students
            .map((s) => (s.partner_name ? `${s.student_name} & ${s.partner_name}` : s.student_name))
            .filter(Boolean)
            .join(', ');
        });

        setProjects(projectsData);
        setStudentsMapping(studentsMapping);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovedProjectsAndStudents();
  }, [user]);

  const filterData = useCallback((data, searchTerm, filterKey, filterValue) => {
    return data.filter((item) => {
      const matchesSearch = Object.values(item).some(
        (val) => typeof val === 'string' && val.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (filterValue === 'all') return matchesSearch;
      return matchesSearch && item[filterKey]?.toLowerCase() === filterValue.toLowerCase();
    });
  }, []);

  const filteredProjects = useMemo(
    () => filterData(projects, searchProjects, 'status', projectsFilter),
    [projects, searchProjects, projectsFilter, filterData]
  );

  const filteredTasks = useMemo(
    () => filterData(projects, searchTasks, 'grade_status', tasksFilter),
    [projects, searchTasks, tasksFilter, filterData]
  );

  const handleNavigateToEvaluationForms = useCallback(() => {
    navigate('/evaluation-forms');
  }, [navigate]);

  const projectColumns = useMemo(
    () => [
      { key: 'id', header: '#', sortable: true },
      { key: 'title', header: 'Project Title', sortable: true },
      {
        key: 'students',
        header: 'Students',
        render: (value, project) => studentsMapping[project.id] || 'None',
      },
      { key: 'part', header: 'Part' },
      {
        key: 'status',
        header: 'Status',
        render: (value) => <StatusBadge value={value} statusType={ProjectStatus} />,
      },
      { key: 'deadline', header: 'Deadline', sortable: true },
      {
        key: 'actions',
        header: 'Actions',
        render: () => <Actions onNavigate={handleNavigateToEvaluationForms} />,
      },
    ],
    [studentsMapping, handleNavigateToEvaluationForms]
  );

  const taskColumns = useMemo(
    () => [
      { key: 'id', header: '#', sortable: true },
      { key: 'title', header: 'Project Title', sortable: true },
      {
        key: 'grade_status',
        header: 'Grade Status',
        render: (value) => <StatusBadge value={value} statusType={SubmissionStatus} />,
      },
      {
        key: 'feedback_status',
        header: 'Feedback Status',
        render: (value) => <StatusBadge value={value} statusType={SubmissionStatus} />,
      },
      { key: 'deadline', header: 'Deadline', sortable: true },
      {
        key: 'actions',
        header: 'Actions',
        render: () => <Actions onNavigate={handleNavigateToEvaluationForms} />,
      },
    ],
    [handleNavigateToEvaluationForms]
  );

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
