import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Table } from '../components/Table';
import { Button } from '../components/Button';
import projectsData from '../data/projects.json';

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

  useEffect(() => {
    setProjects(projectsData);
  }, []);

  const filterData = (data, searchTerm, filterKey, filterValue) => {
    return data.filter(item => {
      const matchesSearch = Object.values(item)
        .some(val => typeof val === 'string' && val.toLowerCase().includes(searchTerm.toLowerCase()));

      if (filterValue === 'all') return matchesSearch;
      return matchesSearch && item[filterKey]?.toLowerCase() === filterValue.toLowerCase();
    });
  };

  const filteredProjects = filterData(projects, searchProjects, 'status', projectsFilter);
  const filteredTasks = filterData(projects, searchTasks, 'gradeStatus', tasksFilter);

  const projectColumns = [
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
      render: (_, row) => <Actions row={row} />
    }
  ];

  const taskColumns = [
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
      render: (_, row) => <Actions row={row} />
    }
  ];

  return (
    <div className="relative bg-white min-h-screen overflow-hidden">
      <BlurElements />

      <div className="relative z-10 p-4 md:p-8">
        <Section
          title="Projects Supervised"
          description="This table lists all the projects currently under your supervision."
          filters={FILTERS.PROJECTS}
          filterState={[projectsFilter, setProjectsFilter]}
          searchState={[searchProjects, setSearchProjects]}
          tableData={filteredProjects}
          tableColumns={projectColumns}
        />

        <Section
          title="Pending Grading and Feedback Tasks"
          description="Here are the tasks requiring your immediate attention. Submit grades and provide feedback."
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

const BlurElements = () => (
  <>
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c8d7ff]/70 rounded-full blur-[70px]" />
    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#c8d7ff]/70 rounded-full blur-[50px]" />
  </>
);

const Section = ({ title, description, filters, filterState, searchState, tableData, tableColumns }) => {
  const [filter, setFilter] = filterState;
  const [search, setSearch] = searchState;

  return (
    <div className="mb-8 md:mb-16">
      <h1 className="text-3xl md:text-5xl font-bold text-black mb-4 md:mb-6">{title}</h1>
      <p className="text-gray-600 text-lg md:text-xl mb-6 md:mb-8 max-w-3xl">{description}</p>

      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-wrap gap-2 md:gap-4">
          {filters.map(filterOption => (
            <Button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              variant={filter === filterOption ? 'default' : 'outline'}
              size="sm"
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Button>
          ))}
        </div>

        <SearchBar value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}...`} />

        <Table data={tableData} columns={tableColumns} />
      </div>
    </div>
  );
};

const SearchBar = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2" />
    <input
      type="text"
      placeholder={placeholder}
      className="w-full h-12 pl-12 pr-4 bg-[#ebecf5] rounded-lg text-lg"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const StatusBadge = ({ value, statusType }) => {
  const classes = {
    [statusType.COMPLETED]: 'bg-[#e4ffe1] text-[#686b80] border-[#92e799]',
    [statusType.OVERDUE]: 'bg-[#ffe1e1] text-[#686b80] border-[#e79292]',
    [statusType.PENDING]: 'bg-[#efefef] text-[#686b80] border-[#8c8c8c]',
    [SubmissionStatus.SUBMITTED]: 'bg-[#e4ffe1] text-[#686b80] border-[#92e799]',
    [SubmissionStatus.NOT_SUBMITTED]: 'bg-[#ffe1e1] text-[#686b80] border-[#e79292]'
  };

  return <span className={`px-2 py-1 rounded-lg text-sm md:text-lg ${classes[value]}`}>{value}</span>;
};

const Actions = ({ row }) => (
  <div className="space-y-2">
    <a href="#" className="text-[#686b80] underline block">
      {row.status === ProjectStatus.COMPLETED ? 'View Feedback & Grade' : 'Submit Grade'}
    </a>
    {row.status !== ProjectStatus.COMPLETED && (
      <a href="#" className="text-[#686b80] underline block">Pending Task</a>
    )}
  </div>
);

export default ProjectsSupervisors;
