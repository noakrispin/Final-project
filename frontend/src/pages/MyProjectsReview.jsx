import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectsApi } from "../services/projectsAPI";
import { formsApi } from "../services/formAPI";
import { BlurElements } from "../components/shared/BlurElements";
import ProjectDetailsPopup from "../components/shared/ProjectDetailsPopup";
import { Table } from "../components/ui/Table";
import { getGrade } from "../utils/getGrade";
import { formatDate } from "../utils/dateUtils";

const TABS = ["My Projects", "Other Projects"];


const MyProjectsReview = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [projectsFilter, setProjectsFilter] = useState("All");
  const [searchProjects, setSearchProjects] = useState("");
  const [projects, setProjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    if (location.state?.formSubmitted) {
      setFormSubmitted(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.id) {
        console.error("User or Evaluator ID is missing.");
        return;
      }
  
      try {
        setIsLoading(true);
        console.log("Fetching data...");
  
        // Fetch all projects and evaluations in parallel
        const [projectsData, evaluationsData] = await Promise.all([
          projectsApi.getAllProjects(),
          formsApi.getEvaluationsByEvaluator(user.id),
        ]);
  
        console.log("Projects Data:", projectsData);
        console.log("Evaluations Data:", evaluationsData);
  
        // Ensure evaluationsData is an array
        const safeEvaluationsData = Array.isArray(evaluationsData)
          ? evaluationsData
          : [];
        if (!safeEvaluationsData.length) {
          console.warn("No evaluations found.");
        }
  
        // Format project data with fallback logic for missing fields
        const formattedProjects = projectsData.map((project) => ({
          ...project,
          deadline: project.deadline?._seconds
            ? new Date(project.deadline._seconds * 1000)
            : project.deadline,
          isSupervisor:
            project.supervisor1 === user.id || project.supervisor2 === user.id,
          students: project.students.map((student) => ({
            ...student,
            id: String(student.id), // Ensure student ID is a string
          })),
        }));
  
        console.log("Formatted Projects:", formattedProjects);
  
        // Update state
        setProjects(formattedProjects);
        setGrades(safeEvaluationsData); // Pass raw evaluations data
      } catch (err) {
        console.error("Error fetching data:", err);
  
        // Handle error more explicitly if the response contains error details
        if (err.response) {
          console.error("Response data:", err.response.data);
          console.error("Response status:", err.response.status);
        }
  
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [user]);
  
  

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false; // Return false if deadline is missing

    let deadlineDate;

    // Handle Firestore Timestamp
    if (deadline.toDate) {
      deadlineDate = deadline.toDate();
    } else if (typeof deadline === "string" || deadline instanceof Date) {
      deadlineDate = new Date(deadline);
    } else {
      console.error("Invalid deadline format:", deadline);
      return false; // Return false for invalid formats
    }

    // Check if the deadline has passed
    return deadlineDate < new Date();
  };

  const progressStats = useMemo(() => {
    // Filter projects where the evaluator is the supervisor
    const supervisedProjects = projects.filter(
      (project) =>
        project.supervisor1 === user.id || project.supervisor2 === user.id
    );

    // Total projects to be graded
    const total = supervisedProjects.length;

    // Count projects with a submitted supervisor grade
    const graded = supervisedProjects.filter((project) => {
      const supervisorGrade = getGrade(
        grades,
        project.projectCode,
        "supervisor"
      );
      return supervisorGrade !== null; // Consider it graded if a grade exists
    }).length;

    return { graded, total };
  }, [projects, grades, user]);

  const getProgressBarColor = (progress) => {
    if (progress === 100) return "bg-green-500";
    if (progress > 0) return "bg-blue-500";
    return "bg-red-500";
  };

  const handleRowClick = (data, isGradeAction) => {
    if (isGradeAction) {
      const { gradeType, project, studentName } = data;

      // Dynamically set the formID based on gradeType and project part
      let formID;
      if (gradeType === "supervisor") {
        formID = "SupervisorForm";
      } else if (gradeType === "presentation") {
        formID =
          project.part === "A" ? "PresentationFormA" : "PresentationFormB";
      } else if (gradeType === "book") {
        formID =
          project.part === "A" ? "bookReviewerFormA" : "bookReviewerFormB";
      }

      // Validate formID
      if (!formID) {
        console.error("Invalid formID for gradeType:", gradeType);
        return; // Prevent navigation if formID is not valid
      }

      const queryParams = new URLSearchParams({
        formID, // Pass the resolved formID
        projectCode: project.projectCode,
        projectName: project.title,
        students: JSON.stringify(project.students),
        studentName: studentName || "",
      }).toString();

      navigate(`/evaluation-forms/${formID}?${queryParams}`);
    } else {
      // Open project details
      setSelectedProject(data);
    }
  };

  const handleClosePopup = () => {
    setSelectedProject(null);
  };

  
  const myProjectColumns = useMemo(
    () => [
      {
        key: "projectCode",
        header: "Project Code",
        className: "text-lg text-center",
        sortable: true,
      },
      {
        key: "title",
        header: "Project Title",
        className: "text-lg text-center",
        render: (title) => <span>{title}</span>,
        sortable: true,
      },
      {
        key: "students",
        header: "Students",
        className: "text-lg text-center",
        render: (students) =>
          students && students.length > 0
            ? students.map((s) => s.name).join(", ")
            : "No students",
        sortable: true,
      },
      {
        key: "gitLink",
        header: "Git Link",
        className: "text-lg text-center",
        render: (value, project) =>
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
        sortable: true,
      },
      {
        key: "presentationGrade",
        header: "Presentation Grade",
        className: "text-lg text-center",
        render: (_, project) =>
          renderGradeCell(project, "presentation", grades, user?.id, isDeadlinePassed),
        sortable: true,
      },
      {
        key: "supervisorGrade",
        header: "Supervisor Grade",
        className: "text-lg text-center",
        render: (_, project) =>
          renderGradeCell(project, "supervisor", grades, user?.id, isDeadlinePassed),
        sortable: true,
      },
      {
        key: "deadline",
        header: "Deadline",
        className: "text-lg text-center",
        render: (deadline) =>
          isDeadlinePassed(deadline) ? "Passed" : formatDate(deadline),
        sortable: true,
      },
    ],
    [grades, user]
  );

  const renderGradeCell = (project, gradeType, grades, userId, isDeadlinePassed) => {
    const grade = getGrade(grades, project.projectCode, gradeType);
    if (grade === null) {
      return isDeadlinePassed(project.deadline) ? (
        <span className="text-red-500">Not Submitted</span>
      ) : (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
          onClick={() =>
            handleRowClick({ gradeType, project, studentName: null }, true)
          }
        >
          Grade
        </button>
      );
    }
    return <span>{grade}</span>;
  };


  if (isLoading) return <div className="text-center mt-10">Loading...</div>;
  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="relative bg-white min-h-screen overflow-hidden">
      <BlurElements />

      <div className="relative z-10">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center py-4">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  className={`inline-flex items-center px-3 pt-2 pb-3 border-b-2 text-base font-medium ${
                    activeTab === tab
                      ? "border-blue-900 text-blue-900"
                      : "border-transparent text-gray-500 hover:border-blue-900 hover:text-blue-900"
                  }`}
                  onClick={() =>
                    tab === "Other Projects"
                      ? navigate("/OtherProjectsReview")
                      : setActiveTab(tab)
                  }
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="ml-2 mb-11">
            <h1 className="text-2xl font-bold">
              My Projects To Review - {user.fullName}
            </h1>
            <p className="text-gray-600 text-lg mt-2">
              Projects you need to grade as a supervisor
            </p>
            <div className="mt-4 mb-6">
              <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getProgressBarColor(
                    (progressStats.graded / progressStats.total) * 100
                  )}`}
                  style={{
                    width: `${
                      progressStats.total > 0
                        ? (progressStats.graded / progressStats.total) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <p className="text-base text-gray-600 mt-2 text-center">
                {progressStats.total > 0
                  ? `${progressStats.graded}/${progressStats.total} Supervisor Grades Submitted`
                  : "No projects to grade"}
              </p>
            </div>
          </div>

          <Table
            data={projects}
            evaluationsMapped={grades}
            userId={user?.id}
            isDeadlinePassed={isDeadlinePassed}
            columns={myProjectColumns}
            onRowClick={handleRowClick}
          />
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

export default MyProjectsReview;

