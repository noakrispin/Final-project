import React, { useState, useEffect } from 'react';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Check, X, Search, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Calendar } from '../components/ui/Calendar';
import { TaskList } from '../components/data-display/TaskList';
import { ProgressBar } from '../components/ui/ProgressBar';

const SupervisorsStatus = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch projects and tasks data from the database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsResponse, tasksResponse] = await Promise.all([
          fetch(`http://localhost:3001/api/all_projects/lecturer/${user.id}`),
          fetch('http://localhost:3001/api/tasks'),
        ]);

        if (!projectsResponse.ok || !tasksResponse.ok) {
          throw new Error('Failed to fetch data from the server');
        }

        const [projectsData, tasksData] = await Promise.all([
          projectsResponse.json(),
          tasksResponse.json(),
        ]);

        // Enhance project data with student names
        const enhancedProjects = await Promise.all(
          projectsData.map(async (project) => {
            try {
              const studentsResponse = await fetch(`http://localhost:3001/api/student_projects/${project.id}`);
              if (!studentsResponse.ok) {
                throw new Error(`Failed to fetch student data for project ${project.id}`);
              }
              const students = await studentsResponse.json();
              const studentNames = students
                .map((student) =>
                  `${student.student_name}${student.partner_name ? ` & ${student.partner_name}` : ''}`
                )
                .join(', ');

              return {
                ...project,
                students: studentNames || 'None',
              };
            } catch (err) {
              console.error(err);
              return {
                ...project,
                students: 'Error fetching student data',
              };
            }
          })
        );

        setProjects(enhancedProjects);
        setTasks(tasksData);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError('Error fetching data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  const handleProjectAction = async (projectId, action) => {
    try {
      const response = await fetch(`http://localhost:3001/api/all_projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project status');
      }

      // Refresh projects after update
      const updatedProjectsResponse = await fetch(`http://localhost:3001/api/all_projects/lecturer/${user.id}`);
      const updatedProjectsData = await updatedProjectsResponse.json();

      const enhancedProjects = await Promise.all(
        updatedProjectsData.map(async (project) => {
          try {
            const studentsResponse = await fetch(`http://localhost:3001/api/student_projects/${project.id}`);
            if (!studentsResponse.ok) {
              throw new Error(`Failed to fetch student data for project ${project.id}`);
            }
            const students = await studentsResponse.json();
            const studentNames = students
              .map((student) =>
                `${student.student_name}${student.partner_name ? ` & ${student.partner_name}` : ''}`
              )
              .join(', ');

            return {
              ...project,
              students: studentNames || 'None',
            };
          } catch (err) {
            console.error(err);
            return {
              ...project,
              students: 'Error fetching student data',
            };
          }
        })
      );

      setProjects(enhancedProjects);
    } catch (err) {
      console.error('Error updating project status:', err);
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.key_interests?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const projectColumns = [
    { key: 'id', header: 'Project ID', sortable: true },
    { key: 'title', header: 'Project Title', sortable: true },
    {
      key: 'students',
      header: 'Students',
      render: (value) => (value ? value : 'None'),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            value === 'Unassigned'
              ? 'bg-gray-300 text-gray-800'
              : value === 'Approved'
              ? 'bg-green-100 text-green-800'
              : value === 'Pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, project) => (
        <div className="flex space-x-2">
          {project.status === 'Pending' && (
            <>
              <Button
                onClick={() => handleProjectAction(project.id, 'approve')}
                variant="ghost"
                size="sm"
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Check className="w-4 h-4 text-green-600" />
                <span className="sr-only">Approve</span>
              </Button>
              <Button
                onClick={() => handleProjectAction(project.id, 'reject')}
                variant="ghost"
                size="sm"
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-red-600" />
                <span className="sr-only">Reject</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 hover:bg-gray-100 rounded"
              >
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="sr-only">Request More Information</span>
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-primary">{user?.username}'s Status</h1>

      <div className="space-y-6">
        {/* Project Requests Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-primary">My Projects</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-2 py-1 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table data={filteredProjects} columns={projectColumns} />
          </div>
        </div>

        {/* Tasks and Calendar Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Calendar tasks={tasks} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

          {/* Task List */}
          <TaskList tasks={tasks} selectedDate={selectedDate} />

          {/* Job Completed */}
          <ProgressBar
            completedTasks={tasks.filter((task) => task.task_status === 'Completed').length}
            totalTasks={tasks.length}
          />
        </div>
      </div>
    </div>
  );
};

export default SupervisorsStatus;
