import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BlurElements } from '../components/shared/BlurElements';
import { Section } from '../components/sections/Section';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';

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
        console.error('Error fetching data:', err);
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

  const myProjectColumns = useMemo(() => [
    { key: 'projectCode', header: 'Project Code', className: 'text-lg', sortable: true },
    {
      key: 'students',
      header: 'Students',
      className: 'text-lg',
      render: (students) => <span>{students.map((s) => s.name).join(', ')}</span>,
    },
    { key: 'supervisor', header: 'Supervisor', className: 'text-lg' },
    {
      key: 'presentationGrade',
      header: 'Presentation Grade',
      className: 'text-lg',
      render: (_, project) => {
        const grade = getGrade(project.projectCode, 'presentation');
        return grade !== null ? (
          <span>{grade}</span>
        ) : (
          <button
            className="text-purple-500 hover:underline cursor-pointer"
            onClick={() => navigateToForm('presentation', project)}
          >
            Grade Presentation
          </button>
        );
      },
    },
    {
      key: 'supervisorGrade',
      header: 'Supervisor Grade',
      className: 'text-lg',
      render: (_, project) => {
        const grade = getGrade(project.projectCode, 'supervisor');
        return grade !== null ? (
          <span>{grade}</span>
        ) : (
          <button
            className="text-purple-500 hover:underline cursor-pointer"
            onClick={() => navigateToForm('supervisor', project)}
          >
            Grade Supervisor
          </button>
        );
      },
    },
    {
      key: 'deadline',
      header: 'Deadline',
      className: 'text-lg',
      sortable: true,
    },
  ], [navigateToForm, grades]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) =>
      activeTab === 'My Projects'
        ? project.supervisor === user?.fullName
        : project.presentationAttendees?.includes(user?.fullName)
    );
  }, [projects, activeTab, user]);

  const stats = useMemo(() => {
    const total = filteredProjects.length;
    const graded = filteredProjects.filter((project) =>
      getGrade(project.projectCode, 'presentation') || getGrade(project.projectCode, 'supervisor')
    ).length;
    return { graded, total };
  }, [filteredProjects, grades]);

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
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:border-purple-500 hover:text-foreground'
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
                <ProgressBar
                  value={(stats.graded / stats.total) * 100}
                  className="w-full h-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
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
