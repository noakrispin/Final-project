import React, { useState, useEffect, useMemo } from "react";
import { Table } from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import { gradesApi } from "../../services/finalGradesAPI";
import { projectsApi } from "../../services/projectsAPI";
import { userApi } from "../../services/userAPI";
import { emailAPI } from "../../services/emailAPI";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminReminders = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deadline, setDeadline] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");


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


  const handleSaveDeadline = async () => {
    if (!deadline) {
      toast.error("Please select a deadline.");
      return;
    }
  
    try {
      const timestamp = new Date(deadline).getTime();
  
      // Include emailMessage in the API call
      await emailAPI.notifyGlobalDeadline(timestamp, emailMessage);
  
      toast.success("Deadline set successfully.");
  
      // Clear the deadline and message box
      setDeadline("");
      setEmailMessage("");
    } catch (error) {
      console.error("Error setting deadline:", error);
      toast.error("Failed to set deadline.");
    }
  };

  const handleSendReminders = async () => {
    if (!scheduleDate) {
      toast.error("Please select a schedule date.");
      return;
    }
    if (new Date(scheduleDate) <= new Date()) {
      toast.error("Please select a future date for scheduling reminders.");
      return;
    }
  
    try {
      // Fetch all supervisor emails
      const supervisorEmails = new Set(
        projects.flatMap((project) => [project.supervisor1, project.supervisor2]).filter(Boolean)
      );
  
      if (supervisorEmails.size === 0) {
        toast.error("No supervisors found to send reminders.");
        return;
      }
  
      // Send the reminder message to the backend
      await emailAPI.sendRemindersToAll(
        Array.from(supervisorEmails),
        scheduleDate,
        emailMessage // Send the custom message or let backend handle default
      );
  
      toast.success("Reminders sent successfully.");
      setScheduleDate(""); // Clear input fields
      setEmailMessage(""); // Clear message box
    } catch (error) {
      console.error("Error sending reminders:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to send reminders.");
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
    ],
    []
  );

  if (isLoading) {
    return <div>Loading project reminders...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const tableData = projects.map((project) => ({
    ...project,
    studentName: project.studentName,
    supervisors: project.supervisors,
  }));

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Set Deadline Section */}
      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg mb-8">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold">Set Deadline</h1>
          <p className="text-gray-600 mt-1">Manage the global deadline for all projects.</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Deadline:</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="border p-2 rounded-md w-full"
            />
          </div>
          <div>
          <label className="block text-gray-700 font-medium mb-2">Email Message (Optional):</label>
          <p className="text-gray-500 text-sm mb-2">
            If no text message is added, the following message will be sent: <br />
            <em>"A new deadline has been set for project submissions. Please log in to the system to view the details."</em>
          </p>
        </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email Message (Optional):</label>
            <textarea
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              placeholder="Enter a custom email message for supervisors."
              className="border p-2 rounded-md w-full"
              rows="4"
            />
          </div>
          <Button onClick={handleSaveDeadline} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Save Deadline
          </Button>
        </div>
      </div>

      {/* Project Reminders Table */}
      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold">Project Reminders</h1>
          <p className="text-gray-600">Manage reminders for all projects.</p>
        </div>

        <div className="p-6">
        {projects.length === 0 ? (
          <div className="text-gray-500">No projects available to display.</div>
          ) : (
            <Table
              data={tableData}
              columns={projectColumns}
              rowClassName="hover:bg-gray-50 transition duration-200"
              useCustomColumns={false}
              showDescription = {true}
              description = "add desciption (in AdminReminders)"
       
            />
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <div>
            <label className="block text-gray-700">Schedule Reminder Date:</label>
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="border p-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Reminder Message (Optional):
            </label>
            <p className="text-gray-500 text-sm mb-2">
              If no text message is added, the following default message will be sent: <br />
              <em>"This is a reminder to review the project's status. Please log in to the system to take action."</em>
            </p>
            <textarea
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              placeholder="Enter a custom reminder message for supervisors."
              className="border p-2 rounded-md w-full"
              rows="4"
            />
          </div>
          <Button onClick={handleSendReminders} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Send Reminders
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminReminders;
