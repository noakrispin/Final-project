import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { BlurElements } from "../components/shared/BlurElements";
import ProjectDetailsPopup from "../components/shared/ProjectDetailsPopup";
import { TableOption1, TableOption2 } from "../components/ui/TableOptions";
import { Button } from "../components/ui/Button";
import { getGrade } from "../utils/getGrade";
import { Tooltip } from "react-tooltip";

const TABS = ["My Projects", "Other Projects"];
const FILTERS = ["All", "Part A", "Part B"];

const MyProjectsReview = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [projectsFilter, setProjectsFilter] = useState("All");
  const [searchProjects, setSearchProjects] = useState("");
  const [projects, setProjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTableOption, setSelectedTableOption] = useState("option1");
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formSubmitted, setFormSubmitted] = useState(false);

  const navigateToForm = useCallback(
    (formType, project, studentName = null) => {
      const formPath =
        formType === "presentation"
          ? `presentation-${project.part.toLowerCase()}`
          : formType;
      const queryParams = new URLSearchParams({
        projectCode: project.projectCode,
        projectName: project.title,
        students: JSON.stringify(project.students),
        studentName: studentName || "",
      }).toString();
      navigate(`/evaluation-forms/${formPath}?${queryParams}`);
    },
    [navigate]
  );

  useEffect(() => {
    if (location.state?.formSubmitted) {
      setFormSubmitted(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const [projectsData, gradesData] = await Promise.all([
          api.getProjects(),
          api.getGrades(),
        ]);

        const filteredProjects = projectsData.filter(
          (project) => project.supervisor === user.fullName
        );

        setProjects(filteredProjects);
        setGrades(gradesData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setIsLoading(false);
        setFormSubmitted(false);
      }
    };

    fetchData();
  }, [user, formSubmitted]);

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    const [day, month, year] = deadline.split("/");
    return new Date(`${year}-${month}-${day}`) < new Date();
  };

  const progressStats = useMemo(() => {
    const total = projects.length;
    const graded = projects.filter((project) => {
      const supervisorGrade = getGrade(
        grades,
        project.projectCode,
        "supervisor"
      );
      const presentationGrade = getGrade(
        grades,
        project.projectCode,
        "presentation"
      );
      return supervisorGrade !== null && presentationGrade !== null;
    }).length;

    return { graded, total };
  }, [projects, grades]);

  const getProgressBarColor = (progress) => {
    if (progress === 100) return "bg-green-500";
    if (progress > 0) return "bg-blue-500";
    return "bg-red-500";
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleClosePopup = () => {
    setSelectedProject(null);
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
      `Dear students,\n\nI hope this email finds you well. I wanted to discuss your project "${selectedProject.title}".\n\nBest regards,\n${user.fullName}`
    );

    window.location.href = `mailto:${studentEmails}?subject=${subject}&body=${body}`;
  };

  const saveGitLinkToBackend = async (projectId, gitLink) => {
    try {
      await api.updateProjectGitLink(projectId, gitLink);
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === projectId ? { ...project, gitLink } : project
        )
      );
    } catch (error) {
      console.error("Error saving Git link:", error);
    }
  };

  const saveNotesToBackend = async (projectId, notes) => {
    try {
      await api.updateProjectNotes(projectId, notes);
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === projectId
            ? { ...project, personalNotes: notes }
            : project
        )
      );
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const toggleTableOption = () => {
    setSelectedTableOption((prev) =>
      prev === "option1" ? "option2" : "option1"
    );
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
        render: (students) => (
          <span>{students.map((s) => s.name).join(", ")}</span>
        ),
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
        render: (_, project) => {
          return project.students.map((student) => {
            const grade = getGrade(
              grades,
              project.projectCode,
              "presentation",
              student.name
            );
            return (
              <span key={student.name} className="mx-1">
                {grade !== null ? (
                  isDeadlinePassed(project.deadline) ? (
                    <span>{grade}</span>
                  ) : (
                    <button
                      className="text-blue-900 hover:underline cursor-pointer"
                      onClick={() =>
                        navigateToForm("presentation", project, student.name)
                      }
                    >
                      {grade || "Grade"}
                    </button>
                  )
                ) : (
                  "Pending"
                )}
              </span>
            );
          });
        },
        sortable: true,
      },
      {
        key: "supervisorGrade",
        header: "Supervisor Grade",
        className: "text-lg text-center",
        render: (_, project) => {
          return project.students.map((student) => {
            const grade = getGrade(
              grades,
              project.projectCode,
              "supervisor",
              student.name
            );
            return (
              <span key={student.name} className="mx-1">
                {grade !== null ? (
                  isDeadlinePassed(project.deadline) ? (
                    <span>{grade}</span>
                  ) : (
                    <button
                      className="text-blue-900 hover:underline cursor-pointer"
                      onClick={() =>
                        navigateToForm("supervisor", project, student.name)
                      }
                    >
                      {grade || "Grade"}
                    </button>
                  )
                ) : (
                  "Pending"
                )}
              </span>
            );
          });
        },
        sortable: true,
      },
      {
        key: "deadline",
        header: "Deadline",
        className: "text-lg text-center",
        render: (deadline) => (isDeadlinePassed(deadline) ? "Passed" : deadline),
        sortable: true,
      },
    ],
    [grades]
  );

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
            <h1 className="text-2xl font-bold">My Projects To Review</h1>
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
                      (progressStats.graded / progressStats.total) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <p className="text-base text-gray-600 mt-2 text-center">
                {`${progressStats.graded}/${progressStats.total} Final Grades Submitted`}
              </p>
            </div>
          </div>

          <Button
            onClick={toggleTableOption}
            variant="outline"
            size="sm"
            className="mb-4"
          >
            Toggle Table View
          </Button>

          {selectedTableOption === "option1" ? (
            <TableOption1
              data={projects}
              columns={myProjectColumns}
              onRowClick={handleProjectClick}
              grades={grades}
              navigateToForm={navigateToForm} // Pass the navigation function
            />
          ) : (
            <TableOption2
              data={projects}
              columns={myProjectColumns}
              onRowClick={handleProjectClick}
              grades={grades}
              navigateToForm={navigateToForm} // Pass the navigation function
            />
          )}
        </div>
      </div>

      {selectedProject && (
        <ProjectDetailsPopup
          project={selectedProject}
          onClose={handleClosePopup}
          handleEmailStudents={handleEmailStudents}
          saveGitLinkToBackend={saveGitLinkToBackend}
          saveNotesToBackend={saveNotesToBackend}
          userRole={user?.role}
        />
      )}
    </div>
  );
};

export default MyProjectsReview;
