import React, { useState, useEffect, useRef } from "react"
import { X, ChevronDown, ChevronUp } from "lucide-react"
import { formsApi } from "../../services/formAPI"

const ProjectAssessmentPopup = ({ project, onClose }) => {
  const [expandedSections, setExpandedSections] = useState({})
  const [expandedQuestions, setExpandedQuestions] = useState({})
  const [bookData, setBookData] = useState({ questions: [], responses: [] })
  const [presentationData, setPresentationData] = useState({
    questions: [],
    responses: [],
  })
  const [loading, setLoading] = useState(true)
  const contentRef = useRef(null)

  useEffect(() => {
    if (project) {
      fetchResponses(project)
    }
  }, [project])

  const getFormIDs = (projectPart) => {
    if (projectPart === "A") {
      return {
        bookForm: "bookReviewerFormA",
        presentationForm: "PresentationFormA",
      }
    }
    if (projectPart === "B") {
      return {
        bookForm: "bookReviewerFormB",
        presentationForm: "PresentationFormB",
      }
    }
    return {}
  }

  const fetchResponses = async (project) => {
    try {
      setLoading(true)
      const { bookForm, presentationForm } = getFormIDs(project.part)

      if (!bookForm || !presentationForm) {
        console.error("Form IDs not found for project part:", project.part)
        return
      }

      // Fetch book form questions and responses
      const bookQuestions = await formsApi.getQuestions(bookForm)
      const bookFormResponses = await formsApi.getResponses(bookForm)
      const filteredBookResponses = bookFormResponses.filter((response) => response.projectCode === project.projectCode)

      // Fetch presentation form questions and responses
      const presentationQuestions = await formsApi.getQuestions(presentationForm)
      const presentationFormResponses = await formsApi.getResponses(presentationForm)
      const filteredPresentationResponses = presentationFormResponses.filter(
        (response) => response.projectCode === project.projectCode,
      )

      setBookData({
        questions: bookQuestions.filter((q) => q.response_type === "textarea"),
        responses: filteredBookResponses,
      })

      setPresentationData({
        questions: presentationQuestions.filter((q) => q.response_type === "textarea"),
        responses: filteredPresentationResponses,
      })
    } catch (error) {
      console.error("Error fetching responses:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const toggleQuestion = (question) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [question]: !prev[question],
    }))
  }

  const renderGeneralResponses = (responses, questionID) => {
    return responses
      .map((response) => response.general?.[questionID])
      .filter((answer) => answer)
      .map((answer, idx) => (
        <li key={idx} className="text-gray-700 mb-2">
          {answer}
        </li>
      ))
  }

  const renderStudentResponses = (responses, questionID) => {
    const studentMap = project.students.reduce((acc, student) => {
      acc[student.id] = student.name
      return acc
    }, {})

    const studentResponses = responses
      .flatMap((response) =>
        Object.entries(response.students || {}).map(([studentID, studentData]) => ({
          studentName: studentMap[studentID] || `Student ID: ${studentID}`,
          value: studentData[questionID],
        })),
      )
      .filter(({ value }) => value)

    return studentResponses.map(({ studentName, value }, idx) => (
      <div key={idx} className="mb-4 bg-gray-50 p-3 rounded-md">
        <h6 className="font-medium text-gray-800 mb-2">{studentName}</h6>
        <p className="text-gray-700">{value}</p>
      </div>
    ))
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <p className="text-lg font-semibold">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-4xl flex flex-col max-h-[90vh]">
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 flex justify-between items-center rounded-lg shadow-lg ">
          <h2 className="text-2xl font-bold text-gray-800">"{project.title}" Assessment</h2>
          <button className="text-gray-600 hover:text-gray-800 transition-colors" onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="overflow-y-auto flex-grow p-6" ref={contentRef}>
          {/* Book Section */}
          <div className="mb-6">
            <div
              className="bg-blue-50 p-4 rounded-lg flex justify-between items-center cursor-pointer transition-colors hover:bg-blue-100"
              onClick={() => toggleSection("book")}
            >
              <h3 className="text-lg font-semibold text-blue-800">Book Form Responses</h3>
              {expandedSections["book"] ? (
                <ChevronUp className="h-5 w-5 text-blue-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-blue-500" />
              )}
            </div>
            {expandedSections["book"] && (
              <div className="mt-4 space-y-4">
                {bookData.questions.map(({ title, id }) => (
                  <div key={id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div
                      className="bg-gray-50 p-3 cursor-pointer flex justify-between items-center"
                      onClick={() => toggleQuestion(id)}
                    >
                      <h4 className="font-medium text-gray-800">{title}</h4>
                      {expandedQuestions[id] ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    {expandedQuestions[id] && (
                      <div className="p-4 bg-white">
                        <h5 className="font-medium mb-2 text-gray-700"></h5>
                        <ul className="list-disc pl-5 mb-4">
                          {renderGeneralResponses(bookData.responses, id).length > 0 ? (
                            renderGeneralResponses(bookData.responses, id)
                          ) : (
                            <li className="text-gray-500 italic">No responses available</li>
                          )}
                        </ul>
                        {renderStudentResponses(bookData.responses, id).length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2 text-gray-700"></h5>
                            {renderStudentResponses(bookData.responses, id)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Presentation Section */}
          <div>
            <div
              className="bg-green-50 p-4 rounded-lg flex justify-between items-center cursor-pointer transition-colors hover:bg-green-100"
              onClick={() => toggleSection("presentation")}
            >
              <h3 className="text-lg font-semibold text-green-800">Presentation Form Responses</h3>
              {expandedSections["presentation"] ? (
                <ChevronUp className="h-5 w-5 text-green-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-green-500" />
              )}
            </div>
            {expandedSections["presentation"] && (
              <div className="mt-4 space-y-4">
                {presentationData.questions.map(({ title, id }) => (
                  <div key={id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div
                      className="bg-gray-50 p-3 cursor-pointer flex justify-between items-center"
                      onClick={() => toggleQuestion(id)}
                    >
                      <h4 className="font-medium text-gray-800">{title}</h4>
                      {expandedQuestions[id] ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    {expandedQuestions[id] && (
                      <div className="p-4 bg-white">
                        {renderStudentResponses(presentationData.responses, id).length > 0 ? (
                          <div>
                            <h5 className="font-medium mb-2 text-gray-700"></h5>
                            {renderStudentResponses(presentationData.responses, id)}
                          </div>
                        ) : (
                          <ul className="list-disc pl-5">
                            {renderGeneralResponses(presentationData.responses, id).length > 0 ? (
                              <>
                                <h5 className="font-medium mb-2 text-gray-700"></h5>
                                {renderGeneralResponses(presentationData.responses, id)}
                              </>
                            ) : (
                              <li className="text-gray-500 italic">No responses available</li>
                            )}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectAssessmentPopup

