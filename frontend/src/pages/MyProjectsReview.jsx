import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BlurElements } from '../components/shared/BlurElements';
import { Section } from '../components/sections/Section';
import ProjectDetailsPopup from '../components/shared/ProjectDetailsPopup';

const TABS = ['My Projects', 'Other Projects'];

const MyProjectsReview = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [projects, setProjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formSubmitted, setFormSubmitted] = useState(false);

  const navigateToForm = useCallback((formType, project) => {
    const formPath = formType === 'presentation'
      ? `presentation-${project.part.toLowerCase()}`
      : formType;
    const queryParams = new URLSearchParams({
      projectCode: project.projectCode,
      projectName: project.title,
      students: JSON.stringify(project.students),
    }).toString();
    navigate(`/evaluation-forms/${formPath}?${queryParams}`);
  }, [navigate]);

  useEffect(() => {
    if (location.state?.formSubmitted) {
      setFormSubmitted(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const [projectsData, gradesData] = await Promise.all([
          api.getProjects(),
          api.getGrades(),
        ]);
        setProjects(projectsData.filter(p => p.supervisor === user?.fullName));
        setGrades(gradesData);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setIsLoading(false);
        setFormSubmitted(false);
      }
    };
    fetchData();
  }, [user, formSubmitted]);

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    const [day, month, year] = deadline.split('/');
    return new Date(`${year}-${month}-${day}`) < new Date();
  };

  const getGrade = (projectCode, gradeType) => {
    const projectGrades = grades.find((g) => g.projectCode === projectCode);
    if (!projectGrades) return null;

    switch (gradeType) {
      case 'presentation':
        const presentationGrades = projectGrades.presentationReviewerFormA || projectGrades.presentationReviewerFormB;
        return presentationGrades?.[0]?.projectGrade || null;
      case 'supervisor':
        return projectGrades.supervisorForm?.projectGrade || null;
      default:
        return null;
    }
  };

  const progressStats = useMemo(() => {
    const total = projects.length;
    const graded = projects.filter((project) => {
      const supervisorGrade = getGrade(project.projectCode, 'supervisor');
      const presentationGrade = getGrade(project.projectCode, 'presentation');
      return supervisorGrade !== null && presentationGrade !== null;
    }).length;

    return { graded, total };
  }, [projects, grades]);

  const getProgressBarColor = (progress) => {
    if (progress === 100) return 'bg-green-500';
    if (progress > 0) return 'bg-blue-500';
    return 'bg-red-500';
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleClosePopup = () => {
    setSelectedProject(null);
  };

  const handleEmailStudents = () => {
    if (!selectedProject) return;

    const studentEmails = selectedProject.students
      .map((student) => student.email)
      .join(',');
    const subject = encodeURIComponent(`Regarding Project: ${selectedProject.title}`);
    const body = encodeURIComponent(
      `Dear students,\n\nI hope this email finds you well. I wanted to discuss your project "${selectedProject.title}".\n\nBest regards,\n${user.fullName}`
    );

    window.location.href = `mailto:${studentEmails}?subject=${subject}&body=${body}`;
  };

  const saveGitLinkToBackend = async (projectId, gitLink) => {
    try {
      await api.updateProjectGitLink(projectId, gitLink);
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === projectId ? { ...project, gitLink } : project
        )
      );
    } catch (error) {
      console.error('Error saving Git link:', error);
    }
  };

  const saveNotesToBackend = async (projectId, notes) => {
    try {
      await api.updateProjectNotes(projectId, notes);
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === projectId ? { ...project, personalNotes: notes } : project
        )
      );
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const myProjectColumns = useMemo(() => [
    { key: 'projectCode', header: 'Project Code', className: 'text-lg text-center', sortable: true },
    {
      key: 'students',
      header: 'Students',
      className: 'text-lg text-center',
      render: (students) => <span>{students.map((s) => s.name).join(', ')}</span>,
      sortable: true,
    },
    { key: 'supervisor', header: 'Supervisor', className: 'text-lg text-center', sortable: true },
    {
      key: 'gitLink',
      header: 'Git Link',
      className: 'text-lg text-center',
      render: (value, project) =>
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
      sortable: true,
    },
    {
      key: 'presentationGrade',
      header: 'Presentation Grade',
      className: 'text-lg text-center',
      render: (_, project) => {
        const grade = getGrade(project.projectCode, 'presentation');
        return (
          <div className="flex justify-center">
            {isDeadlinePassed(project.deadline) ? (
              <span>{grade || '-'}</span>
            ) : grade !== null ? (
              <span
                className="text-blue-900 hover:underline cursor-pointer"
                onClick={() => navigateToForm('presentation', project)}
              >
                {grade}
              </span>
            ) : (
              <button
                className="text-blue-900 hover:underline cursor-pointer"
                onClick={() => navigateToForm('presentation', project)}
              >
                Grade Presentation
              </button>
            )}
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'supervisorGrade',
      header: 'Supervisor Grade',
      className: 'text-lg text-center',
      render: (_, project) => {
        const grade = getGrade(project.projectCode, 'supervisor');
        return (
          <div className="flex justify-center">
            {isDeadlinePassed(project.deadline) ? (
              <span>{grade || '-'}</span>
            ) : grade !== null ? (
              <span
                className="text-blue-900 hover:underline cursor-pointer"
                onClick={() => navigateToForm('supervisor', project)}
              >
                {grade}
              </span>
            ) : (
              <button
                className="text-blue-900 hover:underline cursor-pointer"
                onClick={() => navigateToForm('supervisor', project)}
              >
                Grade Supervisor
              </button>
            )}
          </div>
        );
      },
      sortable: true,
    },
    { key: 'deadline', header: 'Deadline', className: 'text-lg text-center', sortable: true },
  ], [navigateToForm, grades, isDeadlinePassed, getGrade]);
  

  if (isLoading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="relative bg-white min-h-screen overflow-hidden">
      <BlurElements />
      <div className="relative z-10">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center py-4">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  className={`inline-flex items-center px-3 pt-2 pb-3 border-b-2 text-base font-medium ${
                    activeTab === tab
                      ? 'border-blue-900 text-blue-900'
                      : 'border-transparent text-gray-500 hover:border-blue-900 hover:text-blue-900'
                  }`}
                  onClick={() => tab === 'Other Projects' ? navigate('/OtherProjectsReview') : setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Section
            title="My Projects"
            description="Projects you need to grade as a supervisor"
            progressBar={
              <div className="mt-4 mb-6">
                <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${getProgressBarColor(
                      (progressStats.graded / progressStats.total) * 100
                    )}`}
                    style={{ width: `${(progressStats.graded / progressStats.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  {`${progressStats.graded}/${progressStats.total} Final Grades Submitted`}
                </p>
              </div>
            }
            tableData={projects}
            tableColumns={myProjectColumns}
            onRowClick={handleProjectClick}
          />
        </div>
      </div>

      {selectedProject && (
        <ProjectDetailsPopup
          project={selectedProject}
          onClose={handleClosePopup}
          handleEmailStudents={handleEmailStudents}
          saveGitLinkToBackend={saveGitLinkToBackend}
          saveNotesToBackend={saveNotesToBackend}
          userRole={user?.role}
        />
      )}
    </div>
  );
};

export default MyProjectsReview;

