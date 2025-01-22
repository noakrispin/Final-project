import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { evaluatorsApi } from "../services/evaluatorsAPI";
import { formsApi } from "../services/formAPI";
import { BlurElements } from "../components/shared/BlurElements";
import ProjectDetailsPopup from "../components/shared/ProjectDetailsPopup";
import { Table } from "../components/ui/Table";
import { getGrade } from "../utils/getGrade";
import { formatDate } from "../utils/dateUtils";
import { Card } from "../components/ui/Card";

const TABS = ["My Projects", "Other Projects"];

const OtherProjectsReview = () => {
  const [activeTab, setActiveTab] = useState(TABS[1]);
  const [projects, setProjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.id) {
        console.error("User or Evaluator ID is missing.");
        return;
      }

      try {
        setIsLoading(true);

        const formIDs = [
          "PresentationFormA",
          "PresentationFormB",
          "bookReviewerFormA",
          "bookReviewerFormB",
        ];

        const allProjects = [];

        for (const formID of formIDs) {
          try {
            console.log(`Fetching projects for formID: ${formID}`);
            const response = await evaluatorsApi.getProjectsForEvaluatorByForm(
              user.id,
              formID
            );
            if (Array.isArray(response) && response.length > 0) {
              console.log(`Valid projects found for ${formID}:`, response);
              allProjects.push(...response);
            } else {
              console.warn(`No valid projects found for formID: ${formID}`);
            }
          } catch (error) {
            console.error(
              `Error fetching projects for formID ${formID}:`,
              error
            );
          }
        }

        const evaluationsData = await formsApi.getEvaluationsByEvaluator(
          user.id
        );
        console.log("Evaluations Data:", evaluationsData);

        const formattedProjects = allProjects.map((project) => {
          const students = Object.keys(project)
            .filter(
              (key) => key.startsWith("Student") && project[key]?.fullName
            )
            .map((key) => ({
              id: String(project[key]?.ID || ""),
              fullName: project[key]?.fullName || "",
              email: project[key]?.Email || "",
            }))
            .filter((student) => student.id);

          return {
            ...project,
            deadline: project.deadline?._seconds
              ? new Date(project.deadline._seconds * 1000)
              : project.deadline,
            students,
          };
        });

        console.log("Formatted Projects:", formattedProjects);

        setProjects(formattedProjects);
        setGrades(Array.isArray(evaluationsData) ? evaluationsData : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;

    let deadlineDate;

    if (deadline.toDate) {
      deadlineDate = deadline.toDate();
    } else if (typeof deadline === "string" || deadline instanceof Date) {
      deadlineDate = new Date(deadline);
    } else {
      console.error("Invalid deadline format:", deadline);
      return false;
    }

    return deadlineDate < new Date();
  };

  const progressStats = useMemo(() => {
    const total = projects.length;
    const graded = projects.filter((project) => {
      const evaluatorDetails = project.evaluatorDetails || {};
      return evaluatorDetails.status === "Submitted";
    }).length;

    return { graded, total };
  }, [projects]);

  const getProgressBarColor = (progress) => {
    if (progress === 100) return "bg-green-500";
    if (progress > 0) return "bg-blue-500";
    return "bg-red-500";
  };

  const progressPercentage =
    progressStats.total > 0
      ? (progressStats.graded / progressStats.total) * 100
      : 0;

  const handleRowClick = (data, isGradeAction) => {
    if (isGradeAction) {
      const { gradeType, project, studentName } = data;

      let formID;
      if (gradeType === "presentation") {
        formID =
          project.part === "A" ? "PresentationFormA" : "PresentationFormB";
      } else if (gradeType === "book") {
        formID =
          project.part === "A" ? "bookReviewerFormA" : "bookReviewerFormB";
      }

      if (!formID) {
        console.error("Invalid formID for gradeType:", gradeType);
        return;
      }

      const readOnly = isDeadlinePassed(project.deadline);

      const queryParams = new URLSearchParams({
        formID,
        projectCode: project.projectCode,
        projectName: project.title,
        students: JSON.stringify(project.students),
        studentName: studentName || "",
        readOnly: readOnly.toString(),
      }).toString();

      console.log("Navigating to evaluation form with:", {
        formID,
        projectCode: project.projectCode,
        projectName: project.title,
        students: project.students,
        readOnly,
      });

      navigate(`/evaluation-forms/${formID}?${queryParams}&source=evaluation`);
    } else {
      setSelectedProject(data);
    }
  };

  const handleClosePopup = () => {
    setSelectedProject(null);
  };

  const projectColumns = useMemo(
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
            ? students.map((student) => (
                <div key={student.id}>{student.fullName}</div>
              ))
            : "No students",
        sortable: false, // Set sortable to false since sorting by students might not be straightforward
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
        render: (_, project) => renderGradeCell(project, "presentation"),
        sortable: true,
      },
      {
        key: "bookGrade",
        header: "Book Grade",
        className: "text-lg text-center",
        render: (_, project) => renderGradeCell(project, "book"),
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

  const renderGradeCell = (project, gradeType) => {
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
                    tab === "My Projects"
                      ? navigate("/MyProjectsReview")
                      : navigate("/OtherProjectsReview")
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
              Other Projects To Review- {user.fullName}
            </h1>
            <p className="text-gray-600 text-lg mt-2">
              Projects you need to grade as a committee member
            </p>
            <div className="mt-4 mb-6">
              <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full transition-all duration-[1500ms] ${getProgressBarColor(
                    progressPercentage
                  )}`}
                  style={{
                    width: `${progressPercentage}%`,
                  }}
                ></div>
              </div>
              <p className="text-base text-gray-600 mt-2 text-center">
                {progressStats.total > 0
                  ? `${progressStats.graded}/${progressStats.total} Forms Submitted`
                  : "No forms to review"}
              </p>
            </div>
          </div>
          <Card className="p-6">
            <Table
              data={projects}
              apiResponse={grades}
              userId={user?.id}
              isDeadlinePassed={isDeadlinePassed}
              columns={projectColumns}
              onRowClick={handleRowClick}
              showTabs={true}
              useCustomColumns={true}
              showDescription={true}
              description="Click on a row to view project details and grade forms."
            />
          </Card>
        </div>
      </div>

      {selectedProject && (
        <ProjectDetailsPopup
          project={selectedProject}
          onClose={handleClosePopup}
          api={evaluatorsApi}
          userRole={user?.role}
        />
      )}
    </div>
  );
};

export default OtherProjectsReview;
