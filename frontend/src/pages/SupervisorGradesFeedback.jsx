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
        console.log("Fetching projects supervised by user...");
        const projectsResponse = await projectsApi.getProjectsBySupervisor(user.email);
        const supervisedProjects = projectsResponse || [];
        console.log("Supervised projects fetched:", supervisedProjects);
    
        if (supervisedProjects.length === 0) {
          console.warn("No projects found for this supervisor.");
          setProjects([]); 
          setIsLoading(false); 
          return;
        }
    
        const projectCodes = supervisedProjects.map((project) => project.projectCode);
        console.log("Project codes:", projectCodes);
    
        console.log("Fetching grades for supervisor's projects...");
        const gradesResponse = await gradesApi.getGradesForProjects({ projectCodes });
        const grades = gradesResponse.data || [];
        console.log("Grades fetched:", grades);
    
        console.log("Processing final grades...");
        const processedData = preprocessProjects(grades, supervisedProjects);
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

  
  const preprocessProjects = (grades, projects) => {
    try {
      // Create a Map 
      const projectMap = new Map(
        projects.map((project) => [project.projectCode, project])
      );
  
      console.log("Filtered Project Codes:", [...projectMap.keys()]);
  
      // Process grades efficiently using reduce()
      return grades.reduce((result, grade) => {
        if (!grade.projectCode || !projectMap.has(grade.projectCode) || grade.projectCode === "placeholderProject") {
          return result;
        }
  
        const project = projectMap.get(grade.projectCode);
        const student = [project.Student1, project.Student2].find(
          (s) => s && s.ID === grade.studentID
        );
  
        const studentName = student?.fullName || `${student?.firstName || ""} ${student?.lastName || ""}`.trim() || "Unknown Student";
  
        const deadline = project.deadline?._seconds
          ? new Date(project.deadline._seconds * 1000).toLocaleDateString()
          : "No Deadline";
  
        const roundGrade = (value) => (typeof value === "number" ? Math.round(value) : value);
  
        result.push({
          projectCode: grade.projectCode,
          studentName,
          presentationGrade: roundGrade(grade.CalculatedPresentationGrade),
          bookGrade: roundGrade(grade.CalculatedBookGrade),
          supervisorGrade: roundGrade(grade.CalculatedSupervisorGrade),
          finalGrade: roundGrade(grade.finalGrade),
          status: grade.status || "Not graded",
          deadline,
        });
  
        return result;
      }, []);
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
  
        // Run all form evaluations in parallel
        const formIDs = [
          "SupervisorForm",
          "PresentationFormA",
          "PresentationFormB",
          "bookReviewerFormA",
          "bookReviewerFormB",
        ];
  
        try {
          const evaluationsResponses = await Promise.all(
            formIDs.map((formID) =>
              formsApi.getEvaluations(formID).catch((error) => {
                console.error(`Error fetching evaluations for formID: ${formID}`, error.message);
                return []; // Return empty array instead of failing
              })
            )
          );
  
          const evaluationsByForm = evaluationsResponses.map((response, index) => {
            const formID = formIDs[index];
  
            const gradesByStudent = response
              ?.filter((evaluation) => evaluation.projectCode === projectCode)
              .reduce((acc, evaluation) => {
                Object.entries(evaluation.grades).forEach(([studentID, grade]) => {
                  acc[studentID] = acc[studentID] || [];
                  acc[studentID].push(grade);
                });
                return acc;
              }, {});
  
            return {
              formID,
              grades: Object.entries(gradesByStudent).map(([studentID, grades]) => ({
                studentID,
                grades,
              })),
            };
          });
  
          if (evaluationsByForm.some((form) => form.grades.length > 0)) {
            await gradesApi.addOrUpdateGrade({
              projectCode,
              evaluationsByForm,
            });
          }
        } catch (error) {
          toast.error(`Failed to update grades for project ${projectCode}.`);
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
