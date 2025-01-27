import React, { useState, useEffect, useMemo } from "react";
import { Table } from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import { evaluatorsApi } from "../../services/evaluatorsAPI";
import { projectsApi } from "../../services/projectsAPI";
import { userApi } from "../../services/userAPI";
import { emailAPI } from "../../services/emailAPI";
import LoadingScreen from "../../components/shared/LoadingScreen";
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
    const fetchAndProcessData = async () => {
      try {
        setIsLoading(true);

        // Fetch projects, evaluators, and users
        const [projects, evaluators, users] = await Promise.all([
          projectsApi.getAllProjects(),
          evaluatorsApi.getAllEvaluators(), // Replace with the actual API call for evaluators
          userApi.getAllUsers(),
        ]);

        console.log("Projects:", projects);
        console.log("Evaluators:", evaluators);
        console.log("Users:", users);

        // Process data for the table
        const processedData = preprocessProjects(projects, evaluators, users);
        setProjects(processedData);
      } catch (error) {
        console.error("Error fetching and processing data:", error);
        setError("Failed to fetch project data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndProcessData();
  }, []);

  const preprocessProjects = (projects, evaluators, users) => {
    const processedRows = [];

    projects.forEach((project) => {
      const projectEvaluators = evaluators.filter(
        (evaluator) => evaluator.projectCode === project.projectCode
      );

      projectEvaluators.forEach((evaluator) => {
        const evaluatorUser = users.find(
          (user) => user.email === evaluator.evaluatorID
        );

        processedRows.push({
          projectCode: project.projectCode,
          evaluatorName: evaluatorUser?.fullName || evaluator.evaluatorID,
          presentationGrade:
            evaluator.formID.startsWith("Presentation") &&
            evaluator.status === "Submitted"
              ? "✔"
              : evaluator.formID.startsWith("Presentation")
              ? "✘"
              : "",
          bookGrade:
            evaluator.formID.startsWith("bookReviewer") &&
            evaluator.status === "Submitted"
              ? "✔"
              : evaluator.formID.startsWith("bookReviewer")
              ? "✘"
              : "",
          supervisorGrade:
            evaluator.formID === "SupervisorForm" &&
            evaluator.status === "Submitted"
              ? "✔"
              : evaluator.formID === "SupervisorForm"
              ? "✘"
              : "",
          deadline: project.deadline
            ? new Date(project.deadline).toLocaleDateString()
            : "No Deadline",
        });
      });
    });

    return processedRows;
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
    try {
      // Trim the email message and allow sending null if empty
      const reminderMessage = emailMessage.trim() || null;

      // Call the email API to send reminders
      await emailAPI.sendRemindersToAll(reminderMessage);

      toast.success("Reminders sent successfully.");

      // Clear the message input after sending reminders
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
        className: "text-lg text-center",
        sortable: true,
      },
      {
        key: "evaluatorName",
        header: "Evaluator Name",
        className: "text-lg text-center",
        sortable: true,
      },
      {
        key: "presentationGrade",
        header: "Presentation Grade",
        className: "text-lg text-center",
        render: (value) => (value === "✔" ? "✔" : value === "✘" ? "✘" : ""),
      },
      {
        key: "bookGrade",
        header: "Book Grade",
        className: "text-lg text-center",
        render: (value) => (value === "✔" ? "✔" : value === "✘" ? "✘" : ""),
      },
      {
        key: "supervisorGrade",
        header: "Supervisor Grade",
        className: "text-lg text-center",
        render: (value) => (value === "✔" ? "✔" : value === "✘" ? "✘" : ""),
      },
      {
        key: "deadline",
        header: "Deadline",
        className: "text-lg text-center",
        render: (value) => value || "No Deadline",
        sortable: true,
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <LoadingScreen
        isLoading={isLoading}
        description="Loading projects' remainders..."
      />
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const tableData = projects;

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Set Deadline Section */}
      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg mb-8">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold">Set Deadline</h1>
          <p className="text-gray-600 mt-1">
            Manage the global deadline for all projects.
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Deadline:
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="border p-2 rounded-md w-200"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email Message (Optional):
            </label>
            <p className="text-gray-500 text-base mb-2">
              If no text message is added, the following message will be sent:{" "}
              <br />
              <em>
                "A new deadline has been set for project submissions. Please log
                in to the system to view the details."
              </em>
            </p>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email Message (Optional):
            </label>
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
        {/* Reminders Section */}
        <div className="p-6 border-t border-gray-200 flex flex-col space-y-6">
          {/* Reminder Message */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Reminder Message:
            </label>
            <p className="text-gray-500 text-base mb-2">
              If no text message is added, the following default message will be
              sent:
              <br />
              <em>
                "This is a reminder to review the project's status. Please log
                in to the system to take action."
              </em>
            </p>
            <textarea
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              placeholder="Enter a custom reminder message for supervisors."
              className="border p-2 rounded-md w-full"
              rows="4"
            />
          </div>

          {/* Send Reminder Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSendReminders}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Send Reminders
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg mt-8">
        {/* Title Section for the Table */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold">Projects Evaluators and Grades</h1>
          <p className="text-gray-600 mt-1">
            Overview of evaluators, deadlines, and grades for all projects.
          </p>
        </div>

        {/* Table Section */}
        <div className="p-6 overflow-x-auto">
          {projects.length === 0 ? (
            <div className="text-gray-500">
              No projects available to display.
            </div>
          ) : (
            <Table
              data={tableData}
              columns={projectColumns}
              rowClassName="hover:bg-gray-50 transition duration-200"
              useCustomColumns={false}
              className="table-auto min-w-full"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReminders;
