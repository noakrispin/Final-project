import React, { useState, useEffect } from 'react';
import { Table } from '../components/Table';
import { Button } from '../components/Button';
import { Check, X, Search, Bell, MessageSquare, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import projectRequestsData from '../data/projectRequests.json';
import projectsData from '../data/projects.json';

const SupervisorsStatus = () => {
  const [projectRequests, setProjectRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', date: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [displayedTasks, setDisplayedTasks] = useState(3);

  useEffect(() => {
    // Simulating API calls
    const fetchData = async () => {
      try {
        setProjectRequests(projectRequestsData);
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const projectRequestTasks = projectRequests
      .filter(request => request.status === 'Pending')
      .map(request => ({
        id: `request-${request.id}`,
        title: `Review ${request.projectTitle}`,
        deadline: new Date(), // You might want to add a deadline field to projectRequests
        priority: 'high',
        type: 'request'
      }));

    const gradeTasks = projects
      .filter(project => project.gradeStatus !== 'Submitted')
      .map(project => ({
        id: `grade-${project.id}`,
        title: `Submit Grades for ${project.title}`,
        deadline: new Date(project.deadline),
        priority: new Date(project.deadline) < new Date() ? 'overdue' : 'high',
        type: 'grade'
      }));

    const feedbackTasks = projects
      .filter(project => project.feedbackStatus !== 'Submitted')
      .map(project => ({
        id: `feedback-${project.id}`,
        title: `Submit Feedback for ${project.title}`,
        deadline: new Date(project.deadline),
        priority: new Date(project.deadline) < new Date() ? 'overdue' : 'high',
        type: 'feedback'
      }));

    const allTasks = [...projectRequestTasks, ...gradeTasks, ...feedbackTasks];
    setTasks(allTasks);

    // Calculate completion percentage
    const completedTasks = projects.filter(p => p.gradeStatus === 'Submitted' && p.feedbackStatus === 'Submitted').length;
    const totalTasks = projects.length * 2; // Each project has two tasks: grade and feedback
    setCompletionPercentage(Math.round((completedTasks / totalTasks) * 100));
  }, [projectRequests, projects]);

  const filteredProjectRequests = projectRequests.filter(request =>
    request.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.students.some(student => student.toLowerCase().includes(searchTerm.toLowerCase())) ||
    request.supervisor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProjectAction = (projectId, action) => {
    setProjectRequests(prevRequests => prevRequests.map(request =>
      request.id === projectId ? { ...request, status: action } : request
    ));
  };

  const projectColumns = [
    { key: 'id', header: '#', sortable: true },
    { key: 'projectTitle', header: 'Project Title', sortable: true },
    { key: 'students', header: 'Students', render: (value) => value.join(', ') },
    { key: 'supervisor', header: 'Supervisor', sortable: true },
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
              <button className="p-1 hover:bg-gray-100 rounded" aria-label="Approve" onClick={() => handleProjectAction(request.id, 'Approved')}>
                <Check className="w-4 h-4 text-green-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded" aria-label="Reject" onClick={() => handleProjectAction(request.id, 'Rejected')}>
                <X className="w-4 h-4 text-red-600" />
              </button>
            </>
          )}
          <button className="p-1 hover:bg-gray-100 rounded" aria-label="Request More Information">
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      )
    }
  ];

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const days = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);
    const weeks = [];
    let week = [];

    for (let i = 0; i < firstDay; i++) {
      week.push(<td key={`empty-${i}`} className="p-2"></td>);
    }

    for (let day = 1; day <= days; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const hasTasks = tasks.some(task => task.deadline.toDateString() === date.toDateString());

      week.push(
        <td
          key={day}
          className={`p-2 text-center cursor-pointer relative ${
            isToday ? 'bg-blue-500 text-white' :
              isSelected ? 'bg-blue-200' : ''
          } hover:bg-blue-100 rounded-full`}
          onClick={() => setSelectedDate(date)}
        >
          {day}
          {hasTasks && (
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></span>
          )}
        </td>
      );

      if ((firstDay + day) % 7 === 0 || day === days) {
        weeks.push(<tr key={day}>{week}</tr>);
        week = [];
      }
    }

    return weeks;
  };

  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const handleNewTaskSubmit = (e) => {
    e.preventDefault();
    if (newTask.title && newTask.date) {
      setTasks(prevTasks => [...prevTasks, {
        id: `custom-${prevTasks.length + 1}`,
        title: newTask.title,
        deadline: new Date(newTask.date),
        priority: 'medium',
        type: 'custom'
      }]);
      setNewTask({ title: '', date: '' });
    }
  };

  const tasksForSelectedDate = selectedDate
    ? tasks.filter(task => task.deadline.toDateString() === selectedDate.toDateString())
    : tasks;

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">My Status</h1>

      <div className="space-y-6">
        {/* Project Requests Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Project Requests</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-2 py-1 border rounded"
                />
                <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button className="p-1 bg-blue-100 rounded-full relative">
                <Bell className="w-5 h-5 text-blue-600" />
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {projectRequests.filter(p => p.status === 'Pending').length}
                </span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table data={filteredProjectRequests} columns={projectColumns} />
          </div>
        </div>

        {/* Tasks and Calendar Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Calendar</h2>
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => changeMonth(-1)} className="p-1"><ChevronLeft /></button>
              <h3 className="text-lg font-medium">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
              <button onClick={() => changeMonth(1)} className="p-1"><ChevronRight /></button>
            </div>
            <table className="w-full">
              <thead>
                <tr>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <th key={day} className="p-2">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {renderCalendar()}
              </tbody>
            </table>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Task List</h2>
            <div className="space-y-4">
              <form onSubmit={handleNewTaskSubmit}>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task Title"
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="date"
                  value={newTask.date}
                  onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                  className="w-full p-2 border rounded mb-2"
                />
                <Button type="submit">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </form>
              <div>
                <h3 className="text-sm font-medium text-red-600 mb-2">
                  {selectedDate ? `Tasks for ${selectedDate.toDateString()}` : 'All Tasks'}
                </h3>
                {tasksForSelectedDate.slice(0, displayedTasks).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-gray-50 rounded-lg mb-2"
                  >
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.deadline.toDateString()}</p>
                    <p className="text-xs text-blue-600">{task.type}</p>
                  </div>
                ))}
                {tasksForSelectedDate.length > 3 && (
                  <Button
                    onClick={() => setDisplayedTasks(prevDisplayed => 
                      prevDisplayed === 3 ? tasksForSelectedDate.length : 3
                    )}
                    className="mt-2 w-full"
                  >
                    {displayedTasks === 3 ? 'Show More' : 'Show Less'}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Job Completed</h2>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    Progress
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {completionPercentage}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div
                  style={{ width: `${completionPercentage}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorsStatus;