import React, { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { formsApi } from "../../services/formAPI"; 

const ProjectAssessmentPopup = ({ project, onClose }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [bookData, setBookData] = useState({ questions: [], responses: [] });
  const [presentationData, setPresentationData] = useState({ questions: [], responses: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (project) {
      fetchResponses(project);
    }
  }, [project]);

  // Determine form IDs based on project part
  const getFormIDs = (projectPart) => {
    if (projectPart === "A") {
      return {
        bookForm: "bookReviewerFormA",
        presentationForm: "PresentationFormA",
      };
    }
    if (projectPart === "B") {
      return {
        bookForm: "bookReviewerFormB",
        presentationForm: "PresentationFormB",
      };
    }
    return {}; 
  };

  const fetchResponses = async (project) => {
    try {
      setLoading(true);
      const { bookForm, presentationForm } = getFormIDs(project.part);
  
      if (!bookForm || !presentationForm) {
        console.error("Form IDs not found for project part:", project.part);
        return;
      }
      console.log("bookForm",bookForm);
      console.log("presentationForm",presentationForm);

      // Fetch book form responses and questions
      const bookFormResponses = await formsApi.getResponses(bookForm);
      const bookQuestions = await formsApi.getQuestions(bookForm);
      const filteredBookResponses = filterResponsesByProjectCode(bookFormResponses, project.projectCode);
  
      // Fetch presentation form responses and questions
      const presentationFormResponses = await formsApi.getResponses(presentationForm);
      const presentationQuestions = await formsApi.getQuestions(presentationForm);
      const filteredPresentationResponses = filterResponsesByProjectCode(presentationFormResponses, project.projectCode);
  
      // Extract required textarea questions
      setBookData({
        questions: bookQuestions.filter((q) => q.response_type === "textarea" && q.required),
        responses: filteredBookResponses,
      });
  
      setPresentationData({
        questions: presentationQuestions.filter((q) => q.response_type === "textarea" && q.required),
        responses: filteredPresentationResponses,
      });
    } catch (error) {
      console.error("Error fetching responses:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const filterResponsesByProjectCode = (responses, code) => {
    return responses.filter((response) => response.projectCode === code);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleQuestion = (question) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [question]: !prev[question],
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-4xl p-6 overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Project Assessment</h2>
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={onClose}
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Book Section */}
        <div className="mb-6">
          <div
            className="bg-gray-100 p-4 rounded-lg flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("book")}
          >
            <h3 className="text-lg font-semibold">Book Form Responses</h3>
            {expandedSections["book"] ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
          {expandedSections["book"] && (
            <div className="mt-4">
              {bookData.questions.map(({ title, id }, index) => (
                <div key={index} className="mb-4">
                  <div
                    className="bg-gray-200 p-3 rounded-lg cursor-pointer"
                    onClick={() => toggleQuestion(id)}
                  >
                    <h4 className="font-medium">{title}</h4>
                  </div>
                  {expandedQuestions[id] && (
                    <ul className="ml-6 mt-2 list-disc">
                      {bookData.responses.map((response, idx) => (
                        response[id] && (
                          <li key={idx} className="text-gray-700">
                            {response[id]}
                          </li>
                        )
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Presentation Section */}
        <div>
          <div
            className="bg-gray-100 p-4 rounded-lg flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("presentation")}
          >
            <h3 className="text-lg font-semibold">Presentation Form Responses</h3>
            {expandedSections["presentation"] ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
          {expandedSections["presentation"] && (
            <div className="mt-4">
              {presentationData.questions.map(({ title, id }, index) => (
                <div key={index} className="mb-4">
                  <div
                    className="bg-gray-200 p-3 rounded-lg cursor-pointer"
                    onClick={() => toggleQuestion(id)}
                  >
                    <h4 className="font-medium">{title}</h4>
                  </div>
                  {expandedQuestions[id] && (
                    <ul className="ml-6 mt-2 list-disc">
                      {presentationData.responses.map((response, idx) => (
                        response[id] && (
                          <li key={idx} className="text-gray-700">
                            {response[id]}
                          </li>
                        )
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectAssessmentPopup;
