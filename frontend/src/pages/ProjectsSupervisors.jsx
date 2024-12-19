import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BlurElements } from '../components/shared/BlurElements';
import { Section } from '../components/sections/Section';
import { Button } from '../components/ui/Button';

const FILTERS = ['All', 'Part A', 'Part B'];

const ProjectsSupervisors = () => {
  const [projects, setProjects] = useState([]);
  const [projectsFilter, setProjectsFilter] = useState('All');
  const [searchProjects, setSearchProjects] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [personalNotes, setPersonalNotes] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const projectsData = await api.getProjects();
        const filteredProjects = projectsData.filter(
          (project) =>
            project.supervisor === user.fullName ||
            (project.presentationAttendees &&
              project.presentationAttendees.includes(user.fullName))
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
    return data.filter((item) => {
      const matchesSearch = Object.values(item).some(
        (val) =>
          typeof val === 'string' &&
          val.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (filterValue === 'All') return matchesSearch;
      return matchesSearch && item.part === filterValue.split(' ')[1];
    });
  }, []);

  const filteredProjects = useMemo(
    () => filterData(projects, searchProjects, projectsFilter),
    [projects, searchProjects, projectsFilter, filterData]
  );

  const handleProjectClick = useCallback((project) => {
    setSelectedProject(project);
    setPersonalNotes(project.personalNotes || ''); // Set personal notes for the selected project
  }, []);

  const handleClosePopup = () => {
    setSelectedProject(null);
    setPersonalNotes('');
  };

  const handleSaveNotes = () => {
    console.log('Saved Personal Notes:', personalNotes);
    // Add API integration for saving notes here
  };

  const projectColumns = useMemo(
    () => [
      {
        key: 'id',
        header: '#',
        sortable: true,
        className: 'text-base',
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
        ),
      },
      {
        key: 'students',
        header: 'Students',
        className: 'text-base',
        render: (students) => (
          <span className="text-base">
            {students.map((student) => student.name).join(', ')}
          </span>
        ),
      },
      {
        key: 'projectCode',
        header: 'Project Code',
        className: 'text-base',
        sortable: true,
      },
      {
        key: 'gitLink',
        header: 'Git Link',
        className: 'text-base',
        render: (value) =>
          value ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View
            </a>
          ) : (
            <span className="text-gray-500">Missing Link</span>
          ),
      },
      {
        key: 'specialNotes',
        header: 'Special Notes',
        className: 'text-base',
      },
      {
        key: 'deadline',
        header: 'Deadline',
        className: 'text-base',
        sortable: true,
      },
    ],
    [handleProjectClick]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
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

        {selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto relative">
              <div className="sticky top-0 bg-white z-10 pb-4 flex justify-between items-center border-b border-gray-200">
                <h2 className="text-xl font-bold">
                  {selectedProject.title}
                </h2>
                <Button
                  onClick={handleClosePopup}
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gray-100 rounded transition-colors duration-200"
                >
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="col-span-2">
                  <p className="text-gray-700 mb-4">
                    {selectedProject.description}
                  </p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg text-gray-800">
                  <p><strong>Project Code:</strong> {selectedProject.projectCode}</p>
                  <p><strong>Part:</strong> {selectedProject.part}</p>
                  <p><strong>Deadline:</strong> {selectedProject.deadline}</p>
                  <p>
                    <strong>Git Link:</strong>{' '}
                    {selectedProject.gitLink ? (
                      <a
                        href={selectedProject.gitLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View Repository
                      </a>
                    ) : (
                      <span className="text-gray-500">Missing Link</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Students</h3>
                <div className="space-y-2">
                  {selectedProject.students.map((student, index) => (
                    <div key={index} className="bg-gray-200 p-4 rounded-lg">
                      <p>{student.name}</p>
                      <p className="font-medium">ID: {student.id}</p>
                      <p className="font-medium">Email: {student.email}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Supervisor</h3>
                <p>{selectedProject.supervisor}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedProject.supervisorTopics?.map((topic, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {user?.role === 'supervisor' && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Personal Notes</h3>
                  <textarea
                    value={personalNotes}
                    onChange={(e) => setPersonalNotes(e.target.value)}
                    className="w-full border rounded p-2 text-gray-700"
                    rows="4"
                    placeholder="Add your personal notes here..."
                  />
                  <div className="mt-2">
                    <Button
                      onClick={handleSaveNotes}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Save Notes
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Special Notes</h3>
                <p>
                  {selectedProject.specialNotes || 'No special notes available.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsSupervisors;
