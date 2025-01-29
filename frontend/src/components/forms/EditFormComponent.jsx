import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaTrashAlt, FaPlus } from "react-icons/fa";
import { Button } from "../ui/Button";
import { formsApi } from "../../services/formAPI";
import ConfirmationModal from "../shared/ConfirmationModal";

function QuestionEditor({ questions, setQuestions, reference, formID }) {
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    index: null,
  });

  const handleAddQuestion = async () => {
    const newQuestion = {
      id: `new_${Date.now()}`,
      questionID: `q_${Date.now()}`,
      title: "New Question",
      description: "",
      order: questions.length + 1,
      reference,
      required: false,
      response_type: "textarea",
      weight: 0,
    };

    setQuestions((prev) => [...prev, newQuestion]);

    try {
      const response = await formsApi.addQuestion(formID, newQuestion);
      if (!response || !response.id) {
        throw new Error("Failed to add question on the server.");
      }

      const updatedQuestion = { ...newQuestion, id: response.id };
      setQuestions((prev) =>
        prev.map((q) => (q.id === newQuestion.id ? updatedQuestion : q))
      );
    } catch (error) {
      console.error("Error adding question:", error.message);
      alert("Failed to add question. Please try again.");
      setQuestions((prev) => prev.filter((q) => q.id !== newQuestion.id));
    }
  };

  const confirmDeleteQuestion = (index) => {
    setDeleteModal({ isOpen: true, index });
  };

  const handleDeleteQuestion = async () => {
    const index = deleteModal.index;
    if (index === null) return;

    const questionToDelete = questions[index];

    try {
      if (!questionToDelete.id.startsWith("new_")) {
        await formsApi.deleteQuestion(formID, questionToDelete.id);
      }
      setQuestions((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting question:", error.message);
      alert("Failed to delete question. Please try again.");
    } finally {
      setDeleteModal({ isOpen: false, index: null });
    }
  };

  const handleUpdateQuestion = (index, key, value) => {
    let updatedValue = value;
    if (key === "order" || key === "weight") {
      updatedValue = Number(value);
    } else if (key === "required") {
      updatedValue = value === "true" || value === true;
    }

    const updatedQuestion = { ...questions[index], [key]: updatedValue };
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? updatedQuestion : q))
    );
  };

  return (
    <div className="space-y-6">
      {questions.map((field, index) => (
        <div
          key={field.id || `question-${index}`}
          className="p-6 bg-white border border-gray-300 rounded-lg shadow-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl text-blue-900 font-semibold">
              {field.reference} Question #{index + 1}
            </h3>
            <button
              onClick={() => confirmDeleteQuestion(index)}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <option value="textarea">Text</option>
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
                Required
              </label>
              <input
                type="checkbox"
                className="w-6 h-6"
                checked={field.required}
                onChange={(e) =>
                  handleUpdateQuestion(index, "required", e.target.checked)
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

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Question?"
        message="Are you sure you want to delete this question?"
        onCancel={() => setDeleteModal({ isOpen: false, index: null })}
        onConfirm={handleDeleteQuestion}
        isProcessing={false}
      />
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
            <span className="text-sm text-gray-500">
              {field.reference} question
            </span>
          </div>

          <p className="text-gray-600 mb-4">{field.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center">
              <span className="font-medium mr-2">Response Type:</span>
              <span className="text-gray-700 capitalize">
                {field.response_type}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-2">Required:</span>
              <span
                className={`px-2 py-1 rounded-full text-sm font-medium ${
                  field.required
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
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
  const [editedFormDescription, setEditedFormDescription] =useState(formDescription);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showWeightValidationModal, setShowWeightValidationModal] =useState(false);
  const [currentTotalWeight, setCurrentTotalWeight] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const confirmExitEditMode = () => {
    if (hasUnsavedChanges) {
      setShowConfirmExit(true); // Ask for confirmation before exiting
    } else {
      setIsEditMode(false); // Exit without saving if no changes
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


  useEffect(() => {
      if (showSuccessModal) {
        const timer = setTimeout(() => {
          setShowSuccessModal(false);
          navigate(-1); // Redirect after timeout
        }, 2000); // 2000ms = 2 seconds
    
        return () => clearTimeout(timer); // Cleanup if component unmounts
      }
    }, [showSuccessModal, navigate]);

  const confirmSaveChanges = () => {
    const totalWeight = [...generalQuestions, ...studentQuestions].reduce(
      (sum, q) => sum + parseFloat(q.weight || 0),
      0
    );
  
    // Round to 2 decimal places
    const roundedTotalWeight = parseFloat(totalWeight.toFixed(2));
  
    // Validate weight sum
    if (roundedTotalWeight !== 1.0) {
      setCurrentTotalWeight(roundedTotalWeight);
      setShowWeightValidationModal(true);
      return;
    }
  
    // Show the save confirmation modal if validation passes
    setShowConfirmSave(true);
  };
  
  const handleSave = async () => {
    setIsProcessing(true);
    console.log("Updating form:", formID, editedFormName, editedFormDescription);

    try {
        // Prepare the form update object (renamed 'title' to 'formName')
        const formUpdate = {
            formName: editedFormName, 
            description: editedFormDescription,
            questions: [...generalQuestions, ...studentQuestions].map(q => ({
                ...q,
                order: parseInt(q.order, 10), // Ensure order is an integer
                weight: parseFloat(q.weight), // Ensure weight is a float
            }))
        };

        // Send a single API call to update the form + questions
        const response = await formsApi.updateForm(formID, formUpdate);
        console.log("Update response:", response);

        // Refresh questions from the DB
        const allQuestions = await formsApi.getQuestions(formID);

        // Sort questions before setting state
        const sortedQuestions = allQuestions.sort((a, b) => a.order - b.order);
        setGeneralQuestions(sortedQuestions.filter(q => q.reference === "general"));
        setStudentQuestions(sortedQuestions.filter(q => q.reference === "student"));

        // Show success message
        setShowSuccessModal(true);

        // Reset edit mode and unsaved changes tracking
        setIsEditMode(false);
        setHasUnsavedChanges(false);
        setShowConfirmSave(false);
        setIsProcessing(false);
    } catch (error) {
        console.error("Error saving form:", error.message);
        alert(error.message || "Failed to save form. Please try again.");
    } finally {
        setIsProcessing(false);
    }
};


  return (
    <div className="relative p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-center items-center mb-6 space-y-2 md:space-y-0 md:space-x-2">
        <Button
          onClick={() => {
            if (isEditMode && hasUnsavedChanges) {
              confirmExitEditMode(); // Ask for confirmation only if changes are unsaved
            } else {
              setIsEditMode((prev) => !prev); // Toggle edit mode
            }
          }}
          className="bg-blue-500 text-white hover:bg-blue-600 transition duration-200 w-full sm:w-auto"
        >
          {isEditMode ? "Exit Edit Mode" : "Edit Form"}
        </Button>

        {isEditMode && (
          <Button
            onClick={confirmSaveChanges} // Show confirmation before saving
            className="bg-green-500 text-white hover:bg-green-600 transition duration-200 w-full sm:w-auto"
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
        {/* Weight Validation Modal */}
      {showWeightValidationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h2 className="text-xl font-bold mb-4 text-red-700">
              Weight Validation Error
            </h2>
            <p>Total question weights must add up to 100% (1.00). Currently: {currentTotalWeight}</p>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowWeightValidationModal(false)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
        <ConfirmationModal
          isOpen={showConfirmExit}
          title="Exit Edit Mode?"
          message="You have unsaved changes. Do you want to save before exiting?"
          onCancel={() => setShowConfirmExit(false)} // Stay in Edit Mode
          onConfirm={() => {
            setIsEditMode(false); // Exit without saving
            setShowConfirmExit(false);
            setHasUnsavedChanges(false); // Discard changes
          }}
          confirmText="Exit Without Saving"
          secondaryConfirmText="Save and Exit"
          onSecondaryConfirm={() => {
            handleSave(); // Save before exiting
            setIsEditMode(false);
            setShowConfirmExit(false);
          }}
          isProcessing={false}
        />

        <ConfirmationModal
          isOpen={showConfirmSave}
          title="Save Changes?"
          message="Are you sure you want to save these changes?"
          onCancel={() => {
            setShowConfirmSave(false);
            setIsProcessing(false);
          }}
          onConfirm={handleSave}
          isProcessing={isProcessing}
        />
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
              <h2 className="text-xl font-bold mb-4 text-green-700">
                Success!
              </h2>
              <p>The form has been updated successfully!</p>
              <div className="flex justify-center mt-4">
                {/* <button
                  onClick={() => setShowSuccessModal(false)} // Close the modal
                  className="px-4 py-2 bg-green-400 text-white rounded-md hover:bg-green-700"
                >
                  OK
                </button> */}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
