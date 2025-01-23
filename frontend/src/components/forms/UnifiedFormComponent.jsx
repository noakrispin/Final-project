import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import FormField from "./FormField";
import { Button } from "../ui/Button";
import { formsApi } from "../../services/formAPI";
import { evaluatorsApi } from "../../services/evaluatorsAPI";

export default function UnifiedFormComponent({
  formTitle,
  formDescription,
  students = [],
  projectCode,
  projectName,
  formID,
  questions, //questions from DynamicFormPage
  readOnly,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [generalQuestions, setGeneralQuestions] = useState([]);
  const [studentQuestions, setStudentQuestions] = useState([]);
  const [formData, setFormData] = useState({});
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (questions && questions.length > 0) {
      // Format the questions prop
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

      // Separate formatted questions into general and student-specific
      setGeneralQuestions(
        formattedQuestions.filter((q) => q.reference === "general")
      );
      setStudentQuestions(
        formattedQuestions.filter((q) => q.reference === "student")
      );

      // Set the general and student questions
      initializeFormData(); // Pass all formatted questions for formData initialization
    }
  }, [user, questions]);

  useEffect(() => {
    if (user && questions.length > 0) {
      fetchLastResponse(questions);
    } else {
      initializeFormData();
    }
  }, [user, questions]);

  const fetchLastResponse = async () => {
    try {
      const lastResponse = await formsApi.getLastResponse(
        formID,
        user?.id,
        projectCode
      );

      if (!lastResponse || !lastResponse.general || !lastResponse.students) {
        console.log("No last response found for the evaluator and project.");
        return;
      }

      const initialData = {};

      // Populate general questions
      generalQuestions.forEach((field) => {
        initialData[field.name] = lastResponse.general[field.name] || "";
      });

      // Populate student-specific questions
      students.forEach((student) => {
        studentQuestions.forEach((field) => {
          const fieldName = `student${student.id}_${field.name}`;
          initialData[fieldName] =
            lastResponse.students[student.id]?.[field.name] || "";
        });
      });

      setFormData(initialData);
      updateProgress(initialData);
    } catch (error) {
      console.error("Error fetching last response:", error);
    }
  };

  const initializeFormData = () => {
    const initialData = {};

    // Initialize general questions
    generalQuestions.forEach((field) => {
      initialData[field.name] = ""; // Initialize with empty string
    });

    // Initialize student-specific questions
    students.forEach((student) => {
      studentQuestions.forEach((field) => {
        const fieldName = `student${student.id}_${field.name}`;
        initialData[fieldName] = ""; // Initialize with empty string
      });
    });

    setFormData(initialData);
    updateProgress(initialData); // Ensure progress is updated after initialization
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      alert(
        "Please fill in all required fields. Text areas must have at least 5 words."
      );
      return;
    }

    const responses = {
      evaluatorID: user.id,
      projectCode,
      general: {},
      students: {},
    };

    // Populate general responses
    generalQuestions.forEach((field) => {
      responses.general[field.name] = formData[field.name];
    });

    // Populate student-specific responses
    students.forEach((student) => {
      responses.students[student.id] = {
        ...formData[`student${student.id}`], // Preserve existing responses for this student
      };

      studentQuestions.forEach((field) => {
        const fieldName = `student${student.id}_${field.name}`;
        responses.students[student.id][field.name] =
          formData[fieldName] ||
          responses.students[student.id][field.name] ||
          ""; // Merge existing and new responses
      });
    });

    try {
      console.log("Submitting form data:", responses); // Debug log
      // Submit the form responses
      await formsApi.submitForm(formID, responses); // Pass formID and the complete responses object
      console.log("Form submitted successfully");

      // Add or update evaluator status in Evaluators collection
      const evaluatorData = {
        evaluatorID: user.id,
        formID,
        projectCode,
        status: "Submitted",
      };

      const evaluatorId = `${user.id}-${formID}-${projectCode}`; // Unique ID for evaluator
      console.log("Updating evaluator status:", evaluatorData);

      await evaluatorsApi.addOrUpdateEvaluator(evaluatorId, evaluatorData);
      console.log("Evaluator status updated successfully");

      // Redirect after successful submission
      navigate(-1); // Go back to the previous page
    } catch (error) {
      console.error("Error submitting form or updating evaluator:", error);
    }
  };

  const updateProgress = (updatedFormData = formData) => {
    const staticFields = ["projectCode", "title", "evaluatorName"]; // Non-editable fields

    // Combine general and student questions
    const editableQuestions = [
      ...generalQuestions.filter(
        (field) => !staticFields.includes(field.name) && field.required // Include only required general questions
      ),
      ...students
        .flatMap((student) =>
          studentQuestions.map((field) => ({
            ...field,
            dynamicKey: `student${student.id}_${field.name}`, // Generate dynamic keys for student questions
          }))
        )
        .filter((field) => field.required), // Include only required student questions
    ];

    const totalEditableFields = editableQuestions.length;

    const filledEditableFields = editableQuestions.filter((field) => {
      const key = field.dynamicKey || field.name;
      const value = updatedFormData[key]; // Use updated formData to check
      if (!value || value.toString().trim() === "") return false;

      // Validate textarea with at least 5 words
      if (field.type === "textarea") {
        const wordCount = value.trim().split(/\s+/).length;
        return wordCount >= 5;
      }

      return true; // All other field types are valid if not empty
    }).length;

    // Debugging logs
    console.log("Editable Questions:", editableQuestions);
    console.log("Updated Form Data:", updatedFormData);
    console.log("Total Editable Fields:", totalEditableFields);
    console.log("Filled Editable Fields:", filledEditableFields);

    setProgress(
      totalEditableFields > 0
        ? Math.round((filledEditableFields / totalEditableFields) * 100)
        : 0
    );
  };

  const isFormValid = () => {
    return progress === 100;
  };

  const getColor = (progress) => {
    if (progress <= 30) return "stroke-red-500";
    if (progress <= 70) return "stroke-orange-400";
    return "stroke-green-500";
  };

  const handleChange = (e) => {
    if (readOnly) return; // Prevent changes if in read-only mode
    const { name, value } = e.target;

    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        [name]: value, // Update the specific field
      };

      updateProgress(updatedData); // Recalculate progress using updated formData
      return updatedData;
    });
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
          <p className="text-base font-semibold mt-1">{`Form Progress: ${progress}%`}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 bg-slate-200 border border-blue-100 rounded-lg shadow-sm mb-6">
          <div className="mb-6 text-base text-center">
            <>
              <h2 className="text-2xl text-blue-900 font-bold mb-2">
                {formTitle}
              </h2>
              <p className="text-gray-600 text-base mb-4 max-w-3xl mx-auto break-words leading-relaxed text-center">
                {formDescription}
              </p>
            </>
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
          {generalQuestions?.map((field, index) => (
            <div key={field.name} className="mb-4">
              <>
                {/* Static Display */}
                <FormField
                  key={field.name}
                  {...field}
                  value={formData[field.name]}
                  onChange={handleChange}
                  disabled={readOnly}
                />
              </>
            </div>
          ))}
        </div>


        {/* Student Evaluation */}
        {studentQuestions.length > 0 &&
          students.length > 0 &&
          students.map((student) => (
            <div
              key={`student-${student.id}`}
              className="p-6 bg-slate-200 border border-blue-100 rounded-lg shadow-sm mb-6"
            >
              <h3 className="text-lg font-bold text-blue-900 mb-4">{`Evaluation for ${student.fullName}`}</h3>
              {studentQuestions?.map((field) => {
                const fieldName = `student${student.id}_${field.name}`;
                return (
                  <FormField
                    key={fieldName}
                    {...field}
                    name={fieldName}
                    value={formData[fieldName] || ""}
                    onChange={(e) => handleChange(e)}
                    disabled={readOnly}
                  />
                );
              })}
            </div>
          ))}

        {/* Submit Button */}
        {!readOnly && (
          <div className="flex justify-center mt-6">
            <Button type="submit" className="w-64" disabled={!isFormValid()}>
              Submit Evaluation
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
