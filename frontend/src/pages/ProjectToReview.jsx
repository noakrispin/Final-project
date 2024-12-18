import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BlurElements } from '../components/shared/BlurElements';
import { Section } from '../components/sections/Section';

const TABS = ['My Projects', 'Other Projects'];

const ProjectToReview = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [projects, setProjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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
        setProjects(projectsData);
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

  const filteredProjects = useMemo(() => {
    return projects.filter((project) =>
      activeTab === 'My Projects'
        ? project.supervisor === user?.fullName
        : project.presentationAttendees?.includes(user?.fullName)
    );
  }, [projects, activeTab, user]);

  const progressStats = useMemo(() => {
    const myProjects = projects.filter((p) => p.supervisor === user?.fullName);
    const otherProjects = projects.filter((p) => p.presentationAttendees?.includes(user?.fullName));

    const computeStats = (list) => {
      const total = list.length;
      const graded = list.filter((project) => {
        const supervisorGrade = getGrade(project.projectCode, 'supervisor');
        const presentationGrade = getGrade(project.projectCode, 'presentation');
        return supervisorGrade !== null && presentationGrade !== null;
      }).length;
      return { graded, total };
    };

    return {
      myProjectsStats: computeStats(myProjects),
      otherProjectsStats: computeStats(otherProjects),
    };
  }, [projects, grades, user]);

  const stats = activeTab === 'My Projects' ? progressStats.myProjectsStats : progressStats.otherProjectsStats;

  const getProgressBarColor = (progress) => {
    if (progress === 100) return 'bg-green-500';
    if (progress > 0) return 'bg-blue-500';
    return 'bg-red-500';
  };

  const myProjectColumns = useMemo(() => [
    { key: 'projectCode', header: 'Project Code', className: 'text-lg text-center', sortable: true },
    {
      key: 'students',
      header: 'Students',
      className: 'text-lg text-center',
      render: (students) => <span>{students.map((s) => s.name).join(', ')}</span>,
    },
    { key: 'supervisor', header: 'Supervisor', className: 'text-lg text-center', sortable: true },
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
    },
    {
      key: 'deadline',
      header: 'Deadline',
      className: 'text-lg text-center',
      sortable: true,
    },
  ], [navigateToForm, grades]);

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
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Section
            title={activeTab}
            description={`${
              activeTab === 'My Projects'
                ? 'Projects you need to grade as a supervisor'
                : 'Projects you need to grade as a committee member'
            }`}
            progressBar={
              <div className="mt-4 mb-6">
                <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${getProgressBarColor(
                      (stats.graded / stats.total) * 100
                    )}`}
                    style={{ width: `${(stats.graded / stats.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  {`${stats.graded}/${stats.total} Final Grades Submitted`}
                </p>
              </div>
            }
            tableData={filteredProjects}
            tableColumns={myProjectColumns}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectToReview;
