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
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

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

      await fetchLastResponse(formattedQuestions);
    } catch (error) {
      console.error("Error fetching form data:", error);
    }
  };

  const fetchLastResponse = async (questions) => {
    try {
      console.log(
        `Fetching last response for formID: ${formID}, evaluatorID: ${user?.id}, projectCode: ${projectCode}`
      );
      const lastResponse = await formsApi.getLastResponse(
        formID,
        user?.id,
        projectCode
      );

      if (!lastResponse || !lastResponse.general || !lastResponse.students) {
        console.log("No last response found for the evaluator and project.");
        initializeFormData(questions);
        return;
      }

      console.log("Fetched last response:", lastResponse);

      const initialData = {};

      // Populate general questions
      questions
        .filter((q) => q.reference === "general")
        .forEach((field) => {
          initialData[field.name] = lastResponse.general[field.name] || "";
        });

      // Populate student-specific questions
      students.forEach((student) => {
        questions
          .filter((q) => q.reference === "student")
          .forEach((field) => {
            const fieldName = `student${student.id}_${field.name}`;
            initialData[fieldName] =
              lastResponse.students[student.id]?.[field.name] || "";
          });
      });

      console.log("Populated initialData:", initialData);
      setFormData(initialData); // Update the state with fetched data
      updateProgress(); // Update the progress bar
    } catch (error) {
      console.error("Error fetching last response:", error);
    }
  };

  useEffect(() => {
    console.log("Form Data State:", formData);
  }, [formData]);

  const initializeFormData = (questions) => {
    const initialData = questions.reduce((acc, field) => {
      acc[field.name] = ""; // Initialize empty string for general questions
      return acc;
    }, {});

    students.forEach((student) => {
      questions
        .filter((q) => q.reference === "student")
        .forEach((q) => {
          const fieldName = `student${student.id}_${q.name}`;
          initialData[fieldName] = ""; // Initialize empty string
        });
    });
    

    setFormData(initialData);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!isFormValid()) {
    alert("Please fill in all required fields. Text areas must have at least 5 words.");
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
        formData[fieldName] || responses.students[student.id][field.name] || ""; // Merge existing and new responses
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
    navigate("/MyProjectsReview");
  } catch (error) {
    console.error("Error submitting form or updating evaluator:", error);
  }
};

  
  

  const updateProgress = () => {
    const staticFields = ["projectCode", "title", "evaluatorName"];
  
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
      const value = formData[key];
      if (!value || value.toString().trim() === "") return false;
  
      // Validate text area with at least 5 words
      if (field.type === "textarea") {
        const wordCount = value.trim().split(/\s+/).length;
        return wordCount >= 5;
      }
  
      return true; // All other types are valid as long as they're not empty
    }).length;
  
    // If the form is pre-filled, set progress to 100%
    if (filledEditableFields === totalEditableFields) {
      setProgress(100);
    } else {
      setProgress(
        totalEditableFields > 0
          ? Math.round((filledEditableFields / totalEditableFields) * 100)
          : 0
      );
    }
  };
  

  const isFormValid = () => {
    return progress === 100;
  };

  const getColor = (progress) => {
    if (progress <= 30) return "stroke-red-500";
    if (progress <= 70) return "stroke-orange-400";
    return "stroke-green-500";
  };

  const handleEditToggle = () => {
    setIsEditMode((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value, // Update specific field
    }));
    updateProgress(); // Recalculate progress
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
          {generalQuestions?.map((field) => (
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
          students.map((student) => (
            <div
              key={`student-${student.id}`}
              className="p-6 bg-slate-200 border border-blue-100 rounded-lg shadow-sm mb-6"
            >
              <h3 className="text-lg font-bold text-blue-900 mb-4">{`Evaluation for ${student.name}`}</h3>
              {studentQuestions?.map((field) => {
                const fieldName = `student${student.id}_${field.name}`;
                return (
                  <FormField
                    key={fieldName}
                    {...field}
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
          <Button type="submit" className="w-64" disabled={!isFormValid()}>
            Submit Evaluation
          </Button>
        </div>
      </form>
    </div>
  );
}
