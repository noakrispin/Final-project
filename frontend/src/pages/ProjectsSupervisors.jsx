import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  useEffect(() => {
    setProjects(projectsData);
  }, []);

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
      render: (_, row) => <Actions row={row} onNavigate={handleNavigateToEvaluationForms} />
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
      render: (_, row) => <Actions row={row} onNavigate={handleNavigateToEvaluationForms} />
    }
  ], [handleNavigateToEvaluationForms]);

  return (
    <div className="relative bg-white min-h-screen overflow-hidden">
      <BlurElements />

      <div className="relative z-10 p-4 md:p-6">
        <Section
          title="Projects Supervised"
          description="Projects under your supervision."
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

const BlurElements = React.memo(() => (
  <>
    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#c8d7ff]/70 rounded-full blur-[50px]" />
    <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#c8d7ff]/70 rounded-full blur-[40px]" />
  </>
));

const Section = React.memo(({ title, description, filters, filterState, searchState, tableData, tableColumns }) => {
  const [filter, setFilter] = filterState;
  const [search, setSearch] = searchState;

  return (
    <div className="mb-6 md:mb-8">
      <h2 className="text-2xl md:text-3xl font-bold text-black mb-2 md:mb-3">{title}</h2>
      <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-5 max-w-2xl">{description}</p>

      <div className="space-y-3 md:space-y-4">
        <div className="flex flex-wrap gap-2">
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
});

const SearchBar = React.memo(({ value, onChange, placeholder }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
    <input
      type="text"
      placeholder={placeholder}
      className="w-full h-10 pl-9 pr-3 bg-[#ebecf5] rounded-md text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
));

const StatusBadge = React.memo(({ value, statusType }) => {
  const classes = {
    [statusType.COMPLETED]: 'bg-[#e4ffe1] text-[#686b80] border-[#92e799]',
    [statusType.OVERDUE]: 'bg-[#ffe1e1] text-[#686b80] border-[#e79292]',
    [statusType.PENDING]: 'bg-[#efefef] text-[#686b80] border-[#8c8c8c]',
    [SubmissionStatus.SUBMITTED]: 'bg-[#e4ffe1] text-[#686b80] border-[#92e799]',
    [SubmissionStatus.NOT_SUBMITTED]: 'bg-[#ffe1e1] text-[#686b80] border-[#e79292]'
  };

  return <span className={`px-2 py-0.5 rounded text-xs ${classes[value]}`}>{value}</span>;
});

const Actions = React.memo(({ row, onNavigate }) => (
  <div className="text-right">
    <button
      onClick={onNavigate}
      className="text-[#686b80] text-sm hover:underline focus:outline-none"
    >
      {row.status === ProjectStatus.COMPLETED ? 'View Feedback' : 'Pending Tasks'}
    </button>
  </div>
));

export default ProjectsSupervisors;