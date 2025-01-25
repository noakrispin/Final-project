import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaTrashAlt, FaPlus } from "react-icons/fa";
import { Button } from "../ui/Button";
import { formsApi } from "../../services/formAPI";

function QuestionEditor({ questions, setQuestions, reference, formID }) {
  const handleAddQuestion = async () => {
    const newQuestion = {
      id: `new_${Date.now()}`,
      questionID: `q_${Date.now()}`,
      title: "New Question",
      description: "",
      order: questions.length + 1,
      reference,
      required: false,
      response_type: "text",
      weight: 0,
    };

    // Optimistic update
    setQuestions((prev) => [...prev, newQuestion]);

    try {
      const response = await formsApi.addQuestion(formID, newQuestion);
      if (!response || !response.id) {
        throw new Error("Failed to add question on the server.");
      }

      // Update local state with server-confirmed data
      const updatedQuestion = { ...newQuestion, id: response.id };
      setQuestions((prev) =>
        prev.map((q) => (q.id === newQuestion.id ? updatedQuestion : q))
      );
    } catch (error) {
      console.error("Error adding question:", error.message);
      alert("Failed to add question. Please try again.");
      // Revert optimistic update
      setQuestions((prev) => prev.filter((q) => q.id !== newQuestion.id));
    }
  };

  const handleDeleteQuestion = async (index) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this question?"
    );
    if (!confirmDelete) return;

    const questionToDelete = questions[index];

    try {
      // Delete from DB if it exists there
      if (!questionToDelete.id.startsWith("new_")) {
        await formsApi.deleteQuestion(formID, questionToDelete.id);
      }
      // Remove from local state
      setQuestions((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting question:", error.message);
      alert("Failed to delete question. Please try again.");
    }
  };

  const handleUpdateQuestion = (index, key, value) => {
    const updatedValue =
      key === "order" || key === "weight" ? Number(value) : value;
  
    const updatedQuestion = { ...questions[index], [key]: updatedValue };
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? updatedQuestion : q))
    );
    console.log("Updated question locally:", updatedQuestion);
  };
  

  return (
    <div className="space-y-6">
        {questions.map((field, index) => (
          <div
            key={field.id || `question-${index}`} // Ensure unique key
            className="p-6 bg-white border border-gray-300 rounded-lg shadow-sm"
          >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl text-blue-900 font-semibold">
              {field.reference} Question #{index + 1}
            </h3>
            <button
              onClick={() => handleDeleteQuestion(index)}
              className="text-red-500 hover:text-red-700 text-2xl"
            >
              <FaTrashAlt />
            </button>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Question Title
            </label>
            <input
              type="text"
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={field.title}
              onChange={(e) =>
                handleUpdateQuestion(index, "title", e.target.value)
              }
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Question Description
            </label>
            <textarea
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={field.description}
              onChange={(e) =>
                handleUpdateQuestion(index, "description", e.target.value)
              }
            />
          </div>

          {/* Other Fields */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Order
              </label>
              <input
                type="number"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={field.order}
                onChange={(e) =>
                  handleUpdateQuestion(index, "order", parseInt(e.target.value))
                }
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Response Type
              </label>
              <select
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={field.response_type}
                onChange={(e) =>
                  handleUpdateQuestion(index, "response_type", e.target.value)
                }
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Weight
              </label>
              <input
                type="number"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={field.weight}
                onChange={(e) =>
                  handleUpdateQuestion(index, "weight", parseFloat(e.target.value))
                }
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        onClick={handleAddQuestion}
        className="bg-green-500 text-white mt-4 flex items-center hover:bg-green-600 transition duration-200"
      >
        <FaPlus className="mr-2" />
        Add {reference === "general" ? "General" : "Student"} Question
      </Button>
    </div>
  );
}


function QuestionViewer({ questions }) {
  return (
    <div className="space-y-6">
      {questions.map((field, index) => (
      <div
        key={field.id ? `question-${field.id}` : `question-${index}`} // Ensure a unique key for each question
        className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl text-blue-900 font-semibold flex items-center">
            <span className="mr-2 font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-base">
              #{index + 1}
            </span>
            {field.title}
          </h3>
          <span className="text-sm text-gray-500">{field.reference} question</span>
        </div>

        <p className="text-gray-600 mb-4">{field.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center">
            <span className="font-medium mr-2">Response Type:</span>
            <span className="text-gray-700 capitalize">{field.response_type}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-2">Required:</span>
            <span
              className={`px-2 py-1 rounded-full text-sm font-medium ${
                field.required ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {field.required ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-2">Weight:</span>
            <span className="text-gray-700">{field.weight}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-2">Order:</span>
            <span className="text-gray-700">{field.order}</span>
          </div>
        </div>
      </div>
    ))}
    </div>
  );
}

export default function EditFormComponent({
  formTitle,
  formDescription,
  formID,
  questions,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [generalQuestions, setGeneralQuestions] = useState([]);
  const [studentQuestions, setStudentQuestions] = useState([]);
  const [editedFormName, setEditedFormName] = useState(formTitle);
  const [editedFormDescription, setEditedFormDescription] =
    useState(formDescription);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const confirmExitEditMode = () => {
    const userChoice = window.confirm(
      "You have unsaved changes. Would you like to save them before exiting?"
    );
    if (userChoice) {
      handleSave();
    } else {
      setIsEditMode(false);
    }
  };

  
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (questions && questions.length > 0) {
      const formattedQuestions = questions
        .map((q) => ({
          id: q.questionID,
          title: q.title,
          description: q.description,
          order: q.order,
          questionID: q.questionID,
          reference: q.reference,
          required: q.required,
          response_type: q.response_type,
          weight: q.weight,
        }))
        .sort((a, b) => a.order - b.order);

      setGeneralQuestions(
        formattedQuestions.filter((q) => q.reference === "general")
      );
      setStudentQuestions(
        formattedQuestions.filter((q) => q.reference === "student")
      );
    }
  }, [user, questions]);

  const handleSave = async () => {
    try {
      const updatedQuestions = [...generalQuestions, ...studentQuestions].map((q) => ({
        ...q,
        order: parseInt(q.order, 10), // Ensure `order` is an integer
        weight: parseFloat(q.weight), // Ensure `weight` is a float
      }));
  
      console.log("Saving updated questions:", updatedQuestions);
  
      for (const question of updatedQuestions) {
        // Validate question data
        if (!question.title || !question.reference) {
          console.warn("Skipping invalid question:", question);
          alert(`Invalid question data for "${question.title || 'Untitled'}". Please check all fields.`);
          continue;
        }
  
        try {
          if (question.id.startsWith("new_")) {
            console.log("Adding new question:", question);
            const response = await formsApi.addQuestion(formID, question);
            question.id = response.id; // Update the local ID with the database ID
          } else {
            console.log("Updating question:", question);
            const updatedResponse = await formsApi.updateQuestion(formID, question.id, question);
            console.log("Updated question data:", updatedResponse);
          }
        } catch (error) {
          console.error(`Error syncing question: "${question.title}"`, error);
          alert(`Failed to sync question: "${question.title}". Please try again.`);
        }
      }
  
      // Refetch updated questions from the server
      const allQuestions = await formsApi.getQuestions(formID);
      setGeneralQuestions(allQuestions.filter((q) => q.reference === "general"));
      setStudentQuestions(allQuestions.filter((q) => q.reference === "student"));
  
      alert("Form updated successfully!");
    } catch (error) {
      console.error("Error saving form:", error.message);
      alert(error.message || "Failed to save form. Please try again.");
    }
  };
  
  
  
  return (
    <div className="relative p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-center items-center mb-6 space-y-2 md:space-y-0 md:space-x-2">
        <Button
          onClick={() =>
            isEditMode && hasUnsavedChanges
              ? confirmExitEditMode()
              : setIsEditMode((prev) => !prev)
          }
          className="bg-blue-500 text-white hover:bg-blue-600 transition duration-200 w-full md:w-auto"
        >
          {isEditMode ? "Exit Edit Mode" : "Edit Form"}
        </Button>
        {isEditMode && (
          <Button
            onClick={handleSave}
            className="bg-green-500 text-white hover:bg-green-600 transition duration-200 w-full md:w-auto"
          >
            Save Changes
          </Button>
        )}
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="p-4 md:p-6 bg-slate-200 border border-blue-100 rounded-lg shadow-sm mb-6">
          {isEditMode ? (
            <>
              <label className="text-2xl font-bold text-blue-900 mb-4">
                Form Name
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 shadow-sm text-lg font-medium mb-4"
                value={editedFormName}
                onChange={(e) => {
                  setEditedFormName(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Form Name"
              />
              <label className="text-2xl font-bold text-blue-900 mb-4">
                Form Description
              </label>
              <textarea
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 shadow-sm text-lg "
                value={editedFormDescription}
                onChange={(e) => {
                  setEditedFormDescription(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Form Description"
              />
            </>
          ) : (
            <>
              <h3 className="text-2xl text-blue-900 font-bold mb-2">
                {editedFormName}
              </h3>
              <p className="text-gray-600 text-base mb-4">
                {editedFormDescription}
              </p>
            </>
          )}
        </div>

        <div className="p-4 md:p-6 bg-slate-200 border border-blue-100 rounded-lg shadow-sm mb-6">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">
            General Questions
          </h3>
          {isEditMode ? (
            <QuestionEditor
              questions={generalQuestions}
              setQuestions={setGeneralQuestions}
              reference="general"
              formID={formID}
            />
          ) : (
            <QuestionViewer questions={generalQuestions} />
          )}
        </div>

        <div className="p-4 md:p-6 bg-slate-200 border border-blue-100 rounded-lg shadow-sm mb-6">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">
            Student Questions
          </h3>
          {isEditMode ? (
            <QuestionEditor
              questions={studentQuestions}
              setQuestions={setStudentQuestions}
              reference="student"
              formID={formID}
            />
          ) : (
            <QuestionViewer questions={studentQuestions} />
          )}
        </div>

        {isEditMode && (
          <Button
            onClick={handleSave}
            className="bg-green-500 text-white hover:bg-green-600 transition duration-200 w-full md:w-auto"
          >
            Save Changes
          </Button>
        )}
      </form>
    </div>
  );
}
