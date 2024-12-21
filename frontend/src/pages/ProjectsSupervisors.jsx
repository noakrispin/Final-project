import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BlurElements } from '../components/shared/BlurElements';
import { Section } from '../components/sections/Section';
import { Button } from '../components/ui/Button';
import ProjectDetailsPopup from '../components/shared/ProjectDetailsPopup';

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
    setPersonalNotes(project.personalNotes || '');
  }, []);

  const handleClosePopup = () => {
    setSelectedProject(null);
    setPersonalNotes('');
  };

  const handleSaveNotes = async () => {
    if (!selectedProject) return;

    try {
      await api.updateProjectNotes(selectedProject.id, personalNotes);

      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === selectedProject.id
            ? { ...project, personalNotes }
            : project
        )
      );

      console.log('Notes saved successfully');
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const handleEmailStudents = () => {
    if (!selectedProject) return;

    const studentEmails = selectedProject.students.map(student => student.email).join(',');
    const subject = encodeURIComponent(`Regarding Project: ${selectedProject.title}`);
    const body = encodeURIComponent(`Dear students,\n\nI hope this email finds you well. I wanted to discuss your project "${selectedProject.title}".\n\nBest regards,\n${user.fullName}`);

    window.location.href = `mailto:${studentEmails}?subject=${subject}&body=${body}`;
  };

  const projectColumns = useMemo(
    () => [
      {
        key: 'projectCode',
        header: 'Project Code',
        className: 'text-base',
        sortable: true,
      },
      {
        key: 'title',
        header: 'Project Title',
        sortable: true,
        className: 'text-base',
      },
      {
        key: 'students',
        header: 'Students',
        sortable: true,
        className: 'text-base',
        render: (students) => (
          <span className="text-base">
            {students.map((student) => student.name).join(' & ')}
          </span>
        ),
        sortFunction: (a, b) => {
          const aNames = a.students.map((s) => s.name).join(', ');
          const bNames = b.students.map((s) => s.name).join(', ');
          return aNames.localeCompare(bNames);
        },
      },
      {
        key: 'gitLink',
        header: 'Git Link',
        sortable: true,
        className: 'text-base',
        render: (value) =>
          value ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
              onClick={(e) => e.stopPropagation()}
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
        sortable: true,
        className: 'text-base',
        sortFunction: (a, b) => {
          const aNote = a.specialNotes || '';
          const bNote = b.specialNotes || '';
          return aNote.localeCompare(bNote, 'he', { sensitivity: 'base' });
        },
      },
      {
        key: 'deadline',
        header: 'Deadline',
        sortable: true,
        className: 'text-base',
      },
    ],
    []
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
          title={`My Projects- ${user?.fullName}`}
          description={<span className="text-lg">{"Here are all the projects currently under your supervision, categorized for easy tracking and management."}</span>}
          filters={FILTERS}
          filterState={[projectsFilter, setProjectsFilter]}
          searchState={[searchProjects, setSearchProjects]}
          tableData={filteredProjects}
          tableColumns={projectColumns}
          onRowClick={(row) => handleProjectClick(row)}
          rowClassName="cursor-pointer hover:bg-gray-100 transition-colors duration-150"
        />

        {selectedProject && (
          <ProjectDetailsPopup
            project={selectedProject}
            onClose={handleClosePopup}
            personalNotes={personalNotes}
            setPersonalNotes={setPersonalNotes}
            handleSaveNotes={handleSaveNotes}
            handleEmailStudents={handleEmailStudents}
            userRole={user?.role}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectsSupervisors;
