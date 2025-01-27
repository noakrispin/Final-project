import React, { useState, useEffect, useMemo } from "react";
import { Table } from "../components/ui/Table";
import ProjectAssessmentPopup from "../components/ui/ProjectAssessmentPopup";
import { gradesApi } from "../services/finalGradesAPI";
import { projectsApi } from "../services/projectsAPI";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { LuRefreshCcw } from "react-icons/lu";
import "react-toastify/dist/ReactToastify.css";
import LoadingScreen from "../components/shared/LoadingScreen";

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
  const handleRefreshClick = async () => {
      try {
          setIsLoading(true);
          toast.info("Refreshing grades...");
  
          for (const project of projects) {
              const { projectCode } = project;
              const evaluationsByForm = [];
  
              for (const formID of [
                  "SupervisorForm",
                  "PresentationFormA",
                  "PresentationFormB",
                  "bookReviewerFormA",
                  "bookReviewerFormB",
              ]) {
                  try {
                      const response = await formsApi.getEvaluations(formID);
                      const filteredEvaluations = response?.filter(
                          (evaluation) => evaluation.projectCode === projectCode
                      );
                      const gradesByStudent = {};
                      filteredEvaluations.forEach((evaluation) => {
                          Object.entries(evaluation.grades).forEach(
                              ([studentID, grade]) => {
                                  if (!gradesByStudent[studentID]) {
                                      gradesByStudent[studentID] = [];
                                  }
                                  gradesByStudent[studentID].push(grade);
                              }
                          );
                      });
                      evaluationsByForm.push({
                          formID,
                          grades: Object.entries(gradesByStudent).map(
                              ([studentID, grades]) => ({ studentID, grades })
                          ),
                      });
                  } catch (error) {
                      console.error(
                          `Error fetching evaluations for formID: ${formID}`,
                          error.message
                      );
                  }
              }
  
              if (evaluationsByForm.length > 0) {
                  try {
                      await gradesApi.addOrUpdateGrade({
                          projectCode,
                          evaluationsByForm,
                      });
                  } catch (error) {
                      toast.error(
                          `Failed to update grades for project ${projectCode}.`
                      );
                  }
              }
          }
  
          const updatedProjects = await gradesApi.getAllGrades();
          const allProjects = await projectsApi.getAllProjects();
          const allUsers = await userApi.getAllUsers();
          console.log("Updated Projects after Refresh:", updatedProjects);
  
          if (updatedProjects.data && updatedProjects.data.length > 0) {
              const processedData = preprocessProjects(
                  updatedProjects.data,
                  allProjects,
                  allUsers
              );
              setProjects(processedData);
              toast.success("Grades refreshed successfully!");
          } else {
              toast.warn("No projects found after refreshing grades.");
          }
      } catch (error) {
          console.error("Error refreshing grades:", error.message);
          toast.error("Failed to refresh grades.");
      } finally {
          setIsLoading(false);
      }
  };

  const projectColumns = useMemo(
    () => [
      {
        key: "projectCode",
        header: "Project Code",
        sortable: true,
        className: "text-base text-center",
      },
      { key: "part", header: "Part", className: "text-base text-center" },
      {
        key: "studentName",
        header: "Student Name",
        className: "text-base text-center",
      },
      {
        key: "bookGrade",
        header: "Book Grade",
        className: "text-base text-center",
        render: (value, row) => {
          return row.bookGrade !== undefined && row.bookGrade !== "N/A" ? row.bookGrade : " "
        },
      },
      {
        key: "presentationGrade",
        header: "Presentation Grade",
        className: "text-base text-center",
        render: (value, row) => {
          return row.presentationGrade !== undefined && row.presentationGrade !== "N/A" ? row.presentationGrade : " "
        },
      },
      {
        key: "supervisorGrade",
        header: "Supervisor Grade",
        className: "text-base text-center",
        render: (value, row) => {
          return row.supervisorGrade !== undefined && row.supervisorGrade !== "N/A"
            ? typeof row.supervisorGrade === "number"
              ? row.supervisorGrade.toFixed(2)
              : row.supervisorGrade
            : " "
        },
      },
      {
        key: "finalGrade",
        header: "Final Grade",
        className: "text-base text-center",
        render: (value, row) => {
          console.log("Row in final grade:", row)
          console.log("Value in final grade:", value)
          const grade = row.finalGrade
          if (grade === null || grade === undefined) return " "
          return typeof grade === "number" ? grade.toFixed(2) : grade
        },
      }, 
      
      {
        key: "status",
        header: "Grade Status",
        className: "text-base text-center",
        render: (status) => renderGradeStatus(status),
      },
      {
        key: "deadline",
        header: "Deadline",
        className: "text-base text-center",
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
    return <LoadingScreen isLoading={isLoading}  description="Updateding grades, please wait..."/>; 
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
          {/* Refresh Grades Button */}
          <div className="flex flex-col items-center">
              <Button
                onClick={handleRefreshClick}
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg text-sm sm:text-base w-full sm:w-auto"
              >
                <LuRefreshCcw className="w-5 h-5 mr-2" />
                <span>Refresh Grades</span>
              </Button>
              <p className="text-gray-600 text-sm mt-2">
                Click to see the updated grades
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
