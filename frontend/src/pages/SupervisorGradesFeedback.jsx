import React, { useState, useEffect, useMemo } from "react";
import { Table } from "../components/ui/Table";
import ProjectAssessmentPopup from "../components/ui/ProjectAssessmentPopup";
import { gradesApi } from "../services/finalGradesAPI";
import { projectsApi } from "../services/projectsAPI";
import { formsApi } from "../services/formAPI";
import { userApi } from "../services/userAPI";
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
        const filteredProjects = filterProjectsForSupervisor(
          projects,
          user.email
        );
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
      const filteredProjectCodes = projects.map(
        (project) => project.projectCode
      );
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
                  student.fullName || `${student.firstName} ${student.lastName}`
              )
              .join(", ") || "Unknown Student";

          const deadline =
            project.deadline && project.deadline._seconds
              ? new Date(project.deadline._seconds * 1000).toLocaleDateString()
              : "No Deadline";

          console.log("Rendering status(in preprocess):", grade.status);
          const roundGrade = (value) =>
            typeof value === "number" ? Math.round(value) : value;
          return {
            ...project, // Include project details
            projectCode: grade.projectCode,
            studentName,
            presentationGrade: roundGrade(grade.CalculatedPresentationGrade || ""),
            bookGrade: roundGrade(grade.CalculatedBookGrade || ""),
            supervisorGrade: roundGrade(grade.CalculatedSupervisorGrade || ""),
            finalGrade: roundGrade(grade.finalGrade || ""),
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
              Object.entries(evaluation.grades).forEach(([studentID, grade]) => {
                if (!gradesByStudent[studentID]) {
                  gradesByStudent[studentID] = [];
                }
                gradesByStudent[studentID].push(grade);
              });
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
            toast.error(`Failed to update grades for project ${projectCode}.`);
          }
        }
      }
  
      toast.success("Grades updated! Refreshing...");
      
    } catch (error) {
      console.error("Error refreshing grades:", error.message);
      toast.error("Failed to refresh grades.");
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        window.location.reload(); // Full page reload
      }, 100);
    }
  };
  
  

  const projectColumns = useMemo(
    () => [
      {
        key: "projectCode",
        header: "Project Code",
        sortable: true,
        className: "text-base ",
      },
      { key: "part", header: "Part", className: "text-base " },
      {
        key: "studentName",
        header: "Student Name",
        className: "text-base ",
      },
      {
        key: "bookGrade",
        header: "Book Grade",
        className: "text-base ",
        render: (value, row) => {
          return (
            <div className="whitespace-pre-line text-center">
              {row.bookGrade !== undefined && row.bookGrade !== "N/A"
                ? row.bookGrade
                : "-"}
            </div>
          );
        },
      },
      {
        key: "presentationGrade",
        header: "Presentation Grade",
        className: "text-base text-center",
        render: (value, row) => {
          return (
            <div className="whitespace-pre-line text-center">
              {row.presentationGrade !== undefined &&
              row.presentationGrade !== "N/A"
                ? row.presentationGrade
                : "-"}
            </div>
          );
        },
      },
      {
        key: "supervisorGrade",
        header: "Supervisor Grade",
        className: "text-base text-center",
        render: (value, row) => {
          return (
            <div className="whitespace-pre-line text-center">
              {row.supervisorGrade !== undefined &&
              row.supervisorGrade !== "N/A"
                ? typeof row.supervisorGrade === "number"
                  ? row.supervisorGrade
                  : row.supervisorGrade
                : " "}
            </div>
          );
        },
      },
      {
        key: "finalGrade",
        header: "Final Grade",
        className: "text-base text-center",
        render: (value, row) => {
          return (
            <div className="whitespace-pre-line text-center">
              {row.finalGrade !== undefined && row.finalGrade !== "N/A"
                ? typeof row.finalGrade === "number"
                  ? row.finalGrade
                  : row.finalGrade
                : " "}
            </div>
          );
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
    return (
      <LoadingScreen
        isLoading={isLoading}
        description="Updateding grades, please wait..."
      />
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
            Supervised Project Grades & Evaluations 
            </h1>
            <p className="text-gray-600 mt-1 text-lg">
            Review the weighted grades and final assessments for your supervised projects. 
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