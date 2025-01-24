import React, { useState, useEffect, useMemo } from "react";
import { Table } from "../components/ui/Table";
import ProjectAssessmentPopup from "../components/ui/ProjectAssessmentPopup";
import { gradesApi } from "../services/finalGradesAPI";
import { projectsApi } from "../services/projectsAPI";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SupervisorGradesFeedback = () => {
  const { user } = useAuth(); // Retrieve the logged-in user details
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);

  useEffect(() => {
    const fetchAndProcessGrades = async () => {
      try {
        console.log("Starting data fetch and preprocessing...");

        console.log("Fetching final grades...");
        const gradesResponse = await gradesApi.getAllGrades();
        const grades = gradesResponse || [];
        console.log("Final grades fetched:", grades);

        console.log("Fetching all projects...");
        const projects = await projectsApi.getAllProjects();
        console.log("All projects fetched:", projects);

        console.log("Filtering projects for supervisor...");
        const filteredProjects = filterProjectsForSupervisor(projects, user.email);
        console.log("Filtered projects:", filteredProjects);

        console.log("Processing final grades...");
        const processedData = preprocessProjects(grades, filteredProjects);
        console.log("Processed Data:", processedData);

        setProjects(processedData);
      } catch (error) {
        console.error("Error during preprocessing:", error);
        setError("Failed to preprocess project data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndProcessGrades();
  }, [user]);

  const filterProjectsForSupervisor = (projects, supervisorEmail) => {
    return projects.filter(
      (project) =>
        project.supervisor1 === supervisorEmail ||
        project.supervisor2 === supervisorEmail
    );
  };

  const preprocessProjects = (grades, projects) => {
    try {
      console.log("Preprocessing projects with grades and projects...");
      console.log("Grades:", grades);
      console.log("Projects:", projects);
  
      // Get the project codes from the filtered projects
      const filteredProjectCodes = projects.map((project) => project.projectCode);
      console.log("Filtered Project Codes:", filteredProjectCodes);
  
      // Filter grades to only include those matching the filtered project codes
      const filteredGrades = grades.filter(
        (grade) =>
          grade.projectCode &&
          filteredProjectCodes.includes(grade.projectCode) &&
          grade.projectCode !== "placeholderProject"
      );
      console.log("Filtered Grades:", filteredGrades);
  
      // Map grades to project details
      return filteredGrades
        .map((grade) => {
          const project = projects.find(
            (proj) => proj.projectCode === grade.projectCode
          );
  
          if (!project) {
            console.warn(`Project not found for grade: ${grade.projectCode}`);
            return null;
          }
  
          const studentName =
            [project.Student1, project.Student2]
              .filter((student) => student && student.ID === grade.studentID)
              .map(
                (student) =>
                  student.fullName ||
                  `${student.firstName} ${student.lastName}`
              )
              .join(", ") || "Unknown Student";
  
          const deadline =
            project.deadline && project.deadline._seconds
              ? new Date(project.deadline._seconds * 1000).toLocaleDateString()
              : "No Deadline";
  
          console.log("Rendering status(in preprocess):", grade.status);
  
          return {
            ...project, // Include project details
            projectCode: grade.projectCode,
            studentName,
            presentationGrade: grade.CalculatedPresentationGrade || "N/A",
            bookGrade: grade.CalculatedBookGrade || "N/A",
            supervisorGrade: grade.CalculatedSupervisorGrade || "N/A",
            finalGrade: grade.finalGrade || "N/A",
            status: grade.status || "Not graded",
            deadline: deadline, // Add fallback value for undefined deadline
          };
        })
        .filter(Boolean); // Filter out null values
    } catch (error) {
      console.error("Error preprocessing projects:", error.message);
      throw new Error("Failed to preprocess project data.");
    }
  };
  

  const projectColumns = useMemo(
    () => [
      {
        key: "projectCode",
        header: "Project Code",
        sortable: true,
        className: "text-base",
      },
      { key: "part", header: "Part", className: "text-base" },
      {
        key: "studentName",
        header: "Student Name",
        className: "text-base",
      },
      {
        key: "bookGrade",
        header: "Book Grade",
        className: "text-base",
        render: (project) =>
          project.bookGrade !== undefined ? project.bookGrade : " ",
      },
      {
        key: "presentationGrade",
        header: "Presentation Grade",
        className: "text-base",
        render: (project) =>
          project.presentationGrade !== undefined
            ? project.presentationGrade
            : " ",
      },
      {
        key: "supervisorGrade",
        header: "Supervisor Grade",
        className: "text-base",
        render: (project) =>
          project.supervisorGrade !== undefined ? project.supervisorGrade : " ",
      },
      {
        key: "finalGrade",
        header: "Final Grade",
        className: "text-base",
        render: (project) =>
          project.finalGrade !== undefined ? project.finalGrade : " ",
      },
      {
        key: "status",
        header: "Grade Status",
        className: "text-base",
        render: (status) => renderGradeStatus(status),
      },
      {
        key: "deadline",
        header: "Deadline",
        className: "text-base",
        sortable: true,
      },
    ],
    []
  );

  const renderGradeStatus = (status) => {
    console.log("status in render status:", status);

    if (!status) {
      return (
        <span
          className="inline-block px-3 py-1 text-sm rounded-full text-center bg-gray-100 text-gray-500"
          style={{
            minWidth: "80px",
            whiteSpace: "nowrap",
            lineHeight: "1.5",
          }}
        >
          Unknown Status
        </span>
      );
    }

    const statusClasses = {
      "Fully graded": "bg-green-100 text-green-700",
      "Partially graded": "bg-yellow-100 text-yellow-700",
      "Not graded": "bg-red-100 text-red-700",
    };

    const statusClass = statusClasses[status] || "bg-gray-100 text-gray-500";

    return (
      <span
        className={`inline-block px-3 py-1 text-sm rounded-full text-center ${statusClass}`}
        style={{
          minWidth: "80px",
          whiteSpace: "nowrap",
          lineHeight: "1.5",
        }}
      >
        {status}
      </span>
    );
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
    studentName: project.studentName,
  }));

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Supervisor Grades Feedback
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage grades for projects assigned to you.
            </p>
          </div>
        </div>

        <div className="overflow-auto p-6">
          <Table
            data={tableData}
            columns={projectColumns}
            rowClassName="hover:bg-gray-50 transition duration-200"
            onRowClick={(row) => setSelectedGrade({ project: row })}
            useCustomColumns={false}
            showDescription={true}
            description="Weighted grades for each student. Click on a row to view detailed project assessments."
          />
        </div>
      </div>

      {selectedGrade && (
        <ProjectAssessmentPopup
          project={selectedGrade.project} // Pass the entire project details
          onClose={() => setSelectedGrade(null)}
        />
      )}
    </div>
  );
};

export default SupervisorGradesFeedback;
