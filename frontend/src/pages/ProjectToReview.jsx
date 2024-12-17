import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BlurElements } from '../components/shared/BlurElements';
import { Section } from '../components/sections/Section';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
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

  // Add new state for tracking form submission
  const [formSubmitted, setFormSubmitted] = useState(false);

  const navigateToForm = useCallback((formType, project) => {
    const formPath = formType === 'presentation' 
      ? `presentation-${project.part.toLowerCase()}` 
      : formType;
    const queryParams = new URLSearchParams({
      projectCode: project.projectCode,
      projectName: project.title,
      students: JSON.stringify(project.students)
    }).toString();
    navigate(`/evaluation-forms/${formPath}?${queryParams}`);
  }, [navigate]);

  useEffect(() => {
    // Check if we just came back from form submission
    if (location.state?.formSubmitted) {
      setFormSubmitted(true);
      // Clear the state
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
          api.getGrades()
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

    // Fetch data on mount and when form is submitted
    fetchData();
  }, [user, formSubmitted]);

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    const [day, month, year] = deadline.split('/');
    return new Date(`${year}-${month}-${day}`) < new Date();
  };

  const getProgressStats = (projects) => {
    const total = projects.length;
    const graded = projects.filter(p => {
      const projectGrades = grades.find(g => g.projectCode === p.projectCode);
      if (!projectGrades) return false;
      
      const hasPresentation = projectGrades.presentationReviewerFormA?.length > 0 || 
                              projectGrades.presentationReviewerFormB?.length > 0;
      const hasSupervisor = !!projectGrades.supervisorForm;
      const hasBook = !!projectGrades.bookReviewerFormA || !!projectGrades.bookReviewerFormB;
      
      return hasPresentation && (activeTab === 'My Projects' ? hasSupervisor : hasBook);
    }).length;
    return { graded, total };
  };

  const getGrade = (projectCode, gradeType) => {
    const projectGrades = grades.find(g => g.projectCode === projectCode);
    if (!projectGrades) return null;

    switch (gradeType) {
      case 'presentation':
        const presentationGrades = projectGrades.presentationReviewerFormA || projectGrades.presentationReviewerFormB;
        return presentationGrades?.length > 0 ? presentationGrades[0].projectGrade : null;
      case 'supervisor':
        return projectGrades.supervisorForm?.projectGrade || null;
      case 'book':
        return (projectGrades.bookReviewerFormA?.projectGrade || 
                projectGrades.bookReviewerFormB?.projectGrade || null);
      default:
        return null;
    }
  };

  const myProjectColumns = useMemo(() => [
    { 
      key: 'projectCode', 
      header: 'Project Code',
      className: 'text-lg',
      sortable: true 
    },
    { 
      key: 'students', 
      header: 'Students',
      className: 'text-lg',
      render: (students) => (
        <span className="text-lg">
          {students.map(student => student.name).join(', ')}
        </span>
      )
    },
    { 
      key: 'supervisor', 
      header: 'Supervisor',
      className: 'text-lg'
    },
    {
      key: 'presentationGrade',
      header: 'Presentation Grade',
      className: 'text-lg',
      render: (_, project) => {
        const grade = getGrade(project.projectCode, 'presentation');
        return grade !== null ? (
          <span>{grade}</span>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto font-normal text-left hover:underline hover:underline-offset-4 hover:decoration-purple-500 text-[#686b80] hover:text-purple-500 text-base"
            onClick={() => navigateToForm('presentation', project)}
          >
            Presentation Grade
          </Button>
        );
      }
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
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto font-normal text-left hover:underline hover:underline-offset-4 hover:decoration-purple-500 text-[#686b80] hover:text-purple-500 text-base"
            onClick={() => navigateToForm('supervisor', project)}
          >
            Supervisor Grade
          </Button>
        );
      }
    },
    { 
      key: 'deadline', 
      header: 'Deadline',
      className: 'text-lg',
      sortable: true 
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-lg',
      render: (_, project) => {
        const grade = getGrade(project.projectCode, 'supervisor');
        return (
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-t-md border-b-2 border-transparent hover:border-purple-500 transition-all"
            disabled={isDeadlinePassed(project.deadline)}
            onClick={() => navigateToForm('supervisor', project)}
          >
            {grade ? 'Edit Grade' : 'Grade Project'}
          </Button>
        );
      }
    }
  ], [navigateToForm, grades, isDeadlinePassed]);

  const otherProjectColumns = useMemo(() => [
    { 
      key: 'projectCode', 
      header: 'Project Code',
      className: 'text-lg',
      sortable: true 
    },
    { 
      key: 'students', 
      header: 'Students',
      className: 'text-lg',
      render: (students) => (
        <span className="text-lg">
          {students.map(student => student.name).join(', ')}
        </span>
      )
    },
    { 
      key: 'supervisor', 
      header: 'Supervisor',
      className: 'text-lg'
    },
    { 
      key: 'presentationGrade', 
      header: 'Presentation Grade',
      className: 'text-lg',
      render: (_, project) => {
        const grade = getGrade(project.projectCode, 'presentation');
        return grade !== null ? (
          <span>{grade}</span>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto font-normal text-left hover:underline hover:underline-offset-4 hover:decoration-purple-500 text-[#686b80] hover:text-purple-500 text-base"
            onClick={() => navigateToForm('presentation', project)}
          >
            Presentation Grade
          </Button>
        );
      }
    },
    { 
      key: 'bookGrade', 
      header: 'Book Grade',
      className: 'text-lg',
      render: (_, project) => {
        const grade = getGrade(project.projectCode, 'book');
        return grade || '-';
      }
    },
    { 
      key: 'deadline', 
      header: 'Deadline',
      className: 'text-lg',
      sortable: true 
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-lg',
      render: (_, project) => {
        const grade = getGrade(project.projectCode, 'book');
        return (
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-muted"
            disabled={isDeadlinePassed(project.deadline)}
            onClick={() => navigateToForm('book', project)}
          >
            {grade ? 'Edit Grade' : 'Grade'}
          </Button>
        );
      }
    }
  ], [navigateToForm, grades, isDeadlinePassed]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => 
      activeTab === 'My Projects' 
        ? project.supervisor === user?.fullName
        : project.presentationAttendees?.includes(user?.fullName)
    );
  }, [projects, activeTab, user]);

  const stats = getProgressStats(filteredProjects);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="relative bg-white min-h-screen overflow-hidden">
      <BlurElements />

      <div className="relative z-10">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center py-4">
              {TABS.map(tab => (
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
            description={`${activeTab === 'My Projects' ? 'Projects you need to grade as a supervisor' : 'Projects you need to grade as a committee member'}`}
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
            tableColumns={activeTab === 'My Projects' ? myProjectColumns : otherProjectColumns}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectToReview;

