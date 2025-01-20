import React, { useState, useEffect, useMemo } from "react";
import { Table } from "../../components/ui/Table";
// import { exportToExcelFile } from "../../services/fileProcessingService";
import ProjectDetailsPopup from "../../components/shared/ProjectDetailsPopup";
import ProjectAssessmentPopup from "../../components/ui/ProjectAssessmentPopup";
import { gradesApi } from "../../services/finalGradesAPI";
import { projectsApi } from "../../services/projectsAPI";
import { userApi } from "../../services/userAPI";

const AdminGradesPage = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
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

        console.log("Fetching all users...");
        const users = await userApi.getAllUsers();
        console.log("All users fetched:", users);

        console.log("Processing final grades...");
        const processedData = preprocessProjects(grades, projects, users);
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

  const preprocessProjects = (grades, projects, users) => {
    try {
      console.log("Preprocessing projects with grades, projects, and users...");
      console.log("Grades:", grades);
      console.log("Projects:", projects);
      console.log("Users:", users);

      // Filter out placeholder grades
      const filteredGrades = grades.filter(
        (grade) =>
          grade.projectCode && grade.projectCode !== "placeholderProject"
      );
      console.log("Filtered Grades:", filteredGrades);

      // Map grades to project and user details
      return filteredGrades.map((grade) => {
        const project = projects.find(
          (proj) => proj.projectCode === grade.projectCode
        );
        const student = project
          ? [project.Student1, project.Student2].find(
              (s) => s && s.ID === grade.studentID
            )
          : null;

        // Ensure student object has a fullName fallback
        // Find the student name dynamically
        const studentName = project
          ? [project.Student1, project.Student2]
              .filter((student) => student && student.ID === grade.studentID)
              .map(
                (student) =>
                  student.fullName || `${student.firstName} ${student.lastName}`
              )
              .join(", ") || "Unknown Student"
          : "Unknown Student";

        // Map supervisor IDs to full names from the `users` collection
        const supervisors = project
          ? [project.supervisor1, project.supervisor2]
              .filter((id) => id) // Exclude null or empty supervisor IDs
              .map((id) => {
                const supervisor = users.find((user) => user.id === id);
                return supervisor ? supervisor.fullName : `Supervisor ID ${id}`;
              })
          : [];
        const projectSupervisors =
          supervisors.length > 0 ? supervisors.join(", ") : "No Supervisors";
        const deadline =
          project.deadline && project.deadline._seconds
            ? new Date(project.deadline._seconds * 1000).toLocaleDateString()
            : "No Deadline";

        console.log("Rendering status(in preprocess):", grade.status);

        return {
          ...project, // Include project details
          projectCode: grade.projectCode,
          studentName,
          supervisors: projectSupervisors,
          presentationGrade: grade.CalculatedPresentationGrade || "N/A",
          bookGrade: grade.CalculatedBookGrade || "N/A",
          supervisorGrade: grade.CalculatedSupervisorGrade || "N/A",
          finalGrade: grade.finalGrade || "N/A",
          status: grade.status || "Not graded",
          deadline: deadline,
        };
      });
    } catch (error) {
      console.error("Error preprocessing projects:", error.message);
      throw new Error("Failed to preprocess project data.");
    }
  };

  const renderGradeStatus = (project) => {
    if (!project || !project.status) {
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

    const statusClass =
      statusClasses[project.status] || "bg-gray-100 text-gray-500";
    console.log("Rendering status:", project.status);
    return (
      <span
        className={`inline-block px-3 py-1 text-sm rounded-full text-center ${statusClass}`}
        style={{
          minWidth: "80px",
          whiteSpace: "nowrap",
          lineHeight: "1.5",
        }}
      >
        {project.status}
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
      {
        key: "title",
        header: "Project Title",
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
          console.log("Rendering supervisors:", project.supervisors);
          return project.supervisors || "N/A";
        },
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
        key: "status",
        header: "Grade Status",
        className: "text-base",
        render: (project) => renderGradeStatus(project),
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

  //
  /*
  const handleExport = () => {
    const dataToExport = projects.map((project) => ({
      "ID":project.students?.[0]?.id,
      "Student 1 first Name": project.students?.[0]?.name
      "Student 1 Last Name": project.students?.[0]?.name
      "final Grade": ,
    }));

    exportToExcelFile(dataToExport, "Project_Grades.xlsx");
  };*/

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
    supervisors: project.supervisors,
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
          {/* <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg shadow hover:bg-blue-600 transition"
          >
            Export to Excel
          </button> */}
        </div>

        <div className="overflow-auto p-6">
          <Table
            data={tableData}
            columns={projectColumns}
            rowClassName="hover:bg-gray-50 transition duration-200"
            onRowClick={(row) => setSelectedProject(row)}
            useCustomColumns={false}
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
