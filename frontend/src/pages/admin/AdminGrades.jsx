import React, { useState, useEffect, useMemo } from "react";
import { Table } from "../../components/ui/Table";
import { mockApi } from "../../services/mockApi";
import { exportToExcelFile } from "../../services/fileProcessingService";
import ProjectDetailsPopup from "../../components/shared/ProjectDetailsPopup";
import ProjectAssessmentPopup from "../../components/ui/ProjectAssessmentPopup";

const AdminGradesPage = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const projectsData = await mockApi.getProjects();
        const preprocessedProjects = preprocessProjects(projectsData);
        setProjects(preprocessedProjects);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to fetch projects. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const preprocessProjects = (projects) =>
    projects.map((project) => ({
      ...project,
      supervisors: project.supervisor ? [project.supervisor] : [],
    }));

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
      { key: "part", header: "Part", className: "text-base" },
      {
        key: "students",
        header: "Students",
        className: "text-base",
        render: (students) =>
          students?.map((student) => student?.name || "N/A").join(", ") ||
          "N/A",
      },
      {
        key: "supervisors",
        header: "Supervisors",
        className: "text-base",
        render: (supervisors) =>
          supervisors && supervisors.length > 0
            ? supervisors.join(", ")
            : "N/A",
      },
      {
        key: "presentationGrade",
        header: "Presentation Grade",
        className: "text-base",
        render: (grade, project) => (
          <span
            className="cursor-pointer text-blue-500 hover:underline"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click event
              setSelectedGrade({ project, type: "Presentation Grade", grade });
            }}
          >
            {grade || "N/A"}
          </span>
        ),
      },
      {
        key: "bookGrade",
        header: "Book Grade",
        className: "text-base",
        render: (grade, project) => (
          <span
            className="cursor-pointer text-blue-500 hover:underline"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click event
              setSelectedGrade({ project, type: "Book Grade", grade });
            }}
          >
            {grade || "N/A"}
          </span>
        ),
      },
      {
        key: "supervisorGrade",
        header: "Supervisor Grade",
        className: "text-base",
        render: (grade, project) => (
          <span
            className="cursor-pointer text-blue-500 hover:underline"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click event
              setSelectedGrade({ project, type: "Supervisor Grade", grade });
            }}
          >
            {grade || "N/A"}
          </span>
        ),
      },
      {
        key: "deadline",
        header: "Deadline",
        className: "text-base",
        sortable: true,
      },
      {
        key: "gradingStatus",
        header: "Status",
        className: "text-base",
        render: (gradingStatus) => (
          <span
            className={`inline-block px-3 py-1 text-sm rounded-full text-center ${
              gradingStatus === "Fully graded"
                ? "bg-green-100 text-green-700"
                : gradingStatus === "Partially graded"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
            style={{
              minWidth: "80px",
              whiteSpace: "wrap",
              lineHeight: "1.5",
            }}
          >
            {gradingStatus}
          </span>
        ),
      },
    ],
    []
  );

  const calculateGradingStatus = (project) => {
    const grades = [
      project.presentationGrade,
      project.bookGrade,
      project.supervisorGrade,
    ];
    if (grades.every((grade) => grade !== null && grade !== undefined)) {
      return "Fully graded";
    }
    if (grades.some((grade) => grade !== null && grade !== undefined)) {
      return "Partially graded";
    }
    return "Not yet graded";
  };

  const handleExport = () => {
    const dataToExport = projects.map((project) => ({
      "Project Code": project.projectCode,
      "Project Title": project.title,
      Part: project.part || "N/A",
      "Presentation Grade": project.presentationGrade || "N/A",
      "Book Grade": project.bookGrade || "N/A",
      "Supervisor Grade": project.supervisorGrade || "N/A",
      "Supervisor 1 Name": project.supervisors?.[0] || "N/A",
    "Supervisor 1 ID": project.supervisors?.[0]?.id || "N/A",
    "Supervisor 2 Name": project.supervisors?.[1] || "N/A",
    "Supervisor 2 ID": project.supervisors?.[1]?.id || "N/A",
      "Student 1 Name": project.students?.[0]?.name || "N/A",
      "Student 1 ID": project.students?.[0]?.id || "N/A",
      "Student 2 Name": project.students?.[1]?.name || "N/A",
      "Student 2 ID": project.students?.[1]?.id || "N/A",
    }));

    exportToExcelFile(dataToExport, "Project_Grades.xlsx");
  };

  if (isLoading) {
    return (
      <div className="text-center mt-10 text-lg font-medium text-gray-500">
        Loading project grades...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  const tableData = projects.map((project) => ({
    ...project,
    gradingStatus: calculateGradingStatus(project),
  }));

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Project Grades Management
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage grades for all ongoing projects.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg shadow hover:bg-blue-600 transition"
          >
            Export to Excel
          </button>
        </div>

        <div className="overflow-auto p-6">
          <Table
            data={tableData}
            columns={projectColumns}
            rowClassName="hover:bg-gray-50 transition duration-200"
            onRowClick={(row) => setSelectedProject(row)}
          />
        </div>
      </div>

      {selectedProject && (
        <ProjectDetailsPopup
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {selectedGrade && (
        <ProjectAssessmentPopup
          project={selectedGrade.project}
          onClose={() => setSelectedGrade(null)}
        />
      )}
    </div>
  );
};

export default AdminGradesPage;
