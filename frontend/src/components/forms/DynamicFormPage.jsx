import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import UnifiedFormComponent from "./UnifiedFormComponent";
import EditFormComponent from "./editFormComponent";
import { formsApi } from "../../services/formAPI";

const DynamicFormPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const formID = searchParams.get("formID");
  const projectCode = searchParams.get("projectCode");
  const projectName = searchParams.get("projectName");
  const students = JSON.parse(searchParams.get("students") || "[]");

  const [formDetails, setFormDetails] = useState({
    title: "Loading...",
    description: "",
  });
  const [formQuestions, setFormQuestions] = useState([]);
  const [generalQuestions, setGeneralQuestions] = useState([]);
  const [studentQuestions, setStudentQuestions] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Extracted formID:", formID); // Debug log
    if (!user) {
      navigate("/login");
      return;
    }

    setIsAdmin(user.isAdmin === true);

    const fetchFormDetailsAndQuestions = async () => {
      setIsLoading(true);
      try {
        if (!formID) {
          throw new Error("Missing formID for fetching form data.");
        }

        console.log("Fetching form metadata and questions for formID:", formID);

        // Fetch form metadata
        const formMetadata = await formsApi.getForm(formID);
        if (!formMetadata) {
          throw new Error(`No form metadata found for formID: ${formID}`);
        }

        // Set form metadata
        setFormDetails({
          title: formMetadata.formName || "Form Title",
          description: formMetadata.description || "Form Description",
        });

        // Fetch questions
        const questions = await formsApi.getQuestions(formID);
        if (!questions || questions.length === 0) {
          throw new Error(`No questions found for formID: ${formID}`);
        }

        // Separate general and student questions
        setFormQuestions(questions);
        setGeneralQuestions(questions.filter((q) => q.reference === "general"));
        setStudentQuestions(questions.filter((q) => q.reference === "student"));
      } catch (err) {
        console.error("Error fetching form details and questions:", err);
        setError(err.message || "An error occurred while loading the form.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormDetailsAndQuestions();
  }, [formID, navigate, user]);

  const handleEdit = async (updatedFields) => {
    if (!isAdmin) return;

    try {
      await Promise.all(
        updatedFields.map((field) =>
          field.id
            ? formsApi.updateQuestion(formID, field.id, field)
            : formsApi.addQuestion(formID, field)
        )
      );
      console.log("Form updated successfully");

      // Update questions dynamically
      setGeneralQuestions(
        updatedFields.filter((q) => !q.reference || q.reference === "general")
      );
      setStudentQuestions(
        updatedFields.filter((q) => q.reference === "student")
      );
    } catch (error) {
      console.error("Error updating form:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center mt-6 text-blue-900">Loading form...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-6 text-red-500">
        {error || "Failed to load form. Please try again later."}
      </div>
    );
  }

  if (isAdmin) {
    return (
      <EditFormComponent
        formID={formID}
        formTitle={formDetails.title || ""}
        formDescription={formDetails.description || ""}
        questions={formQuestions}
        onEdit={handleEdit}
      />
    );
  } else {
    return (
      <UnifiedFormComponent
        formID={formID}
        formTitle={formDetails.title || ""}
        formDescription={formDetails.description || ""}
        questions={formQuestions}
        projectCode={projectCode}
        projectName={projectName}
        students={students}
        //isAdmin={isAdmin}
      />
    );
  }
};

export default DynamicFormPage;
