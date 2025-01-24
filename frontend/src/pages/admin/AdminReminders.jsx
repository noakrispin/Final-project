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
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduledReminder, setScheduledReminder] = useState(null);
  


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
        if (!project) {
          console.warn(`Project not found for grade: ${grade.projectCode}`);
          return null;
        }
  
        const student = project
          ? [project.Student1, project.Student2].find(
              (s) => s && s.ID === grade.studentID
            )
          : null;
  
        // Ensure student object has a fullName fallback
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
                return supervisor
                  ? supervisor.fullName
                  : `${id}`;
              })
          : [];
        const projectSupervisors =
          supervisors.length > 0 ? supervisors.join(", ") : "No Supervisors";
  
        // Use fallback for undefined or missing deadlines
        const deadline =
          project.deadline && project.deadline._seconds
            ? new Date(project.deadline._seconds * 1000).toLocaleDateString()
            : "No Deadline"; // Explicitly indicate that there is no deadline
  
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
          deadline: deadline, // Fallback for undefined deadlines
        };
      }).filter(Boolean); // Filter out null values
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

  // Handle sending reminders
  const handleSendReminders = async () => {
    if (!scheduleDate) {
      toast.error("Please select a schedule date.");
      return;
    }
  
    if (!scheduleTime) {
      toast.error("Please select a schedule time.");
      return;
    }
  
    const scheduleDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`);
  
    // Validate if the combined date and time are valid
    if (isNaN(scheduleDateTime.getTime())) {
      toast.error("Invalid date or time format. Please check your inputs.");
      return;
    }
  
    // Validate if the scheduled date and time are in the future
    if (scheduleDateTime < new Date()) {
      toast.error("Please select a future date and time for scheduling reminders.");
      return;
    }
  
    try {
      await emailAPI.sendRemindersToAll(
        scheduleDateTime.toISOString(), // Send ISO string to API
        emailMessage || "Default reminder message for all users."
      );
  
      // Format the scheduled date and time for display
      const formattedDateTime = new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(scheduleDateTime);
  
      // Update the scheduled reminder state
      setScheduledReminder({
        dateTime: formattedDateTime,
        message: emailMessage || "Default reminder message for all users.",
      });
  
      toast.success(`Reminders scheduled successfully for ${formattedDateTime}.`);
      setScheduleDate("");
      setScheduleTime(""); // Clear time
      setEmailMessage("");
    } catch (error) {
      console.error("Error sending reminders:", error);
      toast.error("Failed to send reminders.");
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
          <p className="text-gray-500 text-base mb-2">
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
          <Button
            onClick={handleSaveDeadline}
            className={`bg-blue-600 text-white px-4 py-2 rounded-lg ${
              deadline ? "hover:bg-blue-700" : "opacity-50 cursor-not-allowed"
            }`}
            disabled={!deadline} // Disable if no deadline is selected
          >
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
          // Added scrollable wrapper
          <div className="overflow-x-auto">
            <Table
              data={tableData}
              columns={projectColumns}
              rowClassName="hover:bg-gray-50 transition duration-200"
              useCustomColumns={false}
              showDescription={true}
              description="add description (in AdminReminders)"
              className="table-auto min-w-full" // Ensure table takes up full width
            />
          </div>
        )}
      </div>

        <div className="p-6 border-t border-gray-200 flex flex-wrap lg:flex-nowrap space-y-6 lg:space-y-0 lg:space-x-8">
          {/* Left Section: Reminder Message */}
          <div className="lg:w-1/2">
            <label className="block text-gray-700 font-medium mb-2">
              Reminder Message (Optional):
            </label>
            <p className="text-gray-500 text-base mb-2">
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

            {/* Right Section: Schedule Reminder Date and Button */}
            <div className="lg:w-1/2 flex flex-col justify-between">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Schedule Reminder Date:
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="border p-2 rounded-md w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Schedule Reminder Time:
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="border p-2 rounded-md w-full"
                />
              </div>
              <div className="mt-4 lg:mt-0 flex justify-end">
              <Button
                onClick={handleSendReminders}
                className={`bg-blue-600 text-white px-4 py-2 rounded-lg ${
                  scheduleDate && scheduleTime ? "hover:bg-blue-700" : "opacity-50 cursor-not-allowed"
                }`}
                disabled={!scheduleDate || !scheduleTime}
              >
                Send Reminders
              </Button>
              </div>
            </div>
          </div>

          {/* Display Scheduled Reminder Info */}
          {scheduledReminder && (
            <div className="bg-green-50 border border-green-400 text-green-700 p-4 rounded-md mt-6">
              <h3 className="font-semibold">Reminder Scheduled</h3>
              <p>
                <strong>Date & Time:</strong> {scheduledReminder.dateTime}
              </p>
              <p>
                <strong>Message:</strong>{" "}
                {scheduledReminder.message !== "Default reminder message for all users."
                  ? scheduledReminder.message
                  : "No custom message provided. A default reminder will be sent."}
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default AdminReminders;
