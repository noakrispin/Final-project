import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Table } from "../components/ui/Table";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProjectAssessmentPopup from "../components/ui/ProjectAssessmentPopup";

const SupervisorGradesFeedback = () => {
  const [projects, setProjects] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch projects supervised by the logged-in user
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const [projectsData, projectAnswers] = await Promise.all([
          api.getProjects(),
          api.getProjectAnswers(),
        ]);

        const filteredProjects = projectsData.filter(
          (project) => project.supervisor === user.fullName
        );
        setProjects(filteredProjects);
        setAnswers(projectAnswers);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const projectColumns = useMemo(
    () => [
      {
        key: "projectCode",
        header: "Project Code",
        sortable: true,
        className: "text-base",
      },
      {
        key: "title",
        header: "Project Title",
        sortable: true,
        className: "text-base",
      },
      {
        key: "students",
        header: "Students",
        sortable: false,
        className: "text-base",
        render: (students) =>
          students.map((student) => student.name).join(", "),
      },
    ],
    []
  );

  const handleRowClick = useCallback((project) => {
    setSelectedProject(project);
  }, []);

  if (isLoading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="relative bg-white min-h-screen overflow-hidden">
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="ml-2 mb-6">
            <h1 className="text-2xl font-bold">{`Grades and Feedback - ${user?.fullName}`}</h1>
            <p className="text-gray-600 text-lg mt-2">
              View grades and feedback from other evaluators for the projects you supervise.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Table
            data={projects}
            columns={projectColumns}
            onRowClick={handleRowClick}
            rowClassName="cursor-pointer hover:bg-gray-300 transition-colors duration-150"
          />
        </div>
      </div>

      {selectedProject && (
        <ProjectAssessmentPopup
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
};

export default SupervisorGradesFeedback;
