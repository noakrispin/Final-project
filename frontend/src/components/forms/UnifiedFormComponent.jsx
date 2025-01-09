import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import FormField from "./FormField";
import { mockApi } from "../../services/mockApi";
import { Button } from "../ui/Button";

export default function UnifiedFormComponent({
  formTitle,
  formDescription,
  formFields,
  submitEndpoint,
  students = [],
  projectCode,
  projectName,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => {
    const initialData = formFields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue || "";
      return acc;
    }, {});

    // Initialize student-specific fields
    students.forEach((student, index) => {
      formFields
        .filter((question) => question.evaluates === "student")
        .forEach((question) => {
          const fieldName = `student${index + 1}_${question.name}`;
          initialData[fieldName] = "";
        });
    });

    return initialData;
  });

  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
    else if (user.role !== "Supervisor" && user.role !== "Admin") navigate("/");
  }, [user, navigate]);

  // Fetch required questions for the specific form type
  const fetchRequiredQuestions = async (formType) => {
    const questions = await mockApi.getQuestions(formType);
    return questions.filter((q) => q.required && !q.disabled);
  };

  // Calculate progress circle
  useEffect(() => {
  
    // Filter for required, editable general fields
    const generalFields = formFields.filter(
      (f) => f.required && !f.disabled && !f.evaluates
    );

    // Generate required, editable student-specific fields
    const studentFields = students.flatMap((_, index) =>
      formFields
        .filter(
          (f) =>
            f.required &&
            f.evaluates === "student" &&
            !f.disabled
        )
        .map((q) => `student${index + 1}_${q.name}`)
    );
    
    // Calculate total required fields (editable and mandatory only)
    const totalFields = generalFields.length + studentFields.length;
    
    // Count valid answers only for required and editable fields
    const completedFields = [
      ...generalFields.map((f) => ({ field: f, value: formData[f.name] })),
      ...studentFields.map((fieldName) => ({
        field: formFields.find((f) => f.name === fieldName),
        value: formData[fieldName],
      })),
    ].filter(({ field, value }) => {
      if (value === undefined || value === null) {
        return false; // Exclude undefined or null values
      }
    
      // Validate number inputs
      if (field.type === 'number') {
        const numberValue = Number(value);
        const min = field.min || 0;
        const max = field.max || 100;
        return numberValue >= min && numberValue <= max;
      }
    
      // Validate textarea for minimum 5 words
      if (field.type === 'textarea' && field.required) {
        const wordCount = value.trim().split(/\s+/).filter((word) => word).length;
        return wordCount >= 5;
      }
    
      // Validate general strings
      if (typeof value === 'string') {
        return value.trim() !== '';
      }
    
      // Default to valid for other types
      return true;
    }).length;
    
    
    // Calculate progress as a percentage of completed required fields
    const calculatedProgress = Math.round(
      (completedFields / Math.max(totalFields, 1)) * 100
    );
  
    setProgress(calculatedProgress);
  }, [formData, formFields, students]);


  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const updatedValue =
      type === "number"
        ? value === ""
          ? ""
          : Math.max(0, Math.min(100, Number(value)))
        : value;

    setFormData((prev) => ({ ...prev, [name]: updatedValue }));
  };

  const calculateWeightedScore = (formData, formFields) => {
    let totalWeight = 0;
    let weightedScore = 0;

    formFields.forEach((field) => {
      if (field.type === "number" && field.weight) {
        const value = parseFloat(formData[field.name]) || 0;
        weightedScore += value * field.weight;
        totalWeight += field.weight;
      }
    });

    return totalWeight > 0 ? (weightedScore / totalWeight).toFixed(2) : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const weightedScore = calculateWeightedScore(formData, formFields);
    try {
      const result = await mockApi.submitForm(submitEndpoint, {
        ...formData,
        weightedScore,
      });
      if (result.success) {
        console.log("Form submitted successfully");
        navigate("/ProjectToReview");
      } else {
        console.error("Form submission failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const isFormValid =
    formFields.every((f) => {
      return !f.required || formData[f.name]?.toString().trim() !== "";
    }) &&
    students.every((_, index) =>
      formFields
        .filter((q) => q.evaluates === "student")
        .every((q) => {
          const fieldName = `student${index + 1}_${q.name}`;
          return !q.required || formData[fieldName]?.toString().trim() !== "";
        })
    );

  const getColor = (progress) => {
    if (progress <= 30) return "stroke-red-500";
    if (progress <= 70) return "stroke-orange-400";
    return "stroke-green-500";
  };

  return (
    <div className="relative p-6">
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
          {console.log("Progress circle rendered with progress:", progress)}
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
            name="projectName"
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
            {`Overall Project Evaluation`}
          </h3>
          {formFields
            .filter((field) => !field.evaluates)
            .map((field) => (
              <FormField
                key={field.name}
                {...field}
                value={formData[field.name]}
                onChange={handleChange}
              />
            ))}
        </div>

        {/* Student Evaluation */}
        {students.length > 0 ? (
          students.map((student, index) => (
            <div
              key={`student-${index}`}
              className="p-6 bg-slate-200 border border-blue-100 rounded-lg shadow-sm mb-6"
            >
              <h3 className="text-lg font-bold text-blue-900 mb-4">
                {`Evaluation for ${student.name}`}
              </h3>
              {formFields
                .filter((question) => question.evaluates === "student")
                .map((question) => {
                  const fieldName = `student${index + 1}_${question.name}`;
                  return (
                    <FormField
                      key={fieldName}
                      {...question}
                      name={fieldName}
                      value={formData[fieldName]}
                      onChange={handleChange}
                    />
                  );
                })}
            </div>
          ))
        ) : (
          <p></p>
        )}

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