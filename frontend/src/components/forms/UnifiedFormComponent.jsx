import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import FormField from "./FormField";
import { Button } from "../ui/Button";
import { formsApi } from "../../services/formAPI";

export default function UnifiedFormComponent({
  formTitle,
  formDescription,
  submitEndpoint,
  students = [],
  projectCode,
  projectName,
  formID,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formQuestions, setFormQuestions] = useState([]);
  const [generalQuestions, setGeneralQuestions] = useState([]);
  const [studentQuestions, setStudentQuestions] = useState([]);
  const [formData, setFormData] = useState({});
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Admin edit mode toggle

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (formID) {
      console.log("UnifiedFormComponent received formID:", formID); // Debug log
      fetchFormData();
    } else {
      console.error("Missing formID for fetching form data.");
    }
  }, [user, formID]);

  
  
  const fetchFormData = async () => {
    try {
      if (!formID) {
        throw new Error("formID is undefined!");
      }
  
      console.log("Fetching questions for formID:", formID);
      const questions = await formsApi.getQuestions(formID);
      console.log("Fetched questions:", questions);
  
      if (!questions || questions.length === 0) {
        console.error(`No questions found for this formID: ${formID}`);
        return;
      }
  
      const formattedQuestions = questions
      .map((q) => ({
        name: q.questionID,
        label: q.title,
        description: q.description,
        type: q.response_type, // Ensure this is passed correctly
        required: q.required,
        weight: q.weight,
        order: q.order,
        reference: q.reference,
      }))
      
        .sort((a, b) => a.order - b.order); // Sort by order property
  
      setGeneralQuestions(
        formattedQuestions.filter((q) => q.reference === "general")
      );
      setStudentQuestions(
        formattedQuestions.filter((q) => q.reference === "student")
      );
  
      const initialData = formattedQuestions.reduce((acc, field) => {
        acc[field.name] = field.defaultValue || "";
        return acc;
      }, {});
  
      students.forEach((_, index) => {
        formattedQuestions
          .filter((q) => q.reference === "student")
          .forEach((q) => {
            const fieldName = `student${index + 1}_${q.name}`;
            initialData[fieldName] = "";
          });
      });
  
      setFormData(initialData);
      updateProgress(); // Update progress after initializing formData
    } catch (error) {
      console.error("Error fetching form data:", error);
    }
  };
  

  const handleChange = (e) => {
    const { name, value, type } = e.target;
  
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    updateProgress();
  };
  
  
  const updateProgress = () => {
    const staticFields = ["projectCode", "title", "evaluatorName"];
  
    // Combine general and student questions
    const editableQuestions = [
      ...generalQuestions.filter(
        (field) =>
          !staticFields.includes(field.name) && field.required // Include only required general questions
      ),
      ...students.flatMap((_, index) =>
        studentQuestions.map((field) => ({
          ...field,
          dynamicKey: `student${index + 1}_${field.name}`, // Generate dynamic keys for student questions
        }))
      ).filter((field) => field.required), // Include only required student questions
    ];
  
    const totalEditableFields = editableQuestions.length;
  
    const filledEditableFields = editableQuestions.filter((field) => {
      const key = field.dynamicKey || field.name;
      const value = formData[key];
      if (!value || value.toString().trim() === "") return false;
  
      // Validate text area with at least 5 words
      if (field.type === "textarea") {
        const wordCount = value.trim().split(/\s+/).length;
        return wordCount >= 5;
      }
  
      return true; // All other types are valid as long as they're not empty
    }).length;
  
    setProgress(
      totalEditableFields > 0
        ? Math.round((filledEditableFields / totalEditableFields) * 100)
        : 0
    );
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!isFormValid()) {
      alert(
        "Please fill in all required fields. Text areas must have at least 5 words."
      );
      return;
    }
  
    const weightedScore = calculateWeightedScore(formData, formQuestions);
  
    try {
      await formsApi.submitForm(submitEndpoint, {
        ...formData,
        weightedScore,
      });
      console.log("Form submitted successfully");
      navigate("/ProjectToReview");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  

  const calculateWeightedScore = (formData, formQuestions) => {
    let totalWeight = 0;
    let weightedScore = 0;

    formQuestions.forEach((field) => {
      if (field.type === "number" && field.weight) {
        const value = parseFloat(formData[field.name]) || 0;
        weightedScore += value * field.weight;
        totalWeight += field.weight;
      }
    });

    return totalWeight > 0 ? (weightedScore / totalWeight).toFixed(2) : 0;
  };

  const handleEditToggle = () => {
    setIsEditMode((prev) => !prev);
  };

  const isFormValid = () => {
    const staticFields = ["projectCode", "title", "evaluatorName"];
  
    // Combine general and student questions
    const editableQuestions = [
      ...generalQuestions.filter(
        (field) =>
          !staticFields.includes(field.name) && field.required // Include only required general questions
      ),
      ...students.flatMap((_, index) =>
        studentQuestions.map((field) => ({
          ...field,
          dynamicKey: `student${index + 1}_${field.name}`, // Generate dynamic keys for student questions
        }))
      ).filter((field) => field.required), // Include only required student questions
    ];
  
    return editableQuestions.every((field) => {
      const key = field.dynamicKey || field.name;
      const value = formData[key];
      if (!value || value.toString().trim() === "") return false;
  
      // Validate text area with at least 5 words
      if (field.type === "textarea") {
        const wordCount = value.trim().split(/\s+/).length;
        return wordCount >= 5;
      }
  
      return true; // All other types are valid as long as they're not empty
    });
  };
  

  const getColor = (progress) => {
    if (progress <= 30) return "stroke-red-500";
    if (progress <= 70) return "stroke-orange-400";
    return "stroke-green-500";
  };

  return (
    <div className="relative p-6">
      {/* Edit Mode Toggle for Admins */}
      {user?.role === "Admin" && (
        <div className="mb-4 flex justify-end">
          <Button onClick={handleEditToggle} className="bg-blue-500 text-white">
            {isEditMode ? "Exit Edit Mode" : "Edit Form"}
          </Button>
        </div>
      )}

      {/* Interactive Progress Circle */}
      {isVisible && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 flex flex-col items-center">
          <div className="w-full flex justify-between mb-2">
            <button
              onClick={() => setIsMinimized((prev) => !prev)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {isMinimized ? "Expand" : "Minimize"}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>

          {!isMinimized && (
            <svg width="80" height="80" className="transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke="#e0e0e0"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="35"
                strokeWidth="6"
                fill="none"
                strokeDasharray="220"
                strokeDashoffset={(220 * (100 - progress)) / 100}
                strokeLinecap="round"
                className={`transition-all duration-500 ${getColor(progress)}`}
              />
            </svg>
          )}
          <p className="text-sm font-semibold mt-1">{`Form Progress: ${progress}%`}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 bg-slate-200 border border-blue-100 rounded-lg shadow-sm mb-6">
          <div className="mb-6 text-center">
            <h2 className="text-2xl text-blue-900 font-bold mb-2">
              {formTitle}
            </h2>
            {formDescription && (
              <p className="text-gray-600 mb-4 max-w-3xl mx-auto break-words leading-relaxed text-center">
                {formDescription}
              </p>
            )}
          </div>

          {/* Project Code and Name */}
          <FormField
            label="Project Code"
            type="text"
            name="projectCode"
            value={projectCode}
            onChange={handleChange}
            required
            disabled
          />
          <FormField
            label="Project Name"
            type="text"
            name="title"
            value={projectName}
            onChange={handleChange}
            required
            disabled
          />
          <FormField
            label="Evaluator Name"
            type="text"
            name="evaluatorName"
            value={user?.fullName || ""}
            onChange={handleChange}
            required
            disabled
          />

          {/* General Fields */}
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            Overall Project Evaluation
          </h3>
          {generalQuestions.map((field) => (
            <FormField
              key={field.name}
              {...field}
              value={formData[field.name]}
              onChange={handleChange}
              disabled={isEditMode && user?.role === "Admin"}
            />
          ))}
        </div>

        {/* Student Evaluation */}
        {students.length > 0 &&
          students.map((student, index) => (
            <div
              key={`student-${index}`}
              className="p-6 bg-slate-200 border border-blue-100 rounded-lg shadow-sm mb-6"
            >
              <h3 className="text-lg font-bold text-blue-900 mb-4">{`Evaluation for ${student.name}`}</h3>
              {studentQuestions.map((question) => {
                const fieldName = `student${index + 1}_${question.name}`;
                return (
                  <FormField
                    key={fieldName}
                    {...question}
                    name={fieldName}
                    value={formData[fieldName]}
                    onChange={handleChange}
                    disabled={isEditMode && user?.role === "Admin"}
                  />
                );
              })}
            </div>
          ))}

        {/* Submit Button */}
        <div className="flex justify-center mt-6">
          <Button type="submit" className="w-64" disabled={!isFormValid}>
            Submit Evaluation
          </Button>
        </div>
      </form>
    </div>
  );
}
