import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { BlurElements } from "../components/shared/BlurElements";
import ProjectDetailsPopup from "../components/shared/ProjectDetailsPopup";
import { Table } from "../components/ui/Table";

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
        const projectsData = await api.getProjects();
        const filteredProjects = projectsData.filter(
          (project) => project.supervisor === user.fullName
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
    setPersonalNotes(project.personalNotes || "");
  }, []);

  const handleClosePopup = () => {
    setSelectedProject(null);
    setPersonalNotes("");
  };

  const handleSaveNotes = async () => {
    if (!selectedProject) return;

    try {
      await api.updateProjectNotes(selectedProject.id, personalNotes);

      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === selectedProject.id
            ? { ...project, personalNotes }
            : project
        )
      );
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const handleEmailStudents = () => {
    if (!selectedProject) return;

    const studentEmails = selectedProject.students
      .map((student) => student.email)
      .join(",");
    const subject = encodeURIComponent(
      `Regarding Project: ${selectedProject.title}`
    );
    const body = encodeURIComponent(
      `Dear students,\n\nI hope this email finds you well. I wanted to discuss your project \"${selectedProject.title}\".\n\nBest regards,\n${user.fullName}`
    );

    window.location.href = `mailto:${studentEmails}?subject=${subject}&body=${body}`;
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
        sortable: true,
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
        sortable: true,
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
        sortable: true,
        className: "text-base",
      },
      {
        key: "deadline",
        header: "Deadline",
        sortable: true,
        className: "text-base",
      },
    ],
    []
  );

  if (isLoading) {
    return <div className="text-center mt-10">Loading...</div>;
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
            {" "}
            {/* Reduced margin-bottom */}
            <h1 className="text-2xl font-bold">{`My Supervised Projects - ${user?.fullName}`}</h1>
            <p className="text-gray-600 text-lg mt-2">
              Here are all the projects currently under your supervision,
              categorized for easy tracking and management.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {" "}
          {/* Reduced padding */}
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
          />
        </div>
      </div>

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
  );
};

export default ProjectsSupervisors;
