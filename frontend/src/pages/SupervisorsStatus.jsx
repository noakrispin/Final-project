import React, { useState } from 'react';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Check, X, Search, Bell, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Calendar } from '../components/ui/Calendar';
import { TaskList } from '../components/data-display/TaskList';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';

const SupervisorsStatus = () => {
  const { user } = useAuth();
  const { projects, projectRequests, isLoading: isProjectsLoading, error: projectsError } = useProjects();
  const { tasks, addTask, isLoading: isTasksLoading, error: tasksError } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  const filteredProjectRequests = projectRequests ? projectRequests.filter(request =>
    request.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.students.some(student => student.toLowerCase().includes(searchTerm.toLowerCase())) ||
    request.supervisor.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleProjectAction = async (projectId, action) => {
    try {
      await api.updateProjectRequest(projectId, action);
      // Refresh projects after update
      await api.getProjects();
    } catch (error) {
      console.error('Error updating project request:', error);
    }
  };

  const projectColumns = [
    { key: 'id', header: '#', sortable: true },
    { key: 'projectTitle', header: 'Project Title', sortable: true },
    { key: 'students', header: 'Students', render: (value) => value.join(', ') },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-sm ${
          value === "Approved" ? "bg-green-100 text-green-800" :
          value === "Rejected" ? "bg-red-100 text-red-800" :
          "bg-yellow-100 text-yellow-800"
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, request) => (
        <div className="flex space-x-2">
          {request.status === 'Pending' && (
            <>
              <Button
                onClick={() => handleProjectAction(request.id, 'Approved')}
                variant="ghost"
                size="sm"
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Check className="w-4 h-4 text-green-600" />
                <span className="sr-only">Approve</span>
              </Button>
              <Button
                onClick={() => handleProjectAction(request.id, 'Rejected')}
                variant="ghost"
                size="sm"
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-red-600" />
                <span className="sr-only">Reject</span>
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="sr-only">Request More Information</span>
          </Button>
        </div>
      )
    }
  ];

  if (isProjectsLoading || isTasksLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (projectsError || tasksError) {
    return <div className="p-6 text-center text-red-600">Error: {projectsError || tasksError}</div>;
  }

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-primary">My Status - {user?.fullName}</h1>

      <div className="space-y-6">
        {/* Project Requests Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-primary">My Project Requests</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-2 py-1 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <Button variant="primary" size="sm" className="rounded-full relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {projectRequests ? projectRequests.filter(p => p.status === 'Pending').length : 0}
                </span>
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table data={filteredProjectRequests} columns={projectColumns} />
          </div>
        </div>

        {/* Tasks and Calendar Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Calendar 
            tasks={tasks || []} 
            selectedDate={selectedDate} 
            setSelectedDate={setSelectedDate} 
          />

          {/* Task List */}
          <TaskList 
            tasks={tasks || []} 
            addTask={addTask} 
            selectedDate={selectedDate}
          />

          {/* Job Completed */}
          <ProgressBar 
            completedTasks={(projects || []).filter(p => p.gradeStatus === 'Submitted' && p.feedbackStatus === 'Submitted').length}
            totalTasks={(projects || []).length * 2}
          />
        </div>
      </div>
    </div>
  );
};

export default SupervisorsStatus;