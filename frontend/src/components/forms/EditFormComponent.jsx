import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaTrashAlt, FaPlus } from "react-icons/fa";
import { Button } from "../ui/Button";
import { formsApi } from "../../services/formAPI";

function QuestionEditor({ questions, setQuestions, reference }) {
  const handleAddQuestion = () => {
    const newQuestion = {
      id: `new_${Date.now()}`,
      title: "New Question",
      description: "",
      order: questions.length + 1,
      questionID: `q_${Date.now()}`,
      reference,
      required: false,
      response_type: "text",
      weight: 0,
    };
    setQuestions((prev) => [...prev, newQuestion]);
    try {
        const response =  formsApi.addQuestion(formID, newQuestionData);
        setQuestions((prev) => [...prev, response.data.question]);
      } catch (error) {
        console.error("Error adding question:", error.message);
      }
    
  };

  const handleDeleteQuestion = (index) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this question?"
    );
    if (confirmDelete) {
      setQuestions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleUpdateQuestion = async (index, key, value) => {
    const updatedQuestion = { ...questions[index], [key]: value };
    setQuestions((prev) => prev.map((q, i) => (i === index ? updatedQuestion : q)));

    try {
      await formsApi.updateQuestion(formID, updatedQuestion.id, updatedQuestion);
    } catch (error) {
      console.error("Error updating question:", error.message);
    }
  };


  return (
    <div className="space-y-6">
      {questions.map((field, index) => (
        <div
          key={field.id || field.name}
          className="p-6 bg-white border border-gray-300 rounded-lg shadow-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg text-blue-900 font-semibold">
              Question #{index + 1}
            </h3>
            <button
              onClick={() => handleDeleteQuestion(index)}
              className="text-red-500 hover:text-red-700"
            >
              <FaTrashAlt className="mr-2" />
              Delete
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
              onChange={(e) => handleUpdateQuestion(index, "title", e.target.value)}
              placeholder="Enter question title"
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
              placeholder="Provide more details about this question"
            />
          </div>

          {/* Order, Reference, and Response Type */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Order in Form
              </label>
              <input
                type="number"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={field.order}
                onChange={(e) =>
                  handleUpdateQuestion(index, "order", e.target.value)
                }
                placeholder="Order"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Reference
              </label>
              <select
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={field.reference}
                onChange={(e) =>
                  handleUpdateQuestion(index, "reference", e.target.value)
                }
              >
                <option value="general">General</option>
                <option value="student">Student</option>
              </select>
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
                <option value="number">Number</option>
                <option value="textarea">Textarea</option>
              </select>
            </div>
          </div>

          {/* Required and Weight */}
          <div className="grid grid-cols-2 gap-4 items-center">
            <label className="flex items-center text-gray-700">
              <input
                type="checkbox"
                className="mr-2"
                checked={field.required}
                onChange={(e) =>
                  handleUpdateQuestion(index, "required", e.target.checked)
                }
              />
              Required
            </label>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Question Weight
              </label>
              <input
                type="number"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={field.weight}
                onChange={(e) =>
                  handleUpdateQuestion(index, "weight", e.target.value)
                }
                placeholder="Weight"
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
  const [editedFormDescription, setEditedFormDescription] = useState(
    formDescription
  );
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
      const updatedQuestions = [...generalQuestions, ...studentQuestions];
      await formsApi.updateForm(formID, {
        formName: editedFormName,
        description: editedFormDescription,
        questions: updatedQuestions,
      });
      alert("Form updated successfully!");
      setIsEditMode(false);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error saving form updates:", error);
    }
  };

  return (
    <div className="relative p-6">
      <div className="flex justify-center mb-6">
        <Button
          onClick={() =>
            isEditMode && hasUnsavedChanges
              ? confirmExitEditMode()
              : setIsEditMode((prev) => !prev)
          }
          className="bg-blue-500 text-white hover:bg-blue-600 transition duration-200"
        >
          {isEditMode ? "Exit Edit Mode" : "Edit Form"}
        </Button>
        {isEditMode && (
          <Button
            onClick={handleSave}
            className="bg-blue-500 text-white hover:bg-blue-600 transition duration-200"
          >
            Save Changes
          </Button>
        )}
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="p-6 bg-slate-200 border border-blue-100 rounded-lg shadow-sm mb-6">
          {isEditMode ? (
            <>
              <label className="block text-gray-700 font-medium mb-2">
                Form Name
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 shadow-sm mb-4"
                value={editedFormName}
                onChange={(e) => {
                  setEditedFormName(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Form Name"
              />
              <label className="block text-gray-700 font-medium mb-2">
                Form Description
              </label>
              <textarea
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 shadow-sm"
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

        <div className="p-6 bg-slate-200 border border-blue-100 rounded-lg shadow-sm mb-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            General Questions
          </h3>
          {isEditMode ? (
            <QuestionEditor
              questions={generalQuestions}
              setQuestions={setGeneralQuestions}
              reference="general"
            />
          ) : (
            generalQuestions.map((field) => (
              <div key={field.id} className="mb-4 border-b pb-4">
                <p className="font-semibold">{field.title}</p>
                <p className="text-sm text-gray-500">{field.description}</p>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-200 border border-blue-100 rounded-lg shadow-sm mb-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            Student Questions
          </h3>
          {isEditMode ? (
            <QuestionEditor
              questions={studentQuestions}
              setQuestions={setStudentQuestions}
              reference="student"
            />
          ) : (
            studentQuestions.map((field) => (
              <div key={field.id} className="mb-4 border-b pb-4">
                <p className="font-semibold">{field.title}</p>
                <p className="text-sm text-gray-500">{field.description}</p>
              </div>
            ))
          )}
        </div>

        {isEditMode && (
          <Button
            onClick={handleSave}
            className="bg-blue-500 text-white hover:bg-blue-600 transition duration-200"
          >
            Save Changes
          </Button>
        )}
      </form>
    </div>
  );
}
