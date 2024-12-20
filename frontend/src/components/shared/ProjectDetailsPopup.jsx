import React, { useEffect } from 'react';
import { Button } from '../ui/Button';
import { X } from 'lucide-react';

const ProjectDetailsPopup = ({
  project,
  onClose,
  personalNotes,
  setPersonalNotes,
  handleSaveNotes,
  userRole,
  handleEmailStudents,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50"
        onClick={onClose}
      />
      
      {/* Modal Dialog */}
      <div 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-5xl max-h-[85vh] bg-white rounded-xl shadow-xl z-50 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900 pr-8">{project.title}</h2>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)]">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-600">{project.description}</p>
                </div>

                {/* Students */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Students</h3>
                  <div className="space-y-3">
                    {project.students.map((student, index) => (
                      <div
                        key={index}
                        className="bg-blue-50 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-gray-500 text-sm">ID: {student.id}</p>
                        </div>
                        <p className="text-gray-600 text-sm">{student.email}</p>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleEmailStudents}
                    className="mt-4 inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-600 h-9 rounded-full px-4"
                  >
                    Email All Students
                  </Button>
                </div>

                {/* Personal Notes - Only visible to supervisors */}
                {userRole === 'supervisor' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Notes</h3>
                    <textarea
                      value={personalNotes}
                      onChange={(e) => setPersonalNotes(e.target.value)}
                      className="w-full border rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                      placeholder="Add your personal notes here..."
                    />
                    <Button
                      onClick={handleSaveNotes}
                      className="mt-2 bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                    >
                      Save Notes
                    </Button>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Project Details */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Project Code</p>
                      <p className="font-medium text-gray-900">{project.projectCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Part</p>
                      <p className="font-medium text-gray-900">{project.part}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Deadline</p>
                      <p className="font-medium text-gray-900">{project.deadline}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Git Link</p>
                      {project.gitLink ? (
                        <a
                          href={project.gitLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline font-medium"
                        >
                          View Repository
                        </a>
                      ) : (
                        <span className="text-gray-500">Missing Link</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Supervisor */}
                <div className="bg-yellow-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Supervisor</h3>
                  <p className="text-gray-900 font-medium mb-3">{project.supervisor}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.supervisorTopics?.map((topic, index) => (
                      <span
                        key={index}
                        className="bg-yellow-100 text-yellow-800 text-sm px-2.5 py-1 rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Special Notes */}
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Special Notes</h3>
                  <p className="text-gray-600">
                    {project.specialNotes || 'No special notes available.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetailsPopup;

