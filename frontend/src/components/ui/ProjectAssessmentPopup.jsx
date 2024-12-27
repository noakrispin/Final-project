import React, { useState } from "react";
import {X, ChevronDown, ChevronUp } from "lucide-react";



const ProjectAssessmentPopup = ({ project, onClose }) => {
    const [expandedAttendees, setExpandedAttendees] = useState({});
    const [selectedAssessment, setSelectedAssessment] = useState(null);
  
    const toggleAttendee = (attendee) => {
      setExpandedAttendees((prev) => ({
        ...prev,
        [attendee]: !prev[attendee],
      }));
    };
  
    const handleSelectAssessment = (attendee, type) => {
      const evaluations = project.answers?.attendeeEvaluations.find(
        (evaluation) => evaluation.evaluator === attendee
      );
      if (!evaluations) return;
      setSelectedAssessment({
        attendee,
        type,
        details: evaluations[type === "Book Grade" ? "bookReviewerFormA" : "PresentationFormA"],
      });
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-4xl p-6 overflow-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{project.title}</h2>
            <button
              className="text-gray-600 hover:text-gray-800"
              onClick={onClose}
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
  
          {/* Attendees */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Presentation Attendees</h3>
            {project.presentationAttendees.map((attendee, index) => (
              <div key={index} className="mb-4">
                <div
                  className="bg-gray-100 p-4 rounded-lg flex justify-between items-center cursor-pointer"
                  onClick={() => toggleAttendee(attendee)}
                >
                  <span className="text-gray-800 font-medium">{attendee}</span>
                  {expandedAttendees[attendee] ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
  
                {expandedAttendees[attendee] && (
                  <div className="bg-white shadow-md rounded-lg mt-2 p-4">
                    <h4 className="text-lg font-semibold mb-2">Assessments</h4>
                    <ul className="space-y-2">
                      {["Book Grade", "Presentation Grade"].map((type, i) => (
                        <li
                          key={i}
                          className="cursor-pointer text-blue-600 hover:underline"
                          onClick={() => handleSelectAssessment(attendee, type)}
                        >
                          {type}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
  
          {/* Selected Assessment */}
          {selectedAssessment && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-md">
              <h4 className="text-lg font-semibold mb-2">
                {selectedAssessment.type} by {selectedAssessment.attendee}
              </h4>
              <ul className="space-y-2">
                {Object.entries(selectedAssessment.details || {}).map(
                  ([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {value}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default ProjectAssessmentPopup;
  