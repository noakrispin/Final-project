import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { projectsApi } from "../services/projectsAPI"; // Updated API import
import { BlurElements } from "../components/shared/BlurElements";
import ProjectDetailsPopup from "../components/shared/ProjectDetailsPopup";
import { Table } from "../components/ui/Table";
import { Card } from "../components/ui/Card";
import LoadingScreen from "../components/shared/LoadingScreen";

const FILTERS = ["All", "Part A", "Part B"];

const ProjectsSupervisors = () => {
  const [projects, setProjects] = useState([]);
  const [projectsFilter, setProjectsFilter] = useState("All");
  const [searchProjects, setSearchProjects] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [personalNotes, setPersonalNotes] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
    
      try {
        setIsLoading(true);
        const projectsData = await projectsApi.getAllProjects(); // Fetch projects from the backend
        const filteredProjects = projectsData.filter(
          (project) => project.supervisor1 === user.email || project.supervisor2 === user.email
        );
        setProjects(filteredProjects);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to fetch projects. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const handleProjectClick = useCallback((project) => {
    setSelectedProject(project);
    setPersonalNotes(project.specialNotes || "");
  }, []);

  const handleClosePopup = () => {
    setSelectedProject(null);
    
  };

  
  const projectColumns = useMemo(
    () => [
      {
        key: "projectCode",
        header: "Project Code",
        className: "text-base",
        sortable: true,
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
        render: (students) => (
          <span className="text-base">
            {students.map((student) => student.name).join(", ")}
          </span>
        ),
      },
      {
        key: "gitLink",
        header: "Git Link",
        sortable: false,
        className: "text-base",
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
        key: "specialNotes",
        header: "Special Notes",
        sortable: false,
        className: "text-base",
      },
      {
        key: "deadline",
        header: "Deadline",
        sortable: true,
        className: "text-base",
        render: (deadline) =>
          deadline ? new Date(deadline._seconds * 1000).toLocaleDateString() : "N/A",
      },
    ],
    []
  );

  if (isLoading) {
    return <LoadingScreen isLoading={isLoading} description="Fetching your supervised projects..." />; 
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="relative bg-white min-h-screen overflow-hidden">
      <BlurElements />
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="ml-2 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold">{`My Supervised Projects - ${user?.fullName}`}</h1>
            <p className="text-gray-600 text-lg mt-2">
              Here are all the projects currently under your supervision,
              categorized for easy tracking and management.
            </p>
          </div>
        </div>
        </div>


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Card className="p-6">
          <Table
            data={projects}
            columns={projectColumns}
            filters={FILTERS}
            searchValue={searchProjects}
            onSearchChange={setSearchProjects}
            selectedFilter={projectsFilter}
            onFilterChange={setProjectsFilter}
            onRowClick={(row) => handleProjectClick(row)}
            rowClassName="cursor-pointer hover:bg-gray-300 transition-colors duration-150"
            showTabs={true}
            showDescription = {true}
            description = "Click on a project to view its details, save personal notes, email students etc."
          />
          </Card>
        </div>
        
      </div>

      {selectedProject && (
  <ProjectDetailsPopup
    project={selectedProject}
    onClose={handleClosePopup}
    api={projectsApi}
    userRole={user?.role}
  />
)}

    </div>
  );
};

export default ProjectsSupervisors;
