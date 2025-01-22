import React, { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { X, Edit3 } from "lucide-react";
import { userApi } from "../../services/userAPI.js";
import { useAuth } from "../../context/AuthContext";

const ProjectDetailsPopup = ({ project, onClose, userRole, api }) => {
  const { user } = useAuth();
  const [personalNotes, setPersonalNotes] = useState(
    project.personalNotes || ""
  );
  const [gitLink, setGitLink] = useState(project.gitLink || "");
  const [isEditingGitLink, setIsEditingGitLink] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedTitle, setEditedTitle] = useState(project.title || "");
  const [editedDescription, setEditedDescription] = useState(
    project.description || ""
  );

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const supervisorIds = [project.supervisor1, project.supervisor2].filter(
          Boolean
        );
        console.log("Supervisor IDs to fetch:", supervisorIds);

        const fetchedSupervisors = await Promise.all(
          supervisorIds.map(async (id) => {
            try {
              const userResponse = await userApi.getUser(id);
              console.log(
                `Fetched supervisor data for ID ${id}:`,
                userResponse
              );
              return userResponse.fullName || `Supervisor with ID: ${id}`;
            } catch (error) {
              console.error(`Error fetching supervisor with ID ${id}:`, error);
              return `Supervisor with ID: ${id}`;
            }
          })
        );

        console.log("Fetched Supervisors:", fetchedSupervisors);
        setSupervisors(fetchedSupervisors);
      } catch (error) {
        console.error("Error fetching supervisors:", error);
      }
    };

    fetchSupervisors();
  }, [project]);

  const isAdminOrSupervisor =
    user.isAdmin === true ||
    user.id === project.supervisor1 ||
    user.id === project.supervisor2;

  const handleSaveGitLink = async () => {
    if (gitLink.trim()) {
      try {
        await api.updateProject(project.id, { gitLink });
        alert("Git link saved successfully!");
        setIsEditingGitLink(false);
      } catch (error) {
        console.error("Error saving Git link:", error);
        alert("Failed to save Git link.");
      }
    } else {
      alert("Please enter a valid Git link.");
    }
  };

  const handleSaveNotes = async () => {
    try {
      await api.updateProject(project.id, { personalNotes });
      alert("Notes updated successfully!");
    } catch (error) {
      console.error("Error saving notes:", error);
      alert("Failed to save notes.");
    }
  };

  const handleSaveDetails = async () => {
    try {
      await api.updateProject(project.id, {
        title: editedTitle,
        description: editedDescription,
      });
      alert("Project details updated successfully!");
      setIsEditingDetails(false);
    } catch (error) {
      console.error("Error saving project details:", error);
      alert("Failed to save project details.");
    }
  };

  const handleEmailStudents = () => {
    const studentEmails = [
      project.Student1?.Email || project.Student1?.email,
      project.Student2?.Email || project.Student2?.email,
    ]
      .filter(Boolean)
      .join(",");

    if (studentEmails) {
      const subject = encodeURIComponent(`Regarding Project: ${project.title}`);
      const body = encodeURIComponent(
        `Dear students,\n\nI hope this email finds you well. I wanted to discuss your project "${project.title}".\n\nBest regards,\n${user?.fullName}`
      );

      window.location.href = `mailto:${studentEmails}?subject=${subject}&body=${body}`;
    } else {
      alert("No student emails available.");
    }
  };

  return (
    <div>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Popup Container */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-4xl max-h-[85vh] bg-white rounded-lg shadow-lg z-50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <X className="h-6 w-6 text-gray-600" />
        </button>

        {/* Header */}
        <div className="p-6 border-b bg-gray-100">
          {isEditingDetails ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="text-2xl font-bold text-gray-800 border-b border-gray-300 focus:border-blue-500 focus:outline-none transition w-full"
            />
          ) : (
            <h2 className="text-2xl font-bold text-gray-800">
              {project.title}
            </h2>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-96px)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Description
                </h3>
                {isEditingDetails ? (
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-700 text-base leading-relaxed">
                    {project.description || "No description available."}
                  </p>
                )}
              </div>
              {isAdminOrSupervisor&& !isEditingDetails && (
                <button
                  onClick={() => setIsEditingDetails(true)}
                  className="text-blue-500 hover:underline text-sm font-medium flex items-center"
                >
                  <Edit3 className="h-4 w-4 mr-1" /> Edit Project Details
                </button>
              )}

              {isEditingDetails && (
                <div className="flex items-center gap-4 mt-2">
                  <Button
                    onClick={handleSaveDetails}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => setIsEditingDetails(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {/* Students Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Students
                </h3>
                <div className="space-y-4">
                  {[project.Student1, project.Student2].map(
                    (student, index) =>
                      student && (
                        <div
                          key={index}
                          className="bg-blue-50 rounded-md p-4 flex flex-col gap-2"
                        >
                          <p className="font-semibold text-lg text-gray-800">
                            {student.fullName}
                          </p>
                          <p className="text-base text-gray-700">
                            ID: {student.ID}
                          </p>
                          <div>
                            <p className="text-base text-gray-700">
                              Email:{" "}
                              {student.Email ||
                                student.email ||
                                "No email provided"}
                            </p>
                          </div>
                        </div>
                      )
                  )}
                </div>
                <Button
                  onClick={handleEmailStudents}
                  className="mt-4 w-full lg:w-auto bg-blue-500 hover:bg-blue-600 text-white text-base font-medium rounded-md px-4 py-2 shadow-sm transition"
                >
                  Email All Students
                </Button>
              </div>

              {/* Personal Notes */}
              {userRole === "Supervisor" &&
                (project.supervisor1 === user?.id ||
                  project.supervisor2 === user?.id) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Personal Notes
                    </h3>
                    <textarea
                      value={personalNotes}
                      onChange={(e) => setPersonalNotes(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                      rows={4}
                      placeholder="Add your personal notes here..."
                    />
                    <Button
                      onClick={handleSaveNotes}
                      className="mt-3 w-full lg:w-auto bg-green-500 hover:bg-green-600 text-white text-base font-medium rounded-md px-4 py-2 shadow-sm transition"
                    >
                      Save My Notes
                    </Button>
                  </div>
                )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Project Details */}
              <div className="bg-gray-50 rounded-md p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Project Details
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <p className="text-gray-500">Project Code</p>
                    <p className="text-gray-800 font-medium">
                      {project.projectCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Part</p>
                    <p className="text-gray-800 font-medium">{project.part}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Deadline</p>
                    <p className="text-gray-800 font-medium">
                      {project.deadline
                        ? typeof project.deadline === "object" &&
                          project.deadline._seconds !== undefined
                          ? new Date(
                              project.deadline._seconds * 1000
                            ).toLocaleDateString()
                          : new Date(project.deadline).toLocaleDateString()
                        : "No deadline provided"}
                    </p>
                  </div>

                  <div>
  <p className="text-gray-500">Git Link</p>
  {isEditingGitLink ? (
    <div className="flex flex-col items-start">
      <input
        type="url"
        className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none text-gray-700 py-1 text-sm placeholder-gray-400 transition"
        placeholder="Enter Git link"
        value={gitLink}
        onChange={(e) => setGitLink(e.target.value)}
      />
      <Button
        onClick={handleSaveGitLink}
        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md px-3 py-1 text-sm shadow-sm transition"
      >
        Save
      </Button>
    </div>
  ) : gitLink ? (
    <div>
      <a
        href={gitLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline font-medium"
      >
        View Repository
      </a>
      {isAdminOrSupervisor && ( // Only show Edit button to admins or moderators
        <button
          onClick={() => setIsEditingGitLink(true)}
          className="text-blue-500 hover:underline text-sm font-medium flex items-center"
        >
          <Edit3 className="h-4 w-4 mr-1" /> Edit Link
        </button>
      )}
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <span className="text-gray-600">Missing</span>
      {isAdminOrSupervisor && ( // Only show Add button to admins or supervisors
        <button
          onClick={() => setIsEditingGitLink(true)}
          className="text-blue-500 hover:underline text-sm font-medium flex items-center"
        >
          <Edit3 className="h-4 w-4 mr-1" /> Add Link
        </button>
      )}
    </div>
  )}
</div>

                </div>
              </div>
              <div className="col-span-2 bg-yellow-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Supervisors
                </h3>
                {supervisors.length > 0 ? (
                  supervisors.map((supervisor, index) => (
                    <p key={index} className="text-gray-800 font-medium mt-1">
                      {supervisor}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-600">No supervisors assigned.</p>
                )}
              </div>
              {/* Special Notes */}
              <div className="bg-green-50 rounded-md p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Special Notes
                </h3>
                <p className="text-gray-600">
                  {project.specialNotes || "No special notes available."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPopup;
