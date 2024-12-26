import React, { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { X, Edit3 } from "lucide-react";

const ProjectDetailsPopup = ({
  project,
  onClose,
  handleEmailStudents,
  saveGitLinkToBackend,
  saveNotesToBackend,
  userRole,
}) => {
  const [personalNotes, setPersonalNotes] = useState(project.personalNotes || "");
  const [gitLink, setGitLink] = useState(project.gitLink || "");
  const [isEditingGitLink, setIsEditingGitLink] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSaveGitLink = async () => {
    if (gitLink.trim()) {
      await saveGitLinkToBackend(project.id, gitLink);
      alert("Git link saved successfully!");
      setIsEditingGitLink(false);
    } else {
      alert("Please enter a valid Git link.");
    }
  };

  const handleSaveNotes = async () => {
    await saveNotesToBackend(project.id, personalNotes);
    alert("Notes saved successfully!");
  };

  return (
    <>
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
          <h2 className="text-2xl font-bold text-gray-800">{project.title}</h2>
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
                <p className="text-gray-600 text-base leading-relaxed">
                  {project.description || "No description available."}
                </p>
              </div>

              {/* Students Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Students
                </h3>
                <div className="space-y-4">
                  {project.students.map((student, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 rounded-md p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {student.name}
                        </p>
                        <p className="text-base text-gray-500">ID: {student.id}</p>
                      </div>
                      <p className="text-base text-gray-600">{student.email}</p>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleEmailStudents}
                  className="mt-4 w-full lg:w-auto bg-blue-500 hover:bg-blue-600 text-white text-base font-medium rounded-md px-4 py-2 shadow-sm transition"
                >
                  Email All Students
                </Button>
              </div>

              {/* Personal Notes */}
              {userRole === "Supervisor" && (
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
                    Save Notes
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
                    <p className=" text-gray-500">Project Code</p>
                    <p className="text-gray-800 font-medium">
                      {project.projectCode}
                    </p>
                  </div>
                  <div>
                    <p className=" text-gray-500">Part</p>
                    <p className="text-gray-800 font-medium">{project.part}</p>
                  </div>
                  <div>
                    <p className=" text-gray-500">Deadline</p>
                    <p className="text-gray-800 font-medium">
                      {project.deadline}
                    </p>
                  </div>
                  <div>
                    <p className=" text-gray-500">Git Link</p>
                    {isEditingGitLink ? (
                      <div className="flex flex-col items-start">
                        <input
                          type="url"
                          className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none text-gray-700 py-1 text-sm placeholder-gray-400 transition"
                          placeholder="Enter Git link"
                          value={gitLink}
                          onChange={(e) => setGitLink(e.target.value)}
                        />
                        <div className="flex justify-end w-full">
                          <Button
                            onClick={handleSaveGitLink}
                            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md px-3 py-1 text-sm shadow-sm transition"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    
                    ) : gitLink ? (
                      <a
                        href={gitLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline font-medium"
                      >
                        View Repository
                      </a>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Missing</span>
                        <button
                          onClick={() => setIsEditingGitLink(true)}
                          className="text-blue-500 hover:underline text-sm font-medium flex items-center"
                        >
                          <Edit3 className="h-4 w-4 mr-1" /> Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Supervisor Section */}
              <div className="bg-yellow-50 rounded-md p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Supervisors
                </h3>
                <p className="font-medium text-gray-800 mb-3">
                  {project.supervisor}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.supervisorTopics?.map((topic, index) => (
                    <span
                      key={index}
                      className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2 py-1 rounded"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Special Notes Section */}
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
    </>
  );
};

export default ProjectDetailsPopup;
