import React, { useState, useEffect, useMemo } from "react";
import { Table } from "../../components/ui/Table";
import { formsApi } from "../../services/formAPI";
import ProjectAssessmentPopup from "../../components/ui/ProjectAssessmentPopup";
import { gradesApi } from "../../services/finalGradesAPI";
import { projectsApi } from "../../services/projectsAPI";
import { evaluatorsApi } from "../../services/evaluatorsAPI";
import { userApi } from "../../services/userAPI";
import { Button } from "../../components/ui/Button";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { LuRefreshCcw } from "react-icons/lu";
import LoadingScreen from "../../components/shared/LoadingScreen";
import "react-toastify/dist/ReactToastify.css";

const AdminGradesPage = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [responses, setResponses] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [formQuestions, setFormQuestions] = useState({});
  const [selectedStatus, setSelectedStatus] = useState("All"); //  Show all statuses by default

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  useEffect(() => {
    const fetchAndProcessGrades = async () => {
      try {
        console.log("Starting data fetch and preprocessing...");

        console.log("Fetching final grades...");
        const gradesResponse = await gradesApi.getAllGrades();
        const grades = gradesResponse || [];

        console.log("Fetching all projects...");
        const projects = await projectsApi.getAllProjects();

        console.log("Fetching all evaluators...");
        const evaluators = await evaluatorsApi.getAllEvaluators();

        console.log("Fetching all users...");
        const users = await userApi.getAllUsers();
        console.log("Fetching all form-related data...");
        const formIDs = [
          "SupervisorForm",
          "PresentationFormA",
          "PresentationFormB",
          "bookReviewerFormA",
          "bookReviewerFormB",
        ];

        let responsesData = {};
        let evaluationsData = {};
        let questionsData = {};

        for (const formID of formIDs) {
          try {
            console.log(`Fetching data for formID: ${formID}`);

            const [responses, evaluations, questions] = await Promise.all([
              formsApi.getResponses(formID),
              formsApi.getEvaluations(formID),
              formsApi.getQuestions(formID),
            ]);

            responsesData[formID] = responses || [];
            evaluationsData[formID] = evaluations || [];
            questionsData[formID] = questions || [];
          } catch (error) {
            console.error(`Error fetching data for ${formID}:`, error.message);
          }
        }

        // Set the state variables
        setResponses(responsesData);
        setEvaluations(evaluationsData);
        setFormQuestions(questionsData);

        console.log("Processing final grades...");
        const processedData = preprocessProjects(
          grades,
          projects,
          users,
          evaluators
        );
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
  }, []);

  const preprocessProjects = (grades, projects, users, evaluators) => {
    try {
      console.log("Preprocessing projects with grades, projects, and users...");

      // Filter out placeholder grades
      const filteredGrades = grades.filter(
        (grade) =>
          grade.projectCode && grade.projectCode !== "placeholderProject"
      );

      // Map grades to project and user details
      return filteredGrades
        .map((grade) => {
          const project = projects.find(
            (proj) => proj.projectCode === grade.projectCode
          );

          if (!project) {
            console.warn(`Project not found for grade: ${grade.projectCode}`);
            return null;
          }

          const student1 = project.Student1 || {};
          const student2 = project.Student2 || {};

          // Find the student's grade
          const student1Grade = filteredGrades.find(
            (g) => g.studentID === student1.ID
          );
          const student2Grade = filteredGrades.find(
            (g) => g.studentID === student2.ID
          );

          // Find the student name dynamically
          const studentName =
            [student1, student2]
              .filter((student) => student && student.ID === grade.studentID)
              .map(
                (student) =>
                  student.fullName || `${student.firstName} ${student.lastName}`
              )
              .join(", ") || "Unknown Student";

          // Map supervisor IDs to full names from the `users` collection
          const supervisors = [project.supervisor1, project.supervisor2]
            .filter((id) => id) // Exclude null or empty supervisor IDs
            .map((id) => {
              const supervisor = users.find((user) => user.emailId === id);
              return supervisor ? supervisor.fullName : ` ${id}`;
            });
          const projectSupervisors =
            supervisors.length > 0 ? supervisors.join(", ") : "No Supervisors";

          const deadline =
            project.deadline && project.deadline._seconds
              ? new Date(project.deadline._seconds * 1000).toLocaleDateString()
              : "No Deadline"; // Use a fallback for undefined deadlines

          // Find book evaluator
          const bookEvaluator = evaluators.find(
            (evaluator) =>
              evaluator.projectCode === grade.projectCode &&
              evaluator.formID.startsWith("bookReviewer")
          );

          let bookEvaluatorName = "N/A";
          if (bookEvaluator) {
            const evaluatorUser = users.find(
              (user) => user.email === bookEvaluator.evaluatorID
            );
            bookEvaluatorName = evaluatorUser
              ? evaluatorUser.fullName
              : bookEvaluator.evaluatorID;
          }

          const roundGrade = (value) =>
            typeof value === "number" ? Math.round(value) : value;
          return {
            ...project, // Include project details
            projectCode: grade.projectCode,
            studentName,
            supervisors: projectSupervisors,
            bookEvaluator: bookEvaluatorName,
            presentationGrade: roundGrade(
              grade.CalculatedPresentationGrade || ""
            ),
            bookGrade: roundGrade(grade.CalculatedBookGrade || ""),
            supervisorGrade: roundGrade(grade.CalculatedSupervisorGrade || ""),
            finalGrade: roundGrade(grade.finalGrade || ""),
            status: grade.status || "Not graded",
            deadline: deadline,
            student1: {
              id: student1.ID,
              firstName: student1.firstName || "",
              lastName: student1.lastName || "",
              finalGrade: roundGrade(student1Grade ? student1Grade.finalGrade : "")
            },
            student2: {
              id: student2.ID,
              firstName: student2.firstName || "",
              lastName: student2.lastName || "",
              finalGrade: roundGrade(student2Grade ? student2Grade.finalGrade : "")
            },
          };
        })
        .filter(Boolean); // Filter out null values
    } catch (error) {
      console.error("Error preprocessing projects:", error.message);
      throw new Error("Failed to preprocess project data.");
    }
  };

  const filteredProjects = useMemo(() => {
    if (selectedStatus === "All") return projects;
    return projects.filter((project) => project.status === selectedStatus);
  }, [projects, selectedStatus]);

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
              // Only process if evaluation.grades exists
              if (evaluation.grades) {
                Object.entries(evaluation.grades).forEach(
                  ([studentID, grade]) => {
                    if (!gradesByStudent[studentID]) {
                      gradesByStudent[studentID] = [];
                    }
                    gradesByStudent[studentID].push(grade);
                  }
                );
              }
            });
            // Create the evaluation entry for this formID
            const evaluationEntry = {
              formID,
              grades: Object.entries(gradesByStudent).map(
                ([studentID, grades]) => ({ studentID, grades })
              ),
            };
      
            // Only push if there is at least one grade recorded
            if (evaluationEntry.grades.length > 0) {
              evaluationsByForm.push(evaluationEntry);
            }
          } catch (error) {
            console.error(
              `Error fetching evaluations for formID: ${formID}`,
              error.message
            );
          }
        }
      
        // Filter evaluationsByForm once more just in case
        const validEvaluationsByForm = evaluationsByForm.filter(
          (entry) => entry.grades && entry.grades.length > 0
        );
      
        if (validEvaluationsByForm.length > 0) {
          try {
            console.log(
              `Updating grades for project ${projectCode} with payload:`,
              { projectCode, evaluationsByForm: validEvaluationsByForm }
            );
            await gradesApi.addOrUpdateGrade(projectCode, { evaluationsByForm });

          } catch (error) {
            toast.error(`Failed to update grades for project ${projectCode}.`);
            console.error(
              `Error updating grades for project ${projectCode}:`,
              error
            );
          }
        }
      }
      toast.success("Grades refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing grades:", error.message);
      toast.error("Failed to refresh grades.");
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        window.location.reload(); // Force full page reload
      }, 500);
    }
  };

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
        key: "supervisors",
        header: "Supervisors",
        className: "text-base",
        render: (_, project) => {
          if (!project.supervisors) return "N/A";
          return (
            <div className="whitespace-pre-line">
              {project.supervisors.split(", ").map((supervisor, index) => (
                <div key={index}>{supervisor}</div>
              ))}
            </div>
          );
        },
      },
      {
        key: "bookEvaluator",
        header: "Book Evaluator",
        className: "text-base",
        render: (value, row) => {
          return (
            <div className="whitespace-pre-line text-center">
              {row.bookEvaluator !== "N/A" ? row.bookEvaluator : "-"}
            </div>
          );
        },
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
        className: "text-base",
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
                : "-"}
            </div>
          );
        },
      },
      {
        key: "finalGrade",
        header: "Final Grade",
        className: "text-base",
        render: (value, row) => {
          return (
            <div className="whitespace-pre-line text-center">
              {" "}
              {row.finalGrade !== undefined && row.finalGrade !== "N/A"
                ? typeof row.finalGrade === "number"
                  ? row.finalGrade
                  : row.finalGrade
                : "-"}
            </div>
          );
        },
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

  // Function to format data for export
  const prepareExportData = (projects) => {
    const exportData = [];
    const seenStudentIds = new Set(); // Track processed student IDs
    projects.forEach((project) => {
      const roundGrade = (value) =>
        typeof value === "number" ? Math.round(value) : value;
      // Ensure final grades come from the correct filtered grades
      const student1FinalGrade = project.student1
        ? project.student1.finalGrade
        : "";
      const student2FinalGrade = project.student2
        ? project.student2.finalGrade
        : "";

      // Add Student 1 data if not already added
      if (project.student1 && !seenStudentIds.has(project.student1.id)) {
        seenStudentIds.add(project.student1.id);
        exportData.push({
          "Student ID": project.student1.id || "",
          "Student Last Name": project.student1.lastName || "",
          "Student First Name": project.student1.firstName || "",
          "Student Final Grade": roundGrade(student1FinalGrade),
        });
      }
      // Add Student 2 data if not already added
      if (project.student2 && !seenStudentIds.has(project.student2.id)) {
        seenStudentIds.add(project.student2.id);
        exportData.push({
          "Student ID": project.student2.id || "",
          "Student Last Name": project.student2.lastName || "",
          "Student First Name": project.student2.firstName || "",
          "Student Final Grade": roundGrade(student2FinalGrade),
        });
      }
    });

    return exportData;
  };

  const prepareResponsesExportData = (
    projects,
    responsesData,
    evaluationsData,
    formQuestions
  ) => {
    const exportData = {}; // Object to store data per formID

    for (const formID in formQuestions) {
      const columns = ["Project Code"]; // Base column
      const generalQuestions = [
        ...formQuestions[formID].filter((q) => q.reference === "general"),
      ].sort((a, b) => a.order - b.order); // Sort by order

      const studentQuestions = [
        ...formQuestions[formID].filter((q) => q.reference === "student"),
      ].sort((a, b) => a.order - b.order); // Sort by order

      // Add general questions as columns in order
      generalQuestions.forEach((q) => columns.push(q.title));

      // Add student-specific columns dynamically
      for (let i = 1; i <= 2; i++) {
        columns.push(`Student ${i} Name`);
        studentQuestions.forEach((q) =>
          columns.push(`Student ${i} - ${q.title}`)
        );
        columns.push(`Student ${i} Final Grade`);
      }

      const sheetData = [columns]; // Store rows as arrays

      // Loop over responses to ensure unique rows per response
      Object.values(responsesData[formID] || []).forEach((response) => {
        const project = projects.find(
          (proj) => proj.projectCode === response.projectCode
        );
        if (!project) return; // Skip if project doesn't exist

        // Find the matching evaluation using evaluatorID
        const evaluationEntry = (evaluationsData[formID] || []).find(
          (e) =>
            e.projectCode === response.projectCode &&
            e.evaluatorID === response.evaluatorID
        );

        let row = [response.projectCode]; // Start row with project code

        // Fill in general question responses in sorted order
        generalQuestions.forEach((q) => {
          row.push(response.general?.[q.id] || "-");
        });

        // Fill in student-specific responses
        [project.student1, project.student2].forEach((student, i) => {
          if (student && student.id) {
            row.push(`${student.firstName} ${student.lastName}`); // Student name

            studentQuestions.forEach((q) => {
              // Ensure response.students and the student entry exist before accessing properties
              const studentResponses = response.students?.[student.id] || {};
              row.push(studentResponses[q.id] || "-");
            });

            // Get the student's grade from the matched evaluation
            const studentGrade = evaluationEntry?.grades?.[student.id] || "-";
            row.push(studentGrade);
          } else {
            row.push("-"); // No student name
            studentQuestions.forEach(() => row.push("-")); // Fill empty responses
            row.push("-"); // No grade
          }
        });

        sheetData.push(row);
      });

      exportData[formID] = sheetData;
    }

    return exportData;
  };

  const handleExportToExcel = () => {
    try {
      // Prepare and export Final Grades Excel
      const exportData = prepareExportData(projects);
      console.log("Export Data:", exportData);
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Final Grades");
      XLSX.writeFile(workbook, "Students_final_grades_export.xlsx");

      toast.success("Grades exported successfully!");

      // Prepare and export Evaluations/Responses Excel
      const responsesExportData = prepareResponsesExportData(
        projects,
        responses,
        evaluations,
        formQuestions
      );

      const responsesWorkbook = XLSX.utils.book_new();
      for (const formID in responsesExportData) {
        const worksheet = XLSX.utils.aoa_to_sheet(responsesExportData[formID]);
        XLSX.utils.book_append_sheet(responsesWorkbook, worksheet, formID);
      }
      XLSX.writeFile(responsesWorkbook, "Project_Evaluations_Export.xlsx");

      toast.success("Project evaluations exported successfully!");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data.");
    }
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

  const tableData = filteredProjects.map((project) => ({
    ...project,
    studentName: project.studentName,
    supervisors: project.supervisors,
  }));

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-full mx-auto bg-white shadow-md rounded-lg">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Project Grades Management
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage grades for all ongoing projects.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            {/* Export to Excel Button */}
            <Button
              onClick={handleExportToExcel}
              className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg text-sm sm:text-base w-full sm:w-auto"
            >
              <span>Export to Excel</span>
            </Button>

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
        </div>

        <div className="overflow-auto p-6">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-gray-700 font-medium">Filter by Status:</span>
            <div className="flex space-x-2">
              {["All", "Fully graded", "Partially graded", "Not graded"].map(
                (status) => {
                  const statusClasses = {
                    "Fully graded":
                      "bg-green-100 text-green-700 hover:bg-green-200",
                    "Partially graded":
                      "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
                    "Not graded": "bg-red-100 text-red-700 hover:bg-red-200",
                    All: "bg-gray-100 text-gray-700 hover:bg-gray-200",
                  };

                  return (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`px-4 py-2 rounded-full font-medium transition ${
                        statusClasses[status]
                      } ${
                        selectedStatus === status
                          ? "ring-2 ring-opacity-50"
                          : ""
                      }`}
                    >
                      {status}
                    </button>
                  );
                }
              )}
            </div>
          </div>

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

export default AdminGradesPage;
